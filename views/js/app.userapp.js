// app.userapp.js

// 登录 注册 列出相关用户
var P = "/_2_";
App.UserApp = (function(App, Backbone, $){
  var UserApp = {};

  // this.id 为用来装载model的user.id [从cookie中获得]
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

  var LoginModel = App.Model.extend({
    url: P+"/login"
  });
  var login = function(data){
    var loginModel = new LoginModel();
    loginModel.save(data,{
      success:function(user, response){
	var token = response;
      },
      error:function(user, response){}
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

  UserApp.login = function(){
    var userRegisterView = new UserRegisterView();
    App.popRegion.show(userRegisterView);
  };

  UserApp.show = function(uid){
    var user = new UserModel({
      id: uid
    });
    user.fetch();
    /*
    user.onChange(function(userModel){
      App.vent.trigger("user:show", userModel);
    });
   */
    user.onChange(showUser);
  };

  App.vent.bind("user:show", function(userModel){
    showUser(userModel);
  });
  App.vent.bind("user:login",function(data){
    login(data);
  });

  return UserApp;
})(App, Backbone, jQuery);
