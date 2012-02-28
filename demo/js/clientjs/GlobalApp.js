GlobalApp = function(_container,_options){
  this.container = _container;
  this.options = _options;
  this.children = new Array();
  this.globalRouter = new GlobalRouter(this);
  Backbone.history.start();
  var GApp = this;
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
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
    },
    events:{
      "click #register_button":"registerCall",
      "click #login_button":"loginCall",
      //"click #updatePwd_button":"updatePwdCall",
      //"click #logout_button":"logoutCall",
      "click #comment_button":"commentCall",
      "click #recomment_button":"recommentCall",
      "click #collect_button":"collectCall",
      "click #organize_button":"organizeCall",
      "click #del_button":"deleteCall"
    },

    loginCall:function(evt){
      if(!GApp.loginWidget){
	GApp.loginWidget = new LoginWidget($("#contactArea"));
	GApp.addChild(GApp.loginWidget);
      }
      //var popUpWidget = this.popUp({width:500,height:200},GApp.loginWidget);
      this.popUp({width:500,height:200},GApp.loginWidget);
    },
    registerCall:function(evt){
      if(!GApp.registerWidget){
	GApp.registerWidget = new RegisterWidget($("#contactArea"));
	GApp.addChild(GApp.registerWidget);
      }
      //var popUpWidget=this.popUp({width:500,height:200},GApp.registerWidget);
      this.popUp({width:500,height:200},GApp.registerWidget);
    },
    commentCall:function(evt){
      if(!GApp.commentWidget){
	GApp.commentWidget = new CommentWidget($("#contactArea"));
	GApp.addChild(GApp.commentWidget);
      }
      this.popUp({width:500,height:200},GApp.commentWidget);
    },

    deleteCall:function(evt){
      if(!GApp.deleteWidget){
	GApp.deleteWidget = new DeleteWidget($("#contactArea"));
	GApp.addChild(GApp.deleteWidget);
      }
      this.popUp({width:200,height:200},GApp.deleteWidget);
    },

    collectCall:function(evt){
      if(!GApp.collectWidget){
        GApp.collectWidget = new CollectWidget($("#contactArea"));
        GApp.addChild(GApp.collectWidget);
      }
      this.popUp({width:300,height:300},GApp.collectWidget);
    },

    recommentCall:function(evt){
      if(!GApp.recommentWidget){
        GApp.recommentWidget = new RecommentWidget($("#contactArea"));
        GApp.addChild(GApp.recommentWidget);
      }
      this.popUp({width:500,height:200},GApp.recommentWidget);
    },

    organizeCall:function(evt){
      if(!GApp.organizeWidget){
        GApp.organizeWidget = new OrganizeWidget($("#contactArea"));
        GApp.addChild(GApp.organizeWidget);
      }
      this.popUp({width:300,height:300},GApp.organizeWidget);
    },

    popUp:function(popUpOption,_widget){
      var _clientWidth = $(_container)[0].clientWidth;
      var _clientHeight = $(_container)[0].clientHeight;
      if(GApp.popUpWidget){
	GApp.popUpWidget.setPopUpSize({popupWidth:popUpOption.width,popupHeight:popUpOption.height});
      }else{
	GApp.popUpWidget = new PopUpWidget(
	  $("#popUp-container"),
	  {
	    clientWidth:_clientWidth,
	    clientHeight:_clientHeight,
	    contentWidth:popUpOption.width,
	    contentHeight:popUpOption.height
	});
	GApp.addChild(GApp.popUpWidget);
      }
      GApp.popUpWidget.loadWidget(_widget);
      return GApp.popUpWidget;
    },
    addChild:function(child){
      GApp.addChild(child);
    }
    });
  this.view = new _view();
  GlobalEvent.bind(client.EVENTS.USER_REFRESH,function(){
	/*
	 console.info(evtObj);
	 evtObj.globalRouter = new GlobalRouter(evtObj);
	 $("#nav").css("display","none");
	 if(!evtObj.userUnitWidget)
	 evtObj.userUnitWidget = new UserUnitWidget($("#rightNavDefault"));
	 evtObj.addChild(evtObj.userUnitWidget);
	 if(!evtObj.sortMetaWidget)
	 evtObj.sortMetaWidget = new SortMetaWidget($("#sort-container"));
	 evtObj.addChild(evtObj.sortMetaWidget);
	 if(!evtObj.clipWidget)
	 evtObj.clipWidget = new ClipWidget($("#contentWrapper"));
	 evtObj.addChild(evtObj.clipWidget);
	 if(!evtObj.clipDetailWidget)
	 evtObj.clipDetailWidget = new ClipDetailWidget();
	 evtObj.addChild(evtObj.clipDetailWidget);
	 if(!evtObj.searchWidget)
	 evtObj.searchWidget = new SearchWidget($("#search-container"));
	 evtObj.addChild(evtObj.searchWidget);
       */
    this.globalRouter = new GlobalRouter(this);
    // Backbone.history.start();
    $("#nav").css("display","none");
    $("#sort-container").css("display","");
    if(!this.userUnitWidget){
      this.userUnitWidget = new UserUnitWidget($("#rightNavDefault"));
      this.addChild(this.userUnitWidget);
    }
     //该参数**
    if(!this.userEmailWidget){
      this.userEmailWidget = new UserEmailWidget();
      this.addChild(this.userEmailWidget);
    }
    if(!this.sortMetaWidget){
      this.sortMetaWidget = new SortMetaWidget($("#sort-container"));
      this.addChild(this.sortMetaWidget);
    }
/*    if(!this.recomWidget){
      this.recomWidget = new RecomWidget($("#contentWrapper"));
      this.addChild(GApp.recomWidget);
    }
    if(!this.clipWidget){
      this.clipWidget = new ClipWidget($("#contentWrapper"));
      this.addChild(this.clipWidget);
    }
*/
    if(!this.clipDetailWidget){
      this.clipDetailWidget = new ClipDetailWidget();
      this.addChild(this.clipDetailWidget);
    }
    if(!this.clipAddWidget){
      this.clipAddWidget = new ClipAddWidget();
      this.addChild(this.clipAddWidget);
    }
    if(!this.searchWidget){
      this.searchWidget = new SearchWidget($("#search-container"));
      this.addChild(this.searchWidget);
    }
  },this);
  GlobalEvent.bind(client.EVENTS.USER_LOGOUT,function(){
    this.globalRouter = null;
    $("#nav").css("display","");
    $("#sort-container").css("display","none");
    if(this.userUnitWidget){
      this.userUnitWidget.terminalize();
    }
    if(this.userEmailWidget){
      this.userEmailWidget.terminalize();
    }
    if(this.sortMetaWidget){
      this.sortMetaWidget.terminalize();
    }
    if(this.clipDetailWidget){
      this.clipDetailWidget.terminalize();
    }
    if(this.clipAddWidget){
      this.clipAddWidget.terminalize();
    }
    if(this.searchWidget){
      this.searchWidget.terminalize();
    }
    if(this.clipWidget){
      this.clipWidget.terminalize();
    }
    location.href="";
    //this.terminalize();
  },this);

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
  for(var i=this.children.length-1;i>-1;i--){
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
GlobalApp.prototype.lazyLoad = function(url, start, end){
  if(!this.globalRouter)
    return;
  this.globalRouter.router.listByImpl(url, start, end);
}
GlobalApp.prototype.lazyLoadRecom = function(url, start, end){
  if(!this.globalRouter)
    return;
  this.globalRouter.router.listByImpl_recom(url, start, end);
};

