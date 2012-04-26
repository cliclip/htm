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
  App.vent.bind("app.clipapp.routing:query:show",function(word){
    App.Routing.showRoute("query",word);
  });

  App.vent.bind("app.clipapp.routing:myquery:show",function(word){
    App.Routing.showRoute("my","query",word);
  });

  App.vent.bind("app.clipapp.routing:usercliplist:show", function(uid){
    App.Routing.showRoute("user", uid);
  });

  //登陆后自动显示clip列表需要更新hash
  App.vent.bind("app.clipapp.routing:mycliplist:show",function(){
    App.Routing.showRoute("my");
  });

  App.vent.bind("app.clipapp.routing:myfollowinglist:show",function(){
    App.Routing.showRoute("my","following");
  });

  App.vent.bind("app.clipapp.routing:myfollowerlist:show",function(){
    App.Routing.showRoute("my","follower");
  });

  App.vent.bind("app.clipapp.routing:userfollowinglist:show",function(uid){
    App.Routing.showRoute("user",uid, "following");
  });

  App.vent.bind("app.clipapp.routing:userfollowerlist:show",function(uid){
    App.Routing.showRoute("user",uid, "follower");
  });

  App.vent.bind("app.clipapp.routing:interest:show",function(tag){
    App.Routing.showRoute("my/interest", tag);
  });

  App.vent.bind("app.clipapp.routing:recommend:show",function(tag){
    App.Routing.showRoute("my/recommend", tag);
  });

  App.vent.bind("app.clipapp.routing:siteshow:show", function(tag){
    App.Routing.showRoute(tag);
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
