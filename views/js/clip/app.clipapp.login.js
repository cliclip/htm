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
  	  "click input[type=submit]" : "submit",
  	  "click input[type=reset]" : "cancel"
  	},
  	submit : function(e){
  	  var that = this;
  	  e.preventDefault();
  	  this.model.save({name: "", pass: ""},{
  	  	  url: "/test/login.success.json",
          type: "GET", // TEST
  	  	  success: function(model, res){
  	  		var token = res.token;
  	  	  	console.log("success model = %j, response = %j", model, res);
  	  		App.vent.trigger("app.clipapp.login:success", token);
  	  	  },
  	  	  error:function(model, res){
  	  		// that.model.set("error", res);
  	  		// that.model.change();
  	  	  	console.log("error model = %j, response = %j", model, res);
  	  		App.vent.trigger("app.clipapp.login:error", model, res);
  	  	  }
  	  });
  	},
  	cancel : function(e){
  	  e.preventDefault();
  	  App.vent.trigger("app.clipapp.login:cancel");
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

  App.vent.bind("app.clipapp.login:success", function(token){
  	// document.cookie.token = token;
  	Login.close();
  });

  App.vent.bind("app.clipapp.login:error", function(model, error){
  	Login.open(model, error);
  });

  App.vent.bind("app.clipapp.login:cancel", function(){
  	Login.close();
  });

  // TEST
  App.bind("initialize:after", function(){ Login.open(); });

  return Login;
})(App, Backbone, jQuery);