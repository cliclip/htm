// app.userapp.routing.js
App.Routing.UserRouting = (function(App, Backbone){
  var UserRouting = {};

  UserRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      "user/:uid": "show",
      "register": "register",
      "login": "login"
    }
  });

  App.vent.bind("user:register", function(){
    App.Routing.showRoute("register");
  });

  App.vent.bind("user:login",function(){
    App.Routing.showRoute("login");
  });

  App.vent.bind("user:show", function(userModel){
    App.Routing.showRoute("user", userModel.id);
  });

  App.addInitializer(function(){
    UserRouting.router = new UserRouting.Router({
      controller: App.UserApp
    });
  });

  return UserRouting;
})(App, Backbone);

