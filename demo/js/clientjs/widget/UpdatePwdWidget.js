﻿UpdatePwdWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($("#updatePwd_template").html(),{});
			this.el.html(template);
		},
		events:{
			"click #updatePwdAction_button":"updatePwdAction"
		},
		updatePwdAction:function(evt){
			var updatePwd_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/passwd";
			var o_password = $("#o_password").val();
			var n_password = $("#n_password").val();
			//var userInfo = new UserInfo(updatePwd_url);
			widget = this;
			RequestUtil.postFunc({
				url:updatePwd_url,
				data:{
					oldpass:o_password,
					pass:n_password,
					token:client.GLOBAL_CACHE["token"]
				},
				successCallBack:function(response){
					if(response[0] == 0){
						client.GLOBAL_CACHE["userInfo"].pass = n_password;
						client.GLOBAL_CACHE["token"] = response[1];
						document.cookie = "token="+client.GLOBAL_CACHE["token"];
						widget.el.html(client.MESSAGES["auth_success"]);
						setTimeout(function(){
							GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE)
						},2000);
					}else{
						mcode = response[1];
						widget.el.html(client.MESSAGES[mcode] || mcode );
					}
				},
				erroeCallBack:function(response){
					var mcode = response;
					widget.el.html(client.MESSAGES[mcode] || mcode);
				}
			});		
		}
	})
	this.view = new _view();
}
UpdatePwdWidget.prototype.render = function(){
	this.view.render();
}