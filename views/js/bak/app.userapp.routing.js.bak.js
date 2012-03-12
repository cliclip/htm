// app.userapp.routing.js

App.Routing.UserRouting = (function(App, Backbone){
  var UserRouting = {};

  UserRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      "user/:uid": "show"
    }
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

