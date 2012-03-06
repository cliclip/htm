App.Collect = (function(App, Backbone, $){
  var Collect = {};

  var CollectModel = App.Model.extend({
  	url: "/_/collect",
    defaults: {
      tag:"",name:""

    }
  });

  var CollectView = App.ItemView.extend({
  	tagName : "div",
  	className : "collect-view",
  	template : "#collect-view-template",
  	events : {
  	  "click input[type=submit]" : "submit",
  	  "click input[type=reset]" : "cancel"
  	},
  	submit : function(e){
  	  var that = this;
  	  e.preventDefault();
  	  this.model.save(  {
  	  	  url: "/test/collect.success.json",
          type: "GET", // TEST
  	  	  success: function(model, res){
  	  		var token = res.token;
  	  	  	console.log("success model = %j, response = %j", model, res);
  	  		App.vent.trigger("login-view:success", token);
  	  	  },
  	  	  error:function(model, res){
  	  		// that.model.set("error", res);
  	  		// that.model.change();
  	  	  	console.log("error model = %j, response = %j", model, res);
  	  		App.vent.trigger("collect-view:error", model, res);
  	  	  }
  	  });
  	},
  	cancel : function(e){
  	  e.preventDefault();
  	  App.vent.trigger("collect-view:cancel");
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
  	// document.cookie.token = token;
  	Login.close();
  });

  App.vent.bind("login-view:error", function(model, error){
  	Login.open(model, error);
  });

  App.vent.bind("login-view:cancel", function(){
  	Login.close();
  });

  // TEST
  App.bind("initialize:after", function(){ Login.open(); });

  return Login;
})(App, Backbone, jQuery);