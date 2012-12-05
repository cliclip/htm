// app.clipapp.routing.js

App.Routing.ClipRouting = (function(App, Backbone){
  var ClipRouting = {};

  ClipRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      // site
      "":"siteShow",
      "home":"siteShow",
      "tag/:tag":"siteShow",
      "query/:word":"siteQuery",
      "help/:item":"help",

      "register": "showRegister",
      "invite/:key" : "invite",
      "active/:key": "active",
      "link/:link": "consumeLink",
      "password/find":"findpasswd",
      "oauth/callback/:key":"oauth",
      "error/:message":"error",
      // my
      "my":"myShow",
      "my/tag/:tag":"myShow",
      "my/following":"userFollowing",
      "my/follower":"userFollower",

      "my/query/:word":"myQuery",
      "my/query":"myQuery",

      //"my/recommend":"myRecommend",
      //"my/recommend/tag/:tag":"myRecommend",
      "my/interest":"myInterest",
      "my/interest/tag/:tag":"myInterest",
      // "my/setup":"mySetup",

      // user
      ":uid": "userShow",
      ":uid/tag/:tag":"userShow",
      ":uid/following":"userFollowing",
      ":uid/follower":"userFollower",

      ":uid/query/:word":"userQuery",
      ":uid/query":"userQuery",

      "clip/:uid/:clipid":"clipDetail"

    }
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });

    //输入内容搜索，返回显示结果需要更新hash
    ClipRouting.router.bind("app.clipapp.routing:query",function(word, uid){
      if($.browser.safari){word = encodeURI(word);}
      if(uid){
	if(App.ClipApp.isSelf(uid)){
	  App.Routing.showRoute("my/query",word);
	}else{
	  App.Routing.showRoute(uid, "query",word);
	}
      }else{
	App.Routing.showRoute("query",word);
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:help",function(item){
      App.Routing.showRoute("help/"+item);
    });

    ClipRouting.router.bind("app.clipapp.routing:siteshow", function(tag){
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("tag", tag);
      }else{
	App.Routing.showRoute("");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:usershow", function(uid, tag){
      if(App.ClipApp.isSelf(uid)){
	if(tag){
	  if($.browser.safari){tag = encodeURI(tag);}
	  App.Routing.showRoute("my", "tag", tag);
	}else{
	  App.Routing.showRoute("my");
	}
      }else{
	if(tag){
	  if($.browser.safari){tag = encodeURI(tag);}
	  App.Routing.showRoute(uid, "tag", tag);
	}else{
	  App.Routing.showRoute(uid);
	}
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:userfollowing",function(uid){
      if(App.ClipApp.isSelf(uid)){
	App.Routing.showRoute("my","following");
      }else{
	App.Routing.showRoute(uid, "following");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:userfollower",function(uid){
      if(App.ClipApp.isSelf(uid)){
	App.Routing.showRoute("my","follower");
      }else{
	App.Routing.showRoute(uid, "follower");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:interest",function(tag){
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("my/interest", "tag", tag);
      }else{
	App.Routing.showRoute("my/interest");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:recommend",function(tag){
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("my/recommend", "tag", tag);
      }else{
	App.Routing.showRoute("my/recommend");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:clipdetail",function(uid,cid){
      App.Routing.showRoute("clip", uid, cid);
    });
  });


  return ClipRouting;
})(App, Backbone);
