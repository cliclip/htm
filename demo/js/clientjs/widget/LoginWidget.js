LoginWidget = function(_container,options){
	this.container = _container;
	this.options = options;
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
			"click input[type=button]":"loginAction"
		},
		loginAction:function(evt){
			var login_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "login";
			var username = $("#username_l").val();
			var password = $("#password_l").val();
			var userInfo = new UserInfo(login_url);
			userInfo.model.set({
				name:username,
				pass:password
			});
			userInfo.model.postFunc();
			/*
			result = userInfo.model.save({
				name:username,
				pass:password
			},
			{
				success:function(){
					console.info(data);
				},
				error:function(data){
					console.info(data);
				}
			});
			console.info(result[0])
			console.info(result[1]);
			console.info(userInfo.model);
			*/
			/*
			result.error(data){
				console.info(data);
			};
			result.success(data){
				console.info(data);
			};
			*/
		}
	})
	this.view = new _view();
}
LoginWidget.prototype.render = function(){
	this.view.render();
}