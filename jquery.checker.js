/**
 *  html:
	<form>
	<input id=test check-trigger="blur focus change" check-len="1-20" check-reg="\\d+" check-type="num" check-message="wrong" check-ok="ok" />
	<input check-type=email check-message="not a eamai" />
	<textarea check-trigger=blur check-len=1 check-ok="ok" />
	</form>
 *	check-trigger 	: 事件，多个事件用空格隔开
 *	check-len		: 输入长度，格式可为:"n"(或"n-m")，分别表示输入长度大于等于n(或大于等于n且小于等于m)
 *	check-type		: 数据输入类型：可为email、num等;
 *	check-reg		: 数据校验正则
 *	check-message	: 校验错误时打印的信息
 *	check-ok		: 校验正确时打印的信息
 *	check-target	: jquery selector,指定信息打印的地方
 *	
 *	手动调用：var res = $("#test").check();	
 *			  res = $("form").check(); 		//校验form表单下的所有数据
 *	check方法返回boolean类型数据
 */

(function($){
	if(!$)return;

	//计算string长度，汉字长度为2
	var strLen = function(str){
		str = str || "";
		return str.length + (str.match(/[^\x00-\xff]/g)||[]).length;
	};

	var checkType = {
			officePhone : /^0\d{2,3}(-)?[1-9]\d{6,7}$/,
			mobilePhone : /^1[3|4|5|8]\d{9}$/,
			email		: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
			num			: /(^[1-9]\d*$)|(^0+[1-9]+\d*$)/,
			realNum		: /^\d+(\.\d+)?$/
		};
	
	$.fn.checkResult = function( check ,message){
		var _input = $(this);
		var html = false;
		var checkMessge = _input.parent(".inp").length == 0 ? _input : _input.parent(".inp");
		var checkClass = _input.parents(".control-group:eq(0)");
		var target = $(_input.attr("check-target"));
		
		checkClass =  checkClass.length == 0 ? _input.parent(".inp"):checkClass;
		checkClass =  checkClass.length == 0 ? _input:checkClass;
		
		checkMessge.nextAll("[check-result]").remove();
		target.empty();
		
		if( check == undefined ){
			return checkClass.removeClass("error success");
		}else if(check){
			checkClass.removeClass("error").addClass("success");
			message = message||_input.attr("check-ok");
		}
		else{
			checkClass.addClass("error").removeClass("success");
			message =  message||_input.attr("check-message");			
		}
		
		if( message ){
			html = $(message);
			html = html[0]?html:$("<span class='help-inline'>"+message+"</span>");
		}
		
		
		if(html){
			html.attr("check-result","");
			if( target.length > 0 ){
				target.html(html);
			}
			else{
				var _class = checkMessge.attr("class");
				if( _class && _class.indexOf("inp") != -1 ){
					while( checkMessge.next().length == 1 ){ checkMessge = checkMessge.next(); }
				}
				checkMessge.after(html);
			}
		}
		return this;
		
	};
	$.fn.check = function( callBack ){
		callBack = callBack || function(){};
		
		var $this = $(this);
		var $inputs = $this.find("input,textarea");
		$this.each(function(i){
			var tname =$this[i].tagName.toLowerCase();
			(tname=="input" || tname == "textarea") && 	$inputs.push($this[i]);
		});
		
		var result = true ;
		$inputs.each(function(index,input){
			var $input = $(input);
			var checkType = $input.attr("check-type");
			var checkReg  = $input.attr("check-reg");
			
			var check = true ;
			
			if(checkReg) check = check &&  $input.checkRegexp(new RegExp(checkReg));
			if(checkType)check = check && $input.checkRegexp(checkType);			
			check = check && $input.checkLength();
			
			callBack( $input ,check  ) != false && $input.checkResult(check);
			result = result && check;
		});
		
		return result ;
	};
	
	$.fn.checkLength = function(min,max){
		var result = true ;
		for( var _i = 0 ; _i < this.length ; _i++) {
			var _input = $(this[_i]);
			var checkLen = _input.attr("check-len");
			var val = (_input.val() || "");
			val = "".trim?val.trim():val;
			var len = strLen(val);
			var tmp = true;
			if(checkLen){
				checkLen = checkLen.split("-");
				min = min || Math.floor(checkLen[0]);
				max = max || Math.floor(checkLen[1]);
				
			}
			tmp = ( !$.isNumeric(min) || len >= min  )&&( !$.isNumeric(max) || len <= max ); 
			
			result = result && tmp;
		}
		return result;
	};
	
	$.fn.checkRegexp = function(type){ 
		if(this.length == 0 )return true;
		
		var reg = checkType[type] || type ;
		if( $.type(reg) != "regexp" ){
			return false ;
		}
		
		var b = true ;
		for( var i = 0 ; i < this.length ; i=i+1 ){
			var a = reg.test($(this[i]).val());
			b = b && a ;
		}
		return b ;
		
	};
	
	$.fn.bindCheckEvent = function(cb){
		$(this).find("[check-trigger]").each(function(){
			var $this = $(this);
			var trigger = $this.attr("check-trigger");
			$this.off( trigger );
			$this.on( trigger,function(){ $this.check(cb);});
		});
	};
	$(function(){
		$(document).delegate("[check-trigger]","click focus mouseover",function(){
			var $this = $(this);
			var trigger = $this.attr("check-trigger");
			$this.off( trigger );
			$this.on( trigger,function(){ $this.check();});
			$this.attr("check-trigger-delegated",trigger);
			$this.removeAttr("check-trigger");
		});
		
		$(document).delegate("[check-len],[check-type],[check-reg]","focus",function(){ $(this).checkResult() })
		$(document).delegate("[check-len],[check-type],[check-reg]","blur",function(){ $(this).check(); })
	});
})(window.jQuery);
