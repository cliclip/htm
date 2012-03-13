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

      // "register": "register",
      // "login": "login",

      // user

      "user/:uid": "userShow",
      "user/:uid/tag/:tag":"userShow",
      "user/:uid/following":"userFollowing",
      "user/:uid/follower":"userFollower",

      // my

      "my":"myShow",
      "my/tag/:tag":"myShow",
      "my/query/:word":"myQuery",
      "my/recommend":"myRecommend",
      "my/recommend/tag/:tag":"myRecommend",
      "my/interest":"myInterest",
      "my/interest/tag/:tag":"myInterest"
      // "my/setup":"mySetup"
    }
  });

  App.vent.bind("clip:preview:show",function(uid){
    if(uid){
      App.Routing.showRoute("user", uid);
    }else{
      App.Routing.showRoute("my");
    }
  });

  App.vent.bind("tag:show",function(tag){
    App.Routing.showRoute("tag", tag);
  });

  App.vent.bind("user:tag:show",function(uid,tag){
      App.Routing.showRoute("user", uid, tag);
  });
  //输入内容搜索，返回显示结果需要更新hash
  App.vent.bind("search:show",function(){
      App.Routing.showRoute("search");
  });

  //登陆后自动显示clip列表需要更新hash
  App.vent.bind("my:clip:preview:show",function(){
    App.Routing.showRoute("my");
  });

  App.vent.bind("my:tag:show",function(tag){
    App.Routing.showRoute("my", tag);
  });

  App.vent.bind("interest:show",function(){
      App.Routing.showRoute("my");
  });

  App.vent.bind("recommend:show",function(start,end){
    App.Routing.showRoute("my", start + ".." + end);
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
