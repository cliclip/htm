App.ClipApp.Register = (function(App, Backbone, $){
  var Register = {};

  var RegisterModel = App.Model.extend({
    url: App.ClipApp.Url.base+"/register"
  });

  // 会在不同的区域进行显示
  var RegisterView = App.ItemView.extend({
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
	url : App.ClipApp.Url.base+"/register",
	type: "POST",
	success:function(user,response){
	  // 转到用户登录页面
	  App.vent.trigger("app.clipapp.register:success",response);
	},
	error:function(user,error){
	  // 提示登录出错
	  App.vent.trigger("app.clipapp.register:error",this.model, error);
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
    window.location.href='javascript:history.go(-1);';
  };

  Register.show = function(model, error){
    var registerModel = new RegisterModel();
    if (model) registerModel.set(model.toJSON());
    if (error) registerModel.set("error", error);
    var registerView = new RegisterView({model: registerModel});
    App.popRegion.show(registerView);
  };

  App.vent.bind("app.clipapp.register:success", function(res){
    document.cookie = "token="+res[0];
    Backbone.history.navigate("my");
    location.reload();
    Register.close();
  });

  App.vent.bind("app.clipapp.register:error",function(model, error){
    Register.close();
    Register.open(model, error);
  });

  // Test
  // App.bind("initialize:after", function(){Register.open();});

  return Register;
})(App, Backbone, jQuery);