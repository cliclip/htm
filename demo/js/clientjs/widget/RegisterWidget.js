RegisterWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($("#register_template").html(),{});
			this.el.html(template);
		},
		events:{
			"click input[type=button]":"registerAction",
			"change input[type=text]" :"userNameValidation",
			"keyup input[type=password]" : "passwordValidation"
		},
		registerAction:function(evt){
			var register_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "register";
			var username = $("#username_r").val();
			var password = $("#password_r").val();
			var userInfo = new UserInfo(register_url);
			userInfo.model.set({
				name:username,
				pass:password
			});
			userInfo.model.postFunc();
		},
		userNameValidation:function(evt){
		
		},
		passwordValidation:function(evt){
		
		}
	})
	this.view = new _view();
}
RegisterWidget.prototype.render = function(){
	this.view.render();
}