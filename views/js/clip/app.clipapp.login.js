// app.clipapp.login.js

App.ClipApp.Login = (function(App, Backbone, $){

  var Login = {};

  var LoginModel = App.Model.extend({
    url: "/_/login",
    defaults: {
      name : "", pass : ""
    }
  });

  var LoginView = App.ItemView.extend({
    tagName : "div",
    className : "login-view",
    template : "#login-view-template",
    events : {
      "focus #name"              :"clearAction",
      "click input[type=submit]" : "submit",
      "click input[type=reset]"  : "cancel"
    },
    submit : function(e){
      var that = this;
      var name = $("#name").val();
      var pass = $("#pass").val();
      e.preventDefault();
      this.model.save({name: name, pass: pass},{
  	url: App.ClipApp.Url.base+"/login",
	type: "POST",
  	success: function(model, res){
   	  var token = res;
  	  // console.log("success model = %j, response = %j", model, res);
  	  App.vent.trigger("app.clipapp.login:success", token);
  	},
  	error:function(model, res){
  	  // that.model.set("error", res);
  	  // that.model.change();
  	  // console.log("error model = %j, response = %j", model, res);
  	  App.vent.trigger("app.clipapp.login:error", model, res);
  	}
      });
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.login:cancel");
    },
    clearAction:function(evt){
      var value="用户名/Email";
      if($("#name").val() == value){
	$("#name").val("");
      }
    }
  });

  Login.show = function(model, error){
    var loginModel = new LoginModel();
    if (model) loginModel.set(model.toJSON());
    if (error) loginModel.set("error", error);
    loginView = new LoginView({model : loginModel});
    App.popRegion.show(loginView);
  };

  Login.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.login:success", function(token){
    document.cookie = "token="+token;
    var uid = token.split(":")[0];
    // 用户登录成功触发，显示clip的preview事件
    App.vent.trigger("clip_preview:show", uid, 0, 5);
    Login.close();
  });

  App.vent.bind("app.clipapp.login:error", function(model, error){
    Login.open(model, error);
  });

  App.vent.bind("app.clipapp.login:cancel", function(){
    Login.close();
  });

  // App.bind("initialize:after", function(){ Login.open(); });

  return Login;
})(App, Backbone, jQuery);