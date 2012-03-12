// app.clipapp.routing.js

App.Routing.ClipRouting = (function(App, Backbone){
  var ClipRouting = {};

  ClipRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      "clip/:cid": "showDetail"
    }
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
