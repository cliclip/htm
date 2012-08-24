App.ClipApp.Logout = (function(App, Backbone, $){
  var Logout = {};

  // 跳转到站点首页
  App.vent.bind("app.clipapp:logout", function(){
    document.cookie = "token=";
    Backbone.history.navigate();
    location.reload();
  });

  return Logout;
})(App, Backbone, jQuery);