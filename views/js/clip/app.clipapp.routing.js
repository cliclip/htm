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
  App.vent.bind("app.clipapp.routing:sitequery",function(word){
    if($.browser.safari){word = encodeURI(word);}
    App.Routing.showRoute("query",word);
  });
  App.vent.bind("app.clipapp.routing:siteshow", function(tag){
    App.Routing.showRoute("tag", tag);
  });

  App.vent.bind("app.clipapp.routing:usershow", function(uid){
    App.Routing.showRoute("user", uid);
  });
  App.vent.bind("app.clipapp.routing:usertag_show", function(uid, tag){
    if($.browser.safari){tag = encodeURI(tag);}
    App.Routing.showRoute("user", uid, "tag", tag);
  });
  App.vent.bind("app.clipapp.routing:userfollowing",function(uid){
    App.Routing.showRoute("user",uid, "following");
  });
  App.vent.bind("app.clipapp.routing:userfollower",function(uid){
    App.Routing.showRoute("user",uid, "follower");
  });

  App.vent.bind("app.clipapp.routing:myshow", function(){
    App.Routing.showRoute("my");
  });
  App.vent.bind("app.clipapp.routing:myquery",function(word){
    if($.browser.safari){word = encodeURI(word);}
    App.Routing.showRoute("my/query",word);
  });
  App.vent.bind("app.clipapp.routing:mytag_show",function(tag){
    if($.browser.safari){tag = encodeURI(tag);}
    App.Routing.showRoute("my", "tag", tag);
  });
  App.vent.bind("app.clipapp.routing:myfollowing",function(){
    App.Routing.showRoute("my","following");
  });
  App.vent.bind("app.clipapp.routing:myfollower",function(){
    App.Routing.showRoute("my","follower");
  });
  App.vent.bind("app.clipapp.routing:interest",function(){
    App.Routing.showRoute("my/interest");
  });
  App.vent.bind("app.clipapp.routing:interest_tag",function(tag){
    if($.browser.safari){tag = encodeURI(tag);}
    App.Routing.showRoute("my/interest", "tag", tag);
  });
  App.vent.bind("app.clipapp.routing:recommend", function(){
    App.Routing.showRoute("my/recommend");
  });
  App.vent.bind("app.clipapp.routing:recommend_tag",function(tag){
    if($.browser.safari){tag = encodeURI(tag);}
    App.Routing.showRoute("my/recommend", "tag", tag);
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
