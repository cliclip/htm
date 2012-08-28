// app.clipapp.oauth.js

App.ClipApp.Oauth = (function(App, Backbone, $){
  var Oauth = {};
  Oauth.process=function(){
    checkUser(function(err,res){
      if(err&&err.hasbind_err){
	App.ClipApp.showConfirm("account_hasbind");
	Backbone.history.navigate("my",true);
      }else if(res&&res.oauth){
	App.ClipApp.showUserBind(res.oauth);
      }else if(res&&res.token){
	if(res.provider == "weibo"){
	  App.ClipApp.showConfirm("weibo_sucmsg",res.name);
	}else if(res.provider == "twitter"){
	  App.ClipApp.showConfirm("twitter_sucmsg",res.name);
	}
	delete res.provider;
	delete res.name;
	App.vent.trigger("app.clipapp.login:success",res);
	setTimeout(function(){
	  App.ClipApp.showUserEdit();
	},0);
      }else{
	App.ClipApp.showAlert("oauth_fail",null,function(){
	  if(App.ClipApp.isLoggedIn())  Backbone.history.navigate("my",true);
	  else    Backbone.history.navigate("register",true);
	},function(){
	  Backbone.history.navigate("",true);
	});
      }
    });
  };
  function checkUser(callback){
    var model = new App.Model.UserBindModel();
    model.save({},{
      url : App.ClipApp.encodeURI(App.ClipApp.Url.base+"/user/oauth_info"),
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