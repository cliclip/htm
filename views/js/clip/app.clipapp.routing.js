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

      "register": "register",
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

      // my
      "my":"myShow",
      "my/tag/:tag":"myShow",
      "my/query/:word":"myQuery",
      "my/following":"userFollowing",
      "my/follower":"userFollower",

      "my/recommend":"myRecommend",
      "my/recommend/tag/:tag":"myRecommend",
      "my/interest":"myInterest",
      "my/interest/tag/:tag":"myInterest",
      "my/setup":"mySetup"
    }
  });

  //输入内容搜索，返回显示结果需要更新hash
  App.vent.bind("app.clipapp.routing:query",function(word){
    if($.browser.safari){word = encodeURI(word);}
    var now_href = window.location.href;
    if(/my/.test(now_href)){
      App.Routing.showRoute("my/query",word);
    }else{
      App.Routing.showRoute("query",word);
    }
  });

  App.vent.bind("app.clipapp.routing:siteshow", function(tag){
    if($.browser.safari){tag = encodeURI(tag);}
    App.Routing.showRoute("tag", tag);
  });

  App.vent.bind("app.clipapp.routing:usershow", function(uid, tag){
    if(App.util.self(uid)){
      App.util.current_page("my");
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("my", "tag", tag);
      }else{
	App.Routing.showRoute("my");
      }
    }else{
      App.util.current_page("");
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("user", uid, "tag", tag);
      }else{
	App.Routing.showRoute("user", uid);
      }
    }
  });

  App.vent.bind("app.clipapp.routing:userfollowing",function(uid){
    if(App.util.self(uid)){
      App.Routing.showRoute("my","following");
    }else{
      App.Routing.showRoute("user",uid, "following");
    }
  });
  App.vent.bind("app.clipapp.routing:userfollower",function(uid){
    if(App.util.self(uid)){
      App.Routing.showRoute("my","follower");
    }else{
      App.Routing.showRoute("user",uid, "follower");
    }
  });

  App.vent.bind("app.clipapp.routing:myquery",function(word){
    if($.browser.safari){word = encodeURI(word);}
  });

  App.vent.bind("app.clipapp.routing:interest",function(tag){
    if(tag){
      if($.browser.safari){tag = encodeURI(tag);}
      App.Routing.showRoute("my/interest", "tag", tag);
    }else{
      App.Routing.showRoute("my/interest");
    }
  });

  App.vent.bind("app.clipapp.routing:recommend",function(tag){
    if(tag){
      if($.browser.safari){tag = encodeURI(tag);}
      App.Routing.showRoute("my/recommend", "tag", tag);
    }else{
      App.Routing.showRoute("my/recommend");
    }
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
