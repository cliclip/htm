// app.userapp.js

// 登录 注册 列出相关用户
var P = "/_2_";
App.UserApp = (function(App, Backbone, $){
  var UserApp = {};

  // this.id 为用来装载model的user.id
  var UserModel = App.Model.extend({
    url: function(){
      return P+"/user/"+this.id;
    }
  });

  var UserFaceView = App.ItemView.extend({
    tagName: "div",
    className: "userface-view",
    template: "#userface-view-template"
  });

  var UserBubbView = App.ItemView.extend({
    tagName: "div",
    className: "userbubb-view",
    template: "#userbubb-view-template"
  });

  // 会在不同的区域进行显示
  var UserRegisterView = App.ItemView.extend({
    tagName: "div",
    className: "register-view",
    template: "#register-view-template",
    events:{
      // 该事件绑定之后不管用
      "click .button": "action"
    },
    action: function(e){
      e.preventDefault();
      // 取得当前点击的button的value进行处理
      var appName = $(e.currentTarget).val();
      var data = {
	name : $("#username_r").val(),
	pass : $("#password_r").val()
      };
      if(!data.name || !data.pass){
	// 输入的用户名或者密码为空或者有错
	alert("用户名或密码错误");
      }else{
	if (appName == "注册"){
	  App.vent.trigger("user:register", data);
	} else {
	  App.vent.trigger("user:login", data);
	}
      }
    }
  });

  var register = function(data){
    RequestUtil.postFunc({
      data: data,
      url: P+"/register",
      successCallBack:function(response){
	var token = response;
	console.info(token);
	// 显示公开的clip的preview
	// App.vent.trigger("clip:public:showPreview");
      },
      erroeCallBack:function(response){}
    });
  };

  var login = function(data){
    RequestUtil.postFunc({
      data: data,
      url: P+"/login",
      successCallBack: function(response){
	var token = response;
	// 显示自己有关的clip的preview
	// App.vent.trigger("clip:me:showPreview");
      },
      erroeCallBack:function(response){}
    });
  };

  var showUser = function(userModel){
    var userFaceView = new UserFaceView({
      model: userModel
    });
    var userBubbView = new UserBubbView({
      model: userModel
    });
    App.faceRegion.show(userFaceView);
    App.bubbRegion.show(userBubbView);
  };

  UserApp.register = function(){
    var userRegisterView = new UserRegisterView();
    App.mainRegion.show(userRegisterView);
  };

  UserApp.login = function(){
    var userRegisterView = new UserRegisterView();
    App.mainRegion.show(userRegisterView);
  };

  UserApp.show = function(uid){
    var user = new UserModel({
      id: uid
    });
    user.fetch();
    // user.onChange(showUser); // 只是不会改变url地址mark显示的区别？
    user.onChange(function(userModel){
      App.vent.trigger("user:show", userModel);
    });
  };

  App.vent.bind("user:show", function(userModel){
    showUser(userModel);
  });
  App.vent.bind("user:register",function(data){
    register(data);
  });
  App.vent.bind("user:login",function(data){
    login(data);
  });

  return UserApp;
})(App, Backbone, jQuery);

