// app.login.js
var P = "/_2_";
App.Login = (function(App, Backbone, $){
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
      // "click #loginAction_button":"loginAction",
      "click input[type=submit]" : "submit",
      "click input[type=reset]" : "cancel",
      "focus input[type=text]": "clearText"
      //"click #cancel_button":"cancel"
    },
    clearText:function(evt){
      if($("#name").val().trim() == "用户名/Email"){
	$("#name").val("");
      }
    },
    submit : function(e){
      var that = this;
      var name = $("#name").val();
      var pass = $("#pass").val();
      e.preventDefault();
      this.model.save({name: name, pass: pass},{
  	url: P+"/login",
	type: "POST",
  	success: function(model, res){
   	  var token = res;
  	  //console.log("success model = %j, response = %j", model, res);
  	  App.vent.trigger("login-view:success", token);
  	},
  	error:function(model, res){
  	  // that.model.set("error", res);
  	  // that.model.change();
  	  // console.log("error model = %j, response = %j", model, res);
  	  App.vent.trigger("login-view:error", model, res);
  	}
      });
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("login-view:cancel");
    }
  });
  Login.open = function(model, error){
    var loginModel = new LoginModel();
    if (model) loginModel.set(model.toJSON());
    if (error) loginModel.set("error", error);
    loginView = new LoginView({model : loginModel});
    App.popRegion.show(loginView);
  };

  Login.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("login-view:success", function(token){
    document.cookie = "token="+token;
    var uid = token.split(":")[0];
    // 用户登录成功触发，显示clip的preview事件
    App.vent.trigger("clip_preview:show", uid, 0, 9);
    Login.close();
  });

  App.vent.bind("login-view:error", function(model, error){
    Login.open(model, error);
  });

  App.vent.bind("login-view:cancel", function(){
    Login.close();
  });

  // TEST
  App.bind("initialize:after", function(){
    Login.open();
  });

  return Login;
})(App, Backbone, jQuery);