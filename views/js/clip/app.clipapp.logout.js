App.ClipApp.Logout = (function(App, Backbone, $){
  var Logout = {};

  Logout.action = function(){
    App.vent.trigger("app.clipapp.logout.success");
  };

  Logout.show = function(uid){
    App.vent.trigger("app.clipapp.logout.success");
  };

  App.vent.bind("app.clipapp.logout:success", function(){
    document.cookie = null;
  });
})(App, Backbone, jQuery);