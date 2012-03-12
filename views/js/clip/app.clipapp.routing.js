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

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
