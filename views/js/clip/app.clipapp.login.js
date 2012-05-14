// app.clipapp.login.js

App.ClipApp.Login = (function(App, Backbone, $){

  var Login = {};
  var NAME = "用户名/Email";
  var LoginModel = App.Model.extend({
    validate: function(attrs){
      var err = {};
      if(attrs.name == "" || attrs.name == NAME){
	err.name = "is_null";
      }
      if(attrs.pass == ""){
	err.pass = "is_null";
      }
      return _.isEmpty(err) ? null : err;
    }
  });

  var LoginView = App.ItemView.extend({
    tagName : "div",
    className : "login-view",
    template : "#login-view-template",
    events : {
      "blur #name"               : "blurName",
      "blur #pass"               : "blurPass",
      "focus #name"              : "clearAction",
      "focus #pass"              : "cleanError",
      "click .login_btn"         : "loginAction",
      "click .close_w"           : "cancel",
      "click .reg_btn"           : "registerAction",
      "click .weibo"             : "openWeibo"
    },
    initialize:function(){
      this.tmpmodel = new LoginModel();
    },
    blurName: function(e){
      var that = this;
      // this.model.set({name:$("#name").val()},{
      this.tmpmodel.set({name:$("#name").val()}, {
	error:function(model, error){
	  if($("#name").val() == "")
	    $("#name").val(NAME);
	  that.showError(error);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      // this.model.set({pass:$("#pass").val()},{
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError(error);
	}
      });
    },
    clearAction: function(e){
      if(this.$("#name").val() == NAME){
	this.$("#name").val("");
      }
      this.cleanError(e);
    },
    loginAction : function(e){
      var that = this;
      e.preventDefault();
      // this.model.save({},{
      this.tmpmodel.save({}, {
  	url: App.ClipApp.Url.base+"/login",
	type: "POST",
  	success: function(model, res){
  	  App.vent.trigger("app.clipapp.login:success", res);
  	},
  	error:function(model, res){
	  that.showError(res);
  	}
      });
    },
    registerAction:function(e){
      var that = this;
      e.preventDefault();
      this.tmpmodel.save({},{
	url : App.ClipApp.Url.base+"/register",
	type: "POST",
	success:function(model,response){
	  App.vent.trigger("app.clipapp.register:success","register_success",response);
	},
	error:function(model,error){
	  that.showError(error);
	}
      });
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.login:@cancel");
    },
    openWeibo : function(){
      window.open("http://clickdang.com:5000/oauth/req/weibo");
    }
  });

  Login.show = function(){
    var loginModel = new LoginModel();
    var loginView = new LoginView({model : loginModel});
    App.popRegion.show(loginView);
    $("#name").focus();
  };

  Login.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.login:success", function(res){
    var data = new Date();
    data.setTime(data.getTime() + 7*24*60*60*1000);
    document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    // 用户登录成功 页面跳转
    Login.close();
    Backbone.history.navigate("my",true);
    //location.reload();
    //console.info("页面跳转");
  });

  App.vent.bind("app.clipapp.login:@error", function(model, error){
    Login.show(model, App.util.getErrorMessage(error));
  });

  App.vent.bind("app.clipapp.login:@cancel", function(){
    Login.close();
  });

  App.vent.bind("oauth:added", function(oauth){
    console.info("22222222222");
  });

 // TEST

 //App.bind("initialize:after", function(){ Login.show(); });

 return Login;
})(App, Backbone, jQuery);