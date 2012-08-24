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

      "register": "showRegister",
      "invite/:key" : "invite",
      "active/:key": "active",
      "password/find":"findpasswd",
      "password/reset/:link":"resetpasswd",
      "oauth/callback":"oauth",
      "error/:message":"error",
      // user
      "user/:uid": "userShow",
      "user/:uid/tag/:tag":"userShow",
      "user/:uid/following":"userFollowing",
      "user/:uid/follower":"userFollower",

      "user/:uid/query/:word":"userQuery",
      "user/:uid/query":"userQuery",
      "my/query/:word":"myQuery",
      "my/query":"myQuery",

      // my
      "my":"myShow",
      "my/tag/:tag":"myShow",
      "my/following":"userFollowing",
      "my/follower":"userFollower",

      //"my/recommend":"myRecommend",
      //"my/recommend/tag/:tag":"myRecommend",
      "my/interest":"myInterest",
      "my/interest/tag/:tag":"myInterest",
      // "my/setup":"mySetup",

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
	if(App.util.self(uid)){
	  App.Routing.showRoute("my/query",word);
	}else{
	  App.Routing.showRoute("user", uid, "query",word);
	}
      }else{
	App.Routing.showRoute("query",word);
      }
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
      if(App.util.self(uid)){
	if(tag){
	  if($.browser.safari){tag = encodeURI(tag);}
	  App.Routing.showRoute("my", "tag", tag);
	}else{
	  App.Routing.showRoute("my");
	}
      }else{
	if(tag){
	  if($.browser.safari){tag = encodeURI(tag);}
	  App.Routing.showRoute("user", uid, "tag", tag);
	}else{
	  App.Routing.showRoute("user", uid);
	}
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:userfollowing",function(uid){
      if(App.util.self(uid)){
	App.Routing.showRoute("my","following");
      }else{
	App.Routing.showRoute("user",uid, "following");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:userfollower",function(uid){
      if(App.util.self(uid)){
	App.Routing.showRoute("my","follower");
      }else{
	App.Routing.showRoute("user",uid, "follower");
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
