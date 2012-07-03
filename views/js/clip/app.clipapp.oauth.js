// app.clipapp.oauth.js

App.ClipApp.Oauth = (function(App, Backbone, $){
  var Oauth = {};
  Oauth.process=function(){
    checkUser(function(err,res){
      if(err){
	App.vent.unbind("app.clipapp.message:sure");
	App.vent.unbind("app.clipapp.message:cancel");
	App.vent.trigger("app.clipapp.message:alert", "oauth_fail");
	App.vent.bind("app.clipapp.message:sure",function(){
	  window.location.href="/oauth/req/twitter?force_login=true";
	});
	App.vent.bind("app.clipapp.message:cancel",function(){
	  Backbone.history.navigate("",true);
	});
      }else if(res.token){
	App.vent.trigger("app.clipapp.login:success", res);
      }else{
	App.vent.trigger("app.clipapp.userbind:show",res.oauth,"");
      }
    });
  };
  function checkUser(callback){
    var model = new App.Model.UserBindModel();
    model.save({},{
      url : App.ClipApp.Url.base+"/user/oauth_info",
      type: "POST",
      success:function(model,res){
	callback(null,res);
      },
      error:function(model,error){
	callback("Error",null);
      }
    });

  };
 return Oauth;
})(App, Backbone, jQuery);