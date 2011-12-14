LoginWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	this.widgetType = "LoginWidget";
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($("#login_template").html(),{});
			this.el.html(template);
		},
		events:{
			"click #loginAction_button":"loginAction"
		},
		loginAction:function(evt){
			var login_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "login";
			var username = $("#username_l").val();
			var password = $("#password_l").val();
			var userInfo = new UserInfo(login_url);
			var widget = this;
			userInfo.loginAction({
					name:username,
					pass:password
				},
				{viewCallBack:function(status,infoText){
						if(status == 0){
							widget.el.html(infoText);
							GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
						}else{
							widget.el.children().find("span.action-info.name").html(infoText.name ? infoText.name : "");
							widget.el.children().find("span.action-info.pass").html(infoText.pass ? infoText.pass : "");
						}
					}
				}
			);		
		}
	})
	this.view = new _view();
}
LoginWidget.prototype.initialize = function(){
	this.view.initialize();
}
LoginWidget.prototype.terminalize = function(){
	this.view.el.empty();
	this.parentApp.removeChild(this);
	this.parentApp.loginWidget = null;
}
LoginWidget.prototype.render = function(){
	this.view.render();
}