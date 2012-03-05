// app.clippreviewapp.routing.js
App.Routing.ClipPreviewRouting = (function(App, Backbone){
  var ClipPreviewRouting = {};

  ClipPreviewRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      "user/:uid/clip/:start..:end": "show"
    }
  });

  App.addInitializer(function(){
    //console.info("addInitializer!!!!!!!!!!!");
    ClipPreviewRouting.router = new ClipPreviewRouting.Router({
      controller: App.ClipPreviewApp
    });
  });

  return ClipPreviewRouting;
})(App, Backbone);
