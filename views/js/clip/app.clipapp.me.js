// app.clipapp.me.js
App.ClipApp.Me = (function(App, Backbone, $){

  var P = App.ClipApp.Url.base;
  var Me = {};
  var flag = false;
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
      "click #help_button":"helpAction",
      "click .my_info":"showMysetup",
      "mouseout .my_info":"closeMysetup",
      "mouseover #show_mysetup":"keepOpenMysetup",
      "mouseout #show_mysetup":"closeMysetupMust",
      "click #logout": "logoutAction",
      "click #mysetup": "mysetupAction",
      "click #help":"helpAction",
      // "mouseenter .navigate": "mouseEnter",
      // "mouseleave .navigate": "mouseLeave",
      "click .my": "switch_my",
      // "click .at_me": "switch_at_me",
      "click .expert": "switch_expert",
      "click .delang" : "showLanguage",
      "mouseout .language": "closeLanguage",
      "mouseover #show_language":"keepShowLanguage",
      "mouseout #show_language": "closeLanguageMust",
      "mouseover .lang-list": "MouseOver",
      "mouseout  .lang-list": "MouseOut",
      "click .lang-list" : "ChangeLang"
    },
    initialize: function(){
      this.bind("@change", changeShow);
      this.model.bind("change", this.render, this);
    },
    showMysetup: function(){
      $("#show_mysetup").toggle(); // css("display","block");
    },
    keepOpenMysetup: function(){
      flag = true;
      $("#show_mysetup").show();
    },
    closeMysetup: function(){
      setTimeout(function(){
	if(!flag){
	  $("#show_mysetup").css("display","none");
	}
      },200);
    },
    closeMysetupMust: function(){
      flag = false;
      $("#show_mysetup").css("display","none");
    },
    loginAction: function(){
      App.ClipApp.showLogin();
    },
    registerAction: function(){
      App.ClipApp.showRegister();
    },
    helpAction:function(){
      Backbone.history.navigate("help/1",true);
    },
    logoutAction: function(){
      App.vent.trigger("app.clipapp:logout");
    },
    mysetupAction: function(){
      App.ClipApp.showUserEdit();
    },
    switch_my:function(){
      // App.util.current_page("my");
      Backbone.history.navigate("my",true);
    },/*
    switch_at_me:function(){
      // App.util.current_page("@me");
      Backbone.history.navigate("my/recommend",true);
    },*/
    switch_expert:function(){
      // App.util.current_page("interest");
      Backbone.history.navigate("my/interest",true);
    },
    showLanguage: function(e){
      $("#show_language").toggle();
      var span = $(".delang").children()[1];
      if($("#show_language").css("display") == 'block'){
	$(span).text("▲");
	var defaultLang = e.currentTarget.children[0].className;
	$("#"+defaultLang).css("background-color","#D8D8D8");
      }else{
	$(span).text("▼");
      }
    },
    keepShowLanguage: function(e){
      flag = true;
      var span = $(".delang").children()[1];
      $(span).text("▲");
      $("#show_language").show();
    },
    closeLanguage: function(e){
      setTimeout(function(){
	if(!flag){
	  var span = $(".delang").children()[1];
	  $(span).text("▼");
	  $("#show_language").css("display","none");
	}
      },200);
    },
    closeLanguageMust: function(e){
      flag = false;
      var span = $(".delang").children()[1];
      $(span).text("▼");
      $("#show_language").css("display","none");
    },
    ChangeLang:function(e){
      var lang = e.currentTarget.id;
      App.vent.trigger("app.versions:version_change",lang);
    },
    MouseOver:function(e){
      var div = $("#show_language").children();
      _(div).each(function(e){
	$(e).css("background-color","");
      });
      $(e.currentTarget).css("background-color","#D8D8D8");
    },
    MouseOut:function(e){
      $(e.currentTarget).css("background-color","");
    }
    /*mouseEnter: function(e){
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      $("." + opt).css({"z-index":2});
    },
    mouseLeave: function(e){
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      $("." + opt).css({"z-index":0});
    }*/
  });

  Me.show = function(){
    var meView = null;
    if(!App.util.getMyUid()){
      meView = new View({model: Me.me});
      App.mineRegion.show(meView);
    }else{
      Me.me.onChange(function(meModel){
	meView = new View({ model: meModel });
	App.mineRegion.show(meView);
	meView.trigger("@change", meView.model);
      });
    }
  };

  Me.getFace = function(){
    return {
      name: Me.me.get("name"),
      face: Me.me.get("face"),
      lang: Me.me.get("lang")
    };
  };

  var changeShow = function(){
    setTimeout(function(){
      if(!Me.me.get("name")){
	App.ClipApp.showAlert("no_name", null, function(){
	  App.vent.trigger("app.clipapp.useredit:rename");
	});
      }
      if(Me.me.get("lang")){
	App.vent.trigger("app.versions:version_change",Me.me.get("lang"));
      }
    }, 0);
  };

  App.vent.bind("app.clipapp.login:success", function(){
    Me.me.fetch();
    Me.show();
  });

  App.vent.bind("app.clipapp.register:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.follow:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.unfollow:success", function(){
    Me.me.fetch();
  });

  App.addInitializer(function(){
    Me.me = new MyInfoModel();
    Me.me.fetch();
  });

  App.bind("initialize:after", function(){
    Me.me.fetch();
    Me.show();
  });

  return Me;
})(App, Backbone, jQuery);
