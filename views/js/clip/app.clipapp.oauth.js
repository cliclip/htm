// app.clipapp.oauth.js

App.ClipApp.Oauth = (function(App, Backbone, $){
  var Oauth = {};
  Oauth.process=function(){
    checkUser(function(err,res){
      if(err){
	 Backbone.history.navigate("",true);
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


  // TEST
  //App.bind("initialize:after", function(){ Login.show(); });

 return Oauth;
})(App, Backbone, jQuery);