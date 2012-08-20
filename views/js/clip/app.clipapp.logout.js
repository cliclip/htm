App.ClipApp.Logout = (function(App, Backbone, $){
  var Logout = {};

  Logout.show = function(){
    //document.cookie = null;
    document.cookie = "token=";
     // 跳转到站点首页
    Backbone.history.navigate();
    location.reload();
  };
			
  return Logout;
})(App, Backbone, jQuery);