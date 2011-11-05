GlobalApp = function(_container,_options){
	this.container = _container;
	this.options = _options;
	this.children = new Array();
	//this.globalRouter = new GlobalRouter(this);
	//Backbone.history.start();
	var GApp = this;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			GlobalEvent.bind(client.EVENTS.USER_REFRESH,function(){
				GApp.globalRouter = new GlobalRouter(GApp);
				Backbone.history.start();
				if(!GApp.view.userUnitWidget)
					GApp.view.userUnitWidget = new UserUnitWidget($("#user-holder"));
					GApp.addChild(GApp.view.userUnitWidget);
				if(!GApp.view.sortMetaWidget)
					GApp.view.sortMetaWidget = new SortMetaWidget($("#filter-container"));
					GApp.addChild(GApp.view.sortMetaWidget);
				if(!GApp.view.clipWidget)
					GApp.view.clipWidget = new ClipWidget($("#contentWrapper"));
					GApp.addChild(GApp.view.clipWidget);
				if(!GApp.view.clipDetailWidget)
					GApp.view.clipDetailWidget = new ClipDetailWidget();
					GApp.addChild(GApp.view.clipDetailWidget);
				if(!GApp.view.searchWidget)
					GApp.view.searchWidget = new SearchWidget($("#search-container"));
					GApp.addChild(GApp.view.searchWidget);
				
			});
		
		//GlobalEvent = new GlobalEvent();
		/*
			if(GApp.children && GApp.children.length > 0){
				for(var i=0;i<GApp.children.length;i++){
					GApp.children.initialize();
				}
			}
		*/
		},
		render:function(){
		/*
			if(GApp.children && GApp.children.length > 0){
				for(var i=0;i<GApp.children.length;i++){
					GApp.children.render();
				}
			}
		*/
		},
		events:{
			"click #login_button":"loginCall",
			"click #register_button":"registerCall"
			//"click #updatePwd_button":"updatePwdCall",
			//"click #logout_button":"logoutCall"
		},
		loginCall:function(evt){
			if(!this.loginWidget)
				this.loginWidget = new LoginWidget($("#contactArea"));
				this.addChild(this.loginWidget);
			popUpWidget = this.popUp({width:500,height:200},this.loginWidget);
		},
		registerCall:function(evt){
			if(!this.registerWidget)
				this.registerWidget = new RegisterWidget($("#contactArea"));
				this.addChild(this.registerWidget);
			popUpWidget = this.popUp({width:500,height:200},this.registerWidget);	
		},
		popUp:function(popUpOption,_widget){
			var _clientWidth = $(_container)[0].clientWidth;
			var _clientHeight = $(_container)[0].clientHeight;
			if(this.popUpWidget){
				this.popUpWidget.setPopUpSize({popupWidth:popUpOption.width,popupHeight:popUpOption.height});
			}else{
				this.popUpWidget = new PopUpWidget(
				$("#popUp-container"),
				{
					clientWidth:_clientWidth,
					clientHeight:_clientHeight,
					contentWidth:popUpOption.width,
					contentHeight:popUpOption.height
				});
				this.addChild(this.popUpWidget);
			}
			this.popUpWidget.loadWidget(_widget);
			return this.popUpWidget;
		},
		addChild:function(child){
			GApp.addChild(child);
		}
	})
	this.view = new _view();
};

GlobalApp.prototype.initialize = function(){
	if(!this.view)
		return;
	this.view.initialize();
}

GlobalApp.prototype.render = function(){
	if(!this.view)
		return;
	this.view.render();
}
GlobalApp.prototype.addChild = function(childElement){
	if(!childElement)
		return;
	//this.view.addChild(childElement);
	this.children.push(childElement);
	childElement.parentApp = this;
}
GlobalApp.prototype.removeChild = function(childElement){
	for(var i=0;i<this.children.length;i++){
		if(childElement == this.children[i]){
			this.children.splice(i,1);
			break;
		}
	}
}
GlobalApp.prototype.popUp = function(popUpOption,_widget){
	if(!this.view)
		return;
	this.view.popUp(popUpOption,_widget);
}