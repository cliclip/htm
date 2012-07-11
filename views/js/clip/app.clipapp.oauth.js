// app.clipapp.oauth.js

App.ClipApp.Oauth = (function(App, Backbone, $){
  var Oauth = {};
  Oauth.process=function(){
    checkUser(function(err,res){
      if(err&&err.hasbind_err){
	App.vent.trigger("app.clipapp.message:confirm", "account_hasbind");
	Backbone.history.navigate("my",true);
      }else if(res&&res.oauth){
	App.vent.trigger("app.clipapp.userbind:show",res.oauth,"");
      }else if(res&&res.token){
	App.vent.trigger("app.clipapp.login:success", res);
      }else{
	App.vent.unbind("app.clipapp.message:sure");
	App.vent.unbind("app.clipapp.message:cancel");
	App.vent.trigger("app.clipapp.message:alert", "oauth_fail");
	App.vent.bind("app.clipapp.message:sure",function(){
	  var my=App.util.getMyUid();
	  if(my)  Backbone.history.navigate("my",true);
	  else    Backbone.history.navigate("register",true);
	});
	App.vent.bind("app.clipapp.message:cancel",function(){
	  Backbone.history.navigate("",true);
	});
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
	callback(error,null);
      }
    });

  };
 return Oauth;
})(App, Backbone, jQuery);