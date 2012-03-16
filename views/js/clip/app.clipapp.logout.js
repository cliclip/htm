App.ClipApp.Logout = (function(App, Backbone, $){
  var Logout = {};

  Logout.show = function(uid){
    App.vent.trigger("app.clipapp.logout:success");
  };

  App.vent.bind("app.clipapp.logout:success", function(){
    document.cookie = null;
    // 跳转到站点首页
    Backbone.history.navigate();
    location.reload();
  });
  return Logout;
})(App, Backbone, jQuery);