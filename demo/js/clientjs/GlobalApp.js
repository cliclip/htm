GlobalApp = function(_container,_options){
	this.container = _container;
	this.options = _options;
	this.children = new Array();
	this.domMapping = null;
	var GApp = this;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			if(GApp.children && GApp.children.length > 0){
				for(var i=0;i<GApp.children.length;i++){
					GApp.children.initialize();
				}
			}
		},
		render:function(){
			if(GApp.children && GApp.children.length > 0){
				for(var i=0;i<GApp.children.length;i++){
					GApp.children.render();
				}
			}
		},
		events:{
			"click #login_button":"loginCall",
			"click #register_button":"registerCall"
		},
		loginCall:function(evt){
			console.info("login start...");
			loginWidget = new LoginWidget($("#contactArea"));
			popUpWidget = this.popUp({width:500,height:200});
			popUpWidget.loadWidget(loginWidget);
			//popUpWidget.render();
			console.info("login finished...");
		},
		registerCall:function(evt){
			console.info("register start...");
			registerWidget = new RegisterWidget($("#contactArea"));
			popUpWidget = this.popUp({width:500,height:200});
			popUpWidget.loadWidget(registerWidget);
			console.info("register finished...");
		},
		popUp:function(popUpOption){
			var _clientWidth = $(_container)[0].clientWidth;
			var _clientHeight = $(_container)[0].clientHeight;
			popUpWidget = new PopUpWidget(
			$("#popUp-container"),
			{
				clientWidth:_clientWidth,
				clientHeight:_clientHeight,
				contentWidth:popUpOption.width,
				contentHeight:popUpOption.height
			});
			return popUpWidget;
		}
	})
	this.view = new _view();
};

GlobalApp.prototype.initialize = function(){
	this.view.initialize();
}

GlobalApp.prototype.render = function(){
	this.view.render();
}
GlobalApp.prototype.addChild = function(childElement){
	this.children.add(childElement);
}