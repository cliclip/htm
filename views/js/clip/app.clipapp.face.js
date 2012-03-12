// app.clipapp.face.js

App.ClipApp.Face = (function(App, Backbone, $){
  var Face = {};
  Face.showUser = function(uid){
    if(uid){
      getUser(uid, function(user){
	App.vent.trigger("app.clipapp.face:show", user);
      });
    }else{
      App.faceRegion.close();
    }
  }

  App.vent.bind("app.clipapp.face:show", function(user){
    var faceView = new FaceView({model: user});
    App.faceRegion.show(faceView);
  });

  return Face;
})(App, Backbone, jQuery);