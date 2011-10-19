GlobalApp = function(_container,_options){
	this.container = _container;
	this.options = _options;
	this.children = new Array();
	this.domMapping = null;
	var GApp = this;
	this.view = new Backbone.View.extend({
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
			"click #register_button":"registerCall",
		},
		loginCall:function(evt){
			loginWidget = new LoginWidget($("#contactArea"));
			popUpWidget = this.popUp({width:600,height:500});
			popUpWidget.loadWidget(loginWidget);
			//popUpWidget.render();
		},
		registerCall:function(evt){
			registerWidget = new RegisterWidget($("#contactArea"));
			popUpWidget = this.popUp({width:600,height:500});
			popUpWidget.loadWidget(registerWidget);
		},
		popUp:function(popUpOption){
			var _clientWidth = $(_container)[0].clientWidth;
			var _clientHeight = $(_container)[0].clientHeight;
			popUpWidget = new PopUPWidget(
			$("popUp-container"),
			{
				clientWidth:_clientWidth,
				clientHeight:_clientHeight,
				contentWidth:popUpOption.width,
				contentHeight:popUpOption.height
			});
			return popUpWidget;
		}
	})
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