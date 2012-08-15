// app.clipapp.login.js

App.ClipApp.UserBind = (function(App, Backbone, $){

  var UserBind = {};

  App.Model.UserBindModel = App.Model.extend({
    url:function(){
    var my = App.util.getMyUid();
    if(this.get("oauth_id")){
      return P+"/user/"+ my +"/provider/"+this.get("provider")+"/oauth_id/"+this.get("oauth_id");
    }else{
      return App.util.unique_url(P+"/user/"+ my +"/provider/"+this.get("provider"));
    }
    }
  });
  var UserBindView = App.ItemView.extend({
    tagName : "div",
    className : "bind-view",
    template : "#bind-view-template",
    events : {
      "click .close_w"           : "cancel",
      "click #bind_ok"           : "bindOk",
      "click #user_have"         : "toggleClass",
      "click #user_not"          : "toggleClass",
      "blur #name"          : "blurName",
      "blur #pass"          : "blurPass",
      "focus #name"         : "cleanError",
      "focus #pass"         : "cleanError"
    },
    initialize:function(){
      this.tmpmodel = new App.Model.LoginModel();
    },
    blurName: function(e){
      var that = this;
      this.tmpmodel.set({name:$("#name").val()}, {
	error:function(model, error){
	  that.showError('bind',error);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError('bind',error);
	}
      });
    },
    bindOk:function(e){
      e.preventDefault();
      var that = this;
      var id = $('.tab')[0].id;
      if(id == "user_have"){
	this.tmpmodel.save({}, {
	  url: App.ClipApp.Url.base+"/login",
	  type: "POST",
  	  success: function(model, res){
  	    App.vent.trigger("app.clipapp.userbind:success", res);
  	  },
  	  error:function(model, res){
	    console.log(res);
	    that.showError('bind',res);
  	  }
	});
      }else if(id == "user_not"){
	this.tmpmodel.save({},{
	  url : App.ClipApp.Url.base+"/register",
	  type: "POST",
	  success:function(model,res){
	    App.vent.trigger("app.clipapp.userbind:success",res);
	  },
	  error:function(model,error){
	    that.showError('bind',error);
	  }
	});
      }
    },
    toggleClass : function(e){
      if(e.currentTarget.id == "user_have"){
	$("#user_not").removeClass("tab");
	$("#bind_ok").val(_i18n('bind.bind_ok'));
      }else if(e.currentTarget.id == "user_not"){
	$("#user_have").removeClass("tab");
	$("#bind_ok").val(_i18n('bind.register_ok'));
      }
      $(e.currentTarget).addClass("tab");
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.userbind:@cancel");
    }
  });

  var bindOauth ,fun, remember = false;//fun 用于记录用户登录前应该触发的事件

  UserBind.show = function(auth){
    var model = new App.Model.UserBindModel({info:auth.info,provider:auth.provider});
    var view = new UserBindView({model : model});
    App.popRegion.show(view);
  };

  UserBind.close = function(){
    App.popRegion.close();
    bindOauth = null;
    fun = null;
  };

  function saveOauth(oauth,callback){
    if(oauth){
      var model = new App.Model.UserBindModel(oauth);
      model.save({},{
	type: "POST",
	success:function(model,res){
	  callback(null,res);
	},
	error:function(model,error){
	  //that.showError(error);
	  callback(error,null);
	}
      });
    }
  };

  App.vent.bind("app.clipapp.userbind:show",function(oauth,f,remem){
    UserBind.show(oauth);
    bindOauth = oauth;
    fun = f;
    remember = remem;
    //console.info(bindOauth);
  });

  //bind 设置里面增加微博绑定
  App.vent.bind("app.clipapp.userbind:bind",function(oauth){
    saveOauth(oauth,function(err,reply){
      if(reply){
	App.vent.trigger("app.clipapp.userbind:ok");
      }
    });
  });

  App.vent.bind("app.clipapp.userbind:success", function(res){
    if(remember){
      var data = new Date();
      data.setTime(data.getTime() + 30*24*60*60*1000);
      document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    }else{
      document.cookie = "token="+res.token;
    }
    saveOauth(bindOauth,function(err,reply){
      if(bindOauth.provider == "weibo"){
	App.vent.trigger("app.clipapp.message:confirm", "weibo_sucmsg",bindOauth.info.name);
      }else if(bindOauth.provider == "twitter"){
	App.vent.trigger("app.clipapp.message:confirm", "twitter_sucmsg",bindOauth.info.name);
      }
      App.vent.trigger("app.clipapp.userbind:bindok");
      if(reply){
	if(typeof fun == "function"){
	  App.ClipApp.Bubb._getUserTags(res.token.split(":")[0]);
	  fun();
	}else{
	  Backbone.history.navigate("my",true);
	}
	UserBind.close();
      }
    });
  });

  App.vent.bind("app.clipapp.userbind:@cancel", function(){
    if(Backbone.history){
     Backbone.history.navigate("",true);
    }
    UserBind.close();
  });

 // TEST

    App.bind("initialize:after", function(){ UserBind.show({info:"ll",provider:"dd"}); });

 return UserBind;
})(App, Backbone, jQuery);