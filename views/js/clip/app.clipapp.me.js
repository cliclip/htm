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
      "click .my_info":"showMysetup",
      // "mouseout .my_info":"closeMysetup",
      "click #logout": "logoutAction",
      "click #mysetup": "mysetupAction"
    },
    showMysetup: function(){
      $("#show_mysetup").toggle(); // css("display","block");
    },/*
    closeMysetup: function(){
      $("#show_mysetup").css("display","none");
    },*/
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
      App.vent.trigger("app.clipapp.useredit:show",this.model.get("id"));
    }
  });

  Me.show = function(){
    if(!App.util.getMyUid()){
      var meView = new View();
      App.mineRegion.show(meView);
      //console.info("用户未登录");
    }
    Me.me.onChange(function(meModel){
      // console.info("onChange :: "+Me.me.get("id"));
      var meView = new View({
	model: meModel
      });
      App.mineRegion.show(meView);
      //console.info("用户已登录");
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

  App.vent.bind("app.clipapp.face:reset", function(){
    Me.me.fetch();
    //解决小头像上传头像到服务器后还是显示原头像的奇怪问题
    setTimeout(function(){
      Me.show();
    },1000);
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
