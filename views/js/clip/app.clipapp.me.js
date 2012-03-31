// app.clipapp.me.js
App.ClipApp.Me = (function(App, Backbone, $){

  var P = App.ClipApp.Url.base;
  var Me = {};
  var Model = App.Model.extend({
    url: P+"/my/info"
  });

  var View = App.ItemView.extend({
    tagName: "div",
    className: "me-view",
    template: "#me-view-template",
    events:{
      "click #login_button": "loginAction",
      "click #register_button": "registerAction",
      "click #logout": "logoutAction",
      "click #mysetup": "mysetupAction"
    },
    loginAction: function(){
      App.vent.trigger("app.clipapp:login");
    },
    registerAction: function(){
      App.vent.trigger("app.clipapp.me:register");
    },
    logoutAction: function(){
      App.vent.trigger("app.clipapp:logout");
    },
    mysetupAction: function(){
      App.vent.trigger("app.clipapp.useredit:show");
    }
  });

  Me.show = function(){
    if(!Me.me.get("id")){
      var meView = new View();
      App.mineRegion.show(meView);
    }
    Me.me.onChange(function(meModel){
      // console.info("onChange :: "+Me.me.get("id"));
      var meView = new View({
	model: meModel
      });
      App.mineRegion.show(meView);
    });
  };

  App.vent.bind("app.clipapp.login:success", function(){
    Me.me.fetch();
    Me.show();
  });

  App.vent.bind("app.clipapp.register:success", function(){
    Me.me.fetch();
    Me.show();
  });

  App.vent.bind("app.clipapp.me:register", function(){
    Backbone.history.navigate("register");
    location.reload();
  });

  App.vent.bind("app.clipapp.useredit:show", function(){
    Backbone.history.navigate("my/setup");
    location.reload();
  });

  App.addInitializer(function(){
    Me.me = new Model();
    Me.me.fetch();
  });

  App.bind("initialize:after", function(){
    Me.show();
  });

  return Me;
})(App, Backbone, jQuery);
