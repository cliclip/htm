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
      "my/recommend":"myRecommend",
      "my/recommend/tag/:tag":"myRecommend",
      "my/interest":"myInterest",
      "my/interest/tag/:tag":"myInterest",
      "my/setup":"mySetup"
    }
  });
/*
  App.vent.bind("app.clipapp.routing:usercliplist:show",function(uid){
    App.Routing.showRoute("user", uid);
  });

  App.vent.bind("tag:show",function(tag){
    App.Routing.showRoute("tag", tag);
  });

  App.vent.bind("user:tag:show",function(uid,tag){
      App.Routing.showRoute("user", uid, tag);
  });
*/
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


/*
  App.vent.bind("my:tag:show",function(tag){
    App.Routing.showRoute("my", tag);
  });

  App.vent.bind("interest:show",function(){
      App.Routing.showRoute("my");
  });

  App.vent.bind("recommend:show",function(start,end){
    App.Routing.showRoute("my", start + ".." + end);
  });
*/

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
