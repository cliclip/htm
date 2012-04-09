// app.clipapp.me.js
App.ClipApp.Me = (function(App, Backbone, $){

  var P = App.ClipApp.Url.base;
  var Me = {};
  var Model = App.Model.extend({
    defaults:{
      id:"",
      name:"",
      face:"",
      token:""
    },
    url: P+"/my/info"
  });

  var View = App.ItemView.extend({
    tagName: "div",
    className: "me-view",
    template: "#me-view-template",
    events:{
      "click #login_button": "loginAction",
      "click #register_button": "registerAction",
      "mouseover .my_info":"showMysetup",
      "mouseout .my_info":"closeMysetup",
      "click #logout": "logoutAction",
      "click #mysetup": "mysetupAction"
    },
    showMysetup: function(){
      $("#show_mysetup").css("display","block");
    },
    closeMysetup: function(){
      $("#show_mysetup").css("display","none");
    },
    loginAction: function(){
      App.vent.trigger("app.clipapp:login");
    },
    registerAction: function(){
      App.vent.trigger("app.clipapp:register");
    },
    logoutAction: function(){
      App.vent.trigger("app.clipapp:logout");
    },
    mysetupAction: function(){
      App.vent.trigger("app.clipapp.useredit:show");
    }
  });

  Me.show = function(){
    if(!App.util.getMyUid()){
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

  App.vent.bind("app.clipapp.useredit:facesuccess", function(){
    Me.me.fetch();
    Me.show();
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
