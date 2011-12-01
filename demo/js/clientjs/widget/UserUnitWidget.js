UserUnitWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	uuWidget = this;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($("#userUnit_template").html(),{name:client.GLOBAL_CACHE["userInfo"].name});
			this.el.html(template);
		},
		events:{
			"mouseover":"showOptions",
			"mouseout":"hideOptions",
			"click #updatePwd_button":"updatePwd",
			"click #logout_button":"logoutAction"
		},
		showOptions:function(){
			$("#userOption").css("display","");
		},
		hideOptions:function(){
			$("#userOption").css("display","none");
		},
		updatePwd:function(){
			if(!uuWidget.parentApp.view.updatePwdWidget)
				updatePwdWidget = new UpdatePwdWidget("#contactArea");
				uuWidget.parentApp.view.updatePwdWidget = updatePwdWidget;
				uuWidget.addChild(updatePwdWidget);
			uuWidget.parentApp.popUp({width:500,height:200},updatePwdWidget);
		},
		logoutAction:function(){
			client.GLOBAL_CACHE["userInfo"] = null;
			client.GLOBAL_CACHE["token"] = null;
			document.cookie = "";
			GlobalEvent.trigger(client.EVENTS.USER_LOGOUT);
			this.remove();
		},
	})
	this.view = new _view();
}
UserUnitWidget.prototype.render = function(){
	if(!this.view)
		return;
	this.view.render();
}
UserUnitWidget.prototype.addChild = function(childElement){
	if(!this.parentApp)
		return;
	this.parentApp.addChild(childElement);
}
UserUnitWidget.prototype.removeChild = function(childElement){
	this.parentApp.view.updatePwdWidget = null;
	this.parentApp.removeChild(childElement);
}