LoginWidget = function(contaier,options){
	this.container = container;
	this.options = options;
	this.view = new Backbone.View.extend({
		el:$(container),
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($("#login_template").html(),{});
			this.el.html(template);
		},
		events:{
			"click input[type=button]":"loginAction"
		},
		loginAction:function(evt){
			var login_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "login";
			var username = $("#username_l").val();
			var password = $("#password_l").val();
			var userInfo = new UserInfo(login_url);
			userInfo.set(name,username);
			userInfo.set(pass,password);
			result = userInfo.save();
			console.info(result);
		}
	})
}
LoginWidget.prototype.render = function(){
	this.view.render();
}