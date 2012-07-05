// app.clipapp.login.js

App.ClipApp.Login = (function(App, Backbone, $){

  var Login = {};
  var fun = "";  // 用于记录用户登录前应该触发的事件
  App.Model.LoginModel = App.Model.extend({
    validate: function(attrs){
      var err = {};
      if(attrs.name == "" || attrs.name == _i18n('login.default_name')){
	err.name = "is_null";
      }
      if(attrs.pass == ""){
	err.pass = "is_null";
      }
      return _.isEmpty(err) ? null : err;
    }
  });

  var LoginView = App.ItemView.extend({
    tagName : "div",
    className : "login-view",
    template : "#login-view-template",
    events : {
      "blur #name"               : "blurName",
      "blur #pass"               : "blurPass",
      "focus #name"              : "clearAction",
      "focus #pass"              : "cleanError",
      "keydown #pass"            : "keydownAction",
      "click .login_btn"         : "loginAction",
      "click .close_w"           : "cancel",
      "click .reg_btn"           : "registerAction",
      "click .weibo"             : "openWeibo",
      "click .twitter"           : "openTwitter"
    },
    initialize:function(){
      this.tmpmodel = new App.Model.LoginModel();
    },
    blurName: function(e){
      var that = this;
      // this.model.set({name:$("#name").val()},{
      this.tmpmodel.set({name:$("#name").val()}, {
	error:function(model, error){
	  if($("#name").val() == "")
	    $("#name").val(_i18n('login.default_name'));
	  that.showError('login',error);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      // this.model.set({pass:$("#pass").val()},{
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError("login",error);
	}
      });
    },
    clearAction: function(e){
      if(this.$("#name").val() == _i18n('login.default_name')){
	this.$("#name").val("");
      }
      this.cleanError(e);
    },
    loginAction : function(e){
      var that = this;
      e.preventDefault();
      var remember = false;
      if($("#remember").attr("checked")){
	remember = true;
      }
      this.tmpmodel.save({}, {
  	url: App.ClipApp.Url.base+"/login",
	type: "POST",
  	success: function(model, res){
  	  App.vent.trigger("app.clipapp.login:success", res, remember); // fetch Me.me
  	},
  	error:function(model, res){
	  that.showError('login',res);
  	}
      });
    },
    keydownAction : function(e){
      $('#pass').unbind("keydown");
      if(e.keyCode==13){
	$("#pass").blur();
	$('.login_btn').click();
      }
     },
    registerAction:function(e){
      var that = this;
      e.preventDefault();
      var remember = false;
      if($("#remember").attr("checked")){
	remember = true;
      }
      this.tmpmodel.save({},{
	url : App.ClipApp.Url.base+"/register",
	type: "POST",
	success:function(model,response){
	  if(typeof fun != "function"){
	    App.vent.trigger("app.clipapp.register:success","register_success",response);
	  }else{
	    App.vent.trigger("app.clipapp.login:success", response, remember);
	  }
	},
	error:function(model,error){
	  that.showError(error);
	}
      });
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.clipper:cancel");
      App.vent.trigger("app.clipapp.login:@cancel");
    },
    openWeibo : function(e){
      var remember = false;
      if($("#remember").attr("checked")){
	remember = true;
      }
      App.vent.trigger("app.clipapp.login:@cancel");
      window.location.href="/oauth/req/weibo";
    },
    openTwitter : function(e){
      App.vent.trigger("app.clipapp.login:@cancel");
      window.location.href="/oauth/req/twitter";
    }
  });

   function checkUser(callback){ //weibo、twitter的信息与本系统进行验证
    var model = new App.Model.UserBindModel(params);
    model.save({},{
      url : App.ClipApp.Url.base+"/user/oauth_info",
      type: "POST",
      success:function(model,res){
	callback(null,res);
      },
      error:function(model,error){
	callback(null,null);
      }
    });
  };

  function closeUI(){
    socket.destroy();
    //window.scroll(0, savedScrollTop);
    //document.body.removeChild(popupIframe);
  }

  function cleanSelection(){
    if (window.getSelection) {  // all browsers, except ie < 9
      var sel = window.getSelection ();
      sel.removeAllRanges();
    } else if (document.selection.createRange) { // ie
      document.selection.createRange();
      document.selection.empty();
    }
  }

  Login.show = function(callback){
    fun = callback;
    var loginModel = new App.Model.LoginModel();
    var loginView = new LoginView({model : loginModel});
    App.popRegion.show(loginView);
    $("#name").focus();
  };

  Login.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.login:success", function(res, remember){
    if(remember){
      var data = new Date();
      data.setTime(data.getTime() + 30*24*60*60*1000);
      document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    }else{
      document.cookie = "token="+res.token;
    }
    // 用户登录成功 页面跳转
    Login.close();
    if(typeof fun == "function"){
      fun();
    }else{
      Backbone.history.navigate("my",true);
    }
  });

  App.vent.bind("app.clipapp.login:@error", function(model, error){
    Login.show(model, App.util.getErrorMessage(error));
  });

  App.vent.bind("app.clipapp.login:@cancel", function(){
    Login.close();
  });

 // TEST

 //App.bind("initialize:after", function(){ Login.show(); });

 return Login;
})(App, Backbone, jQuery);