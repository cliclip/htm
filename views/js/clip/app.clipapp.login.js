// app.clipapp.login.js

App.ClipApp.Login = (function(App, Backbone, $){

  var Login = {};
  var NAME = "用户名/Email";
  var fun = "";  // 用于记录用户登录前应该触发的事件
  App.Model.LoginModel = App.Model.extend({
    validate: function(attrs){
      var err = {};
      if(attrs.name == "" || attrs.name == NAME){
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
      "click .weibo"             : "openWeibo"
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
	    $("#name").val(NAME);
	  that.showError(error);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      // this.model.set({pass:$("#pass").val()},{
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError(error);
	}
      });
    },
    clearAction: function(e){
      if(this.$("#name").val() == NAME){
	this.$("#name").val("");
      }
      this.cleanError(e);
    },
    loginAction : function(e){
      var that = this;
      e.preventDefault();
      this.tmpmodel.save({}, {
  	url: App.ClipApp.Url.base+"/login",
	type: "POST",
  	success: function(model, res){
  	  App.vent.trigger("app.clipapp.login:success", res); // fetch Me.me
  	},
  	error:function(model, res){
	  that.showError(res);
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
      this.tmpmodel.save({},{
	url : App.ClipApp.Url.base+"/register",
	type: "POST",
	success:function(model,response){
	  if(typeof fun != "function"){
	    App.vent.trigger("app.clipapp.register:success","register_success",response);
	  }else{
	    App.vent.trigger("app.clipapp.login:success", response);
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
      App.vent.trigger("app.clipapp.login:@cancel");
      socket = new easyXDM.Socket({
	remote: 'http://clickdang.com/oauth/req/weibo?r='+Math.random()*9999999,
	//remote: 'http://192.168.1.3:10000/oauth/req/weibo?r='+Math.random()*9999999,
	container: document.body,
	swf: 'http://clickdang.com/img/easyxdm.swf',
	swfNoThrottle: true,
	onLoad: function(e){ // hack, style set
	  var iframe = e.target;
          var height = document.body.clientHeight;
          var width = document.body.clientWidth;
          iframe.setAttribute("scrolling", "no");
          iframe.setAttribute("frameBorder", "0");
          iframe.setAttribute("allowTransparency", "true");
          iframe.setAttribute("style", "border:0px; z-index:99999999;width:"+width+"px; height:"+height+"px; position:absolute; _position:absolute; left:0px; top:0px; _left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth); _top: expression(documentElement.scrollTop+documentElement.clientHeight-this.offsetHeight);");
      },
	onMessage: function(message, origin){
	  //console.log(arguments);
	  var r = JSON.parse(message);
	  switch(r[0]){
	    case 'oauth' : // for ui to set model after change
	      setTimeout(function(){
		checkUser({uid:r[1].info.uid,provider:r[1].provider},function(err,res){
		  if(res){
		    App.vent.trigger("app.clipapp.login:success", res);
		  }else{
		    App.vent.trigger("app.clipapp.userbind:show",r[1],fun);
		  }
		});
		closeUI();
		cleanSelection();
		//console.info(r[1]);
	      }, 1000);
	      break;
	    case 'close' :
              closeUI();
	      cleanSelection();
          }
	}
      });
      socket.postMessage(JSON.stringify(["ping"]));
    }
  });

  function checkUser(params,callback){
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
  }

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

  App.vent.bind("app.clipapp.login:success", function(res){
    var data = new Date();
    data.setTime(data.getTime() + 7*24*60*60*1000);
    document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    // 用户登录成功 页面跳转
    Login.close();
    if(typeof fun == "function"){
      fun();
    }else if(Backbone.history){
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