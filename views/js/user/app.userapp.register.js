App.UserApp.Register = (function(App, Backbone, $){

  var P = "/_2_";
  var Register = {};
  var RegisterModel = App.Model.extend({
    url: P+"/register"
  });
  // 会在不同的区域进行显示
  var UserRegisterView = App.ItemView.extend({
    tagName: "div",
    className: "register-view",
    template: "#register-view-template",
    events:{
      // 该事件绑定之后不管用
      "click #submit": "submit",
      "click #reset": "reset"
    },
    submit: function(e){
      e.preventDefault();
      // 取得当前点击的button的value进行处理
      var data = {
	name : $("#username_r").val(),
	pass : $("#password_r").val()
      };
      this.model.save(data,{
	url : P+"/register",
	type: "POST",
	success:function(user,response){
	  // 转到用户登录页面
	  App.vent.trigger("register:success",response);
	},
	error:function(user,error){
	  // 提示登录出错
	  App.vent.trigger("register:error",this.model, error);
	}
      });
    },
    reset : function(e){
      e.preventDefault();
      Register.close();
    }
  });

  Register.close = function(){
    App.popRegion.close();
  };

  Register.open = function(model, error){
    var registerModel = new RegisterModel();
    if (model) registerModel.set(model.toJSON());
    if (error) registerModel.set("error", error);
    var userRegisterView = new UserRegisterView({model: registerModel});
    App.popRegion.show(userRegisterView);
  };

  App.vent.bind("register:success", function(res){
    Register.close();
    // 注册成功则设置token为登录状态
    // document.cookie = "token="+res.token;
    App.vent.trigger("login:success", res.token);
  });

  App.vent.bind("register:error",function(model, error){
    Register.close();
    Register.open(model, error);
  });

  // Test
  // App.bind("initialize:after", function(){Register.open();});

  return Register;
})(App, Backbone, jQuery);