// app.clipapp.oauth.js
App.ClipApp.Oauth = (function(App, Backbone, $){
  var Oauth = {};

  var P = App.ClipApp.Url.base;
  var OauthModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/authorized");
    }
  });

  Oauth.process=function(key){
    checkUser(key, function(err,res){
      if(err && err.hasbind_err){
	var sure = function(){
	  Backbone.history.navigate("my", true);
	  App.ClipApp.showUserEdit();
	};
	var cancel = function(){ Backbone.history.navigate("my", true); };
	App.ClipApp.showAlert("account_hasbind", null, sure, cancel);
      }else if(res && res.authorized){
	App.ClipApp.showUserBind(res);
      }else if(res && res.token){
	if(res.provider == "weibo"){
	  App.ClipApp.showConfirm("weibo_sucmsg", res.name);
	}else if(res.provider == "twitter"){
	  App.ClipApp.showConfirm("twitter_sucmsg", res.name);
	}else if(res.provider == "dropbox"){
	  App.ClipApp.showConfirm("dropbox_sucmsg", res.name);
	}
	App.vent.trigger("app.clipapp.login:gotToken",res);
      }else{
	var sure = function(){
	  App.ClipApp.showUserEdit();
	  Backbone.history.navigate("my", true);
	};
	var cancel = function(){ Backbone.history.navigate("my", true); };
	App.ClipApp.showAlert("oauth_fail",null, sure, cancel);
      }
    });
  };

  function checkUser(key, callback){
    var model = new OauthModel();
    model.save({key: key},{
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