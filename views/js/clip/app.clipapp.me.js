// app.clipapp.me.js
App.ClipApp.Me = (function(App, Backbone, $){

  var P = App.ClipApp.Url.base;
  var Me = {};
  var MyInfoModel = App.Model.extend({
    defaults:{
      id:"",
      name:"",
      face:"",
      following:"",
      follower:"",
      token:""
    },
    url:function(){
      //参数为了防止ie缓存导致的不能向服务器发送请求的问题
      return App.util.unique_url(P+"/my/info");
    }
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
      "click #mysetup": "mysetupAction",
      // "mouseenter .navigate": "mouseEnter",
      // "mouseleave .navigate": "mouseLeave",
      "click .my": "switch_my",
      "click .at_me": "switch_at_me",
      "click .expert": "switch_expert"

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
    },
    switch_my:function(){
      $(".my").css({"z-index":2});
      $(".at_me").css({"z-index":1});
      $(".expert").css({"z-index":0});
    },
    switch_at_me:function(){
      $(".my").css({"z-index":1});
      $(".at_me").css({"z-index":1});
      $(".expert").css({"z-index":0});
    },
    switch_expert:function(){
      $(".my").css({"z-index":0});
      $(".at_me").css({"z-index":0});
      $(".expert").css({"z-index":0});
    }
    /*
    mouseEnter: function(e){
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      $("." + opt).css({"z-index":2});
    },
    mouseLeave: function(e){
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      $("." + opt).css({"z-index":0});
    }*/
  });

  Me.show = function(){
    if(!App.util.getMyUid()){
      var meView = new View();
      App.mineRegion.show(meView);
    }
    Me.me.onChange(function(meModel){
      //console.info("onChange :: "+Me.me.get("id"));
      var meView = new View({
	model: meModel
      });
      App.mineRegion.show(meView);
    });
  };

  App.vent.bind("app.clipapp.login:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.register:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.face:reset", function(){
    Me.me.fetch();
  });

  App.addInitializer(function(){
    Me.me = new MyInfoModel();
    Me.me.fetch();
  });

  App.bind("initialize:after", function(){
    Me.show();
  });

  return Me;
})(App, Backbone, jQuery);
