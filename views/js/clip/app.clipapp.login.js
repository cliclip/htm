// app.clipapp.login.js

App.ClipApp.Login = (function(App, Backbone, $){

  var Login = {};

  var LoginModel = App.Model.extend({
    defaults: {
      name : "用户名/Email", pass : ""
    }
  });

  var LoginView = App.ItemView.extend({
    tagName : "div",
    className : "login-view",
    template : "#login-view-template",
    events : {
      "focus #name"              :"clearAction",
      "blur #name"               :"blurAction",
      "click .login_btn"         : "loginAction",
      "click .close_w"           : "cancel",
      "click .reg_btn"           : "registerAction"
    },
    loginAction : function(e){
      var that = this;
      var name = $("#name").val();
      var pass = $("#pass").val();
      e.preventDefault();
      this.model.save({name: name, pass: pass},{
  	url: App.ClipApp.Url.base+"/login",
	type: "POST",
  	success: function(model, res){
  	  App.vent.trigger("app.clipapp.login:success", res);
  	},
  	error:function(model, res){
  	  App.vent.trigger("app.clipapp.login:error", model, res);
  	}
      });
    },
    registerAction:function(e){
      e.preventDefault();
      var data = {
	name : $("#name").val(),
	pass : $("#pass").val()
      };
      this.model.save(data,{
	url : App.ClipApp.Url.base+"/register",
	type: "POST",
	success:function(model,response){
	  App.vent.trigger("app.clipapp.login:success",response);
	},
	error:function(model,error){
	  App.vent.trigger("app.clipapp.login:error",model, error);
	}
      });
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.login:cancel");
    },
    clearAction:function(evt){
      if($("#name").val() == this.model.get("name")){
	$("#name").val("");
      }
    },
    blurAction:function(evt){
      if($("#name").val() == ""){
	$("#name").val(this.model.get("name"));
      }
    }
  });

  Login.show = function(model, error){
    var loginModel = new LoginModel();
    if (model) loginModel.set(model.toJSON());
    if (error) loginModel.set("error", error);
    var loginView = new LoginView({model : loginModel});
    App.popRegion.show(loginView);
  };

  Login.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.login:success", function(token){
    document.cookie = "token="+token;
    // 用户登录成功 页面跳转
    Backbone.history.navigate("my",true);
    //location.reload();
    Login.close();
  });

  App.vent.bind("app.clipapp.login:error", function(model, error){
    Login.show(model, App.util.getErrorMessage(error));
  });

  App.vent.bind("app.clipapp.login:cancel", function(){
    Login.close();
  });

  // TEST

  //App.bind("initialize:after", function(){ Login.show(); });

  return Login;
})(App, Backbone, jQuery);