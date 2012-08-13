App.ClipApp.Register = (function(App, Backbone, $){
  var Register = {};
  var nameList = ['google', 'pepsi', 'twitter', 'facebook', 'baidu', 'sina'];

  App.Model.RegisterModel = App.Model.extend({
    url: function(){
      return App.ClipApp.Url.base+"/register";
    },
    validate: function(attrs){
      console.log(attrs.name);
      var err = {};
      if(!attrs.name ||attrs.name == "" || attrs.name == _i18n('login.default_name')){
	err.name = "is_null";
      }else if(attrs.name.indexOf('@')<=0 && !App.util.name_pattern.test(attrs.name)){
	err.name = "invalidate";
      }else if(_.without(nameList, attrs.name)){
	err.name = 'not_allow';
      }else {
	this.save({}, {
	  url : App.ClipApp.Url.base+"/register/"+attrs.name+"/check",
	  type: "GET",
	  success:function(model,response){},
	  error:function(model,error){
	    err.name = "exist";
	  }
	});
      }
      return _.isEmpty(err) ? null : err;
    }
  });

  // 会在不同的区域进行显示
  var RegisterView = App.ItemView.extend({
    tagName: "div",
    className: "register-view",
    template: "#register-view-template",
    events:{
      // 该事件绑定之后不管用
      "click #submit": "submit",
      "click #reset": "reset",
      "click #login": "login"
    },
    initialize: function(){
      this.flag = false;
    },
    submit: function(e){
      e.preventDefault();
      // 取得当前点击的button的value进行处理
      var data = {
	name : $("#username_r").val(),
	pass : $("#password_r").val()
      };
      this.model.save(data,{
	success:function(model,response){
	  // 转到用户登录页面
	  App.vent.trigger("app.clipapp.register:success","register_success",response);
	},
	error:function(model,error){
	  // 提示登录出错
	  App.vent.trigger("app.clipapp.register:error",model, error);
	}
      });
    },
    reset : function(e){
      e.preventDefault();
      Register.close();
    },
    login : function(){
      App.vent.trigger("app.clipapp:login");
    }
  });

  Register.invite = function(key){
    var model = new App.Model.RegisterModel();
    model.save({},{
      url : App.ClipApp.Url.base+"/invite/"+key,
      type: "POST",
      success:function(model,response){
	App.vent.trigger("app.clipapp.register:success", 'invite', response);
      },
      error:function(model,error){
	App.vent.trigger("app.clipapp.message:confirm", error);
      }
    });
  };

  Register.close = function(){
    App.popRegion.close();
    // window.location.href='javascript:history.go(-1);'; // 返回注册前的页面
  };

  Register.show = function(model, error){
    var registerModel = new App.Model.RegisterModel();
    if (model) registerModel.set(model.toJSON());
    if (error) registerModel.set("error", error);
    var registerView = new RegisterView({model: registerModel});
    App.popRegion.show(registerView);
  };

  App.vent.bind("app.clipapp.register:success", function(key, res, fun){
    var data = new Date();
    data.setTime(data.getTime() + 7*24*60*60*1000);
    document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    //document.cookie = "token="+res.token;
    Register.close();
    Backbone.history.navigate("my",true);
    App.vent.trigger("app.clipapp.gotosetup:show", key, res.email);
  });

  App.vent.bind("app.clipapp.register:error",function(model, error){
    Register.show(model, error);
  });

  // Test
  // App.bind("initialize:after", function(){Register.show();});

  return Register;
})(App, Backbone, jQuery);