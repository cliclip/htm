// app.clipapp.routing.js

App.Routing.ClipRouting = (function(App, Backbone){
  var ClipRouting = {};

  ClipRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      "clip/:cid": "showDetail",
      "user/:uid/clip/:start..:end": "showPreview"
    }
  });

  // 路由mark
  App.vent.bind("clip:showDetail", function(cid){
    App.Routing.showRoute("clip", cid);
  });

  App.vent.bind("clip:showPreview", function(previewList){
    var url = previewList.get("url");
    App.Routing.showRoute("", url);
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });
  });

  return ClipRouting;
})(App, Backbone);
