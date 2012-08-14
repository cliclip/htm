App.ClipApp.Register = (function(App, Backbone, $){
  var Register = {};
  var nameList = ['google', 'pepsi', 'twitter', 'facebook', 'baidu', 'sina'];

  App.Model.RegisterModel = App.Model.extend({
    url: function(){
      return App.ClipApp.Url.base+"/register";
    },
    validate: function(attrs){
      var err = {};
      if(!attrs.name ||attrs.name == ""){
        err.name = "is_null";
      }else if(!App.util.name_pattern.test(attrs.name)){
        err.name = "invalidate";
      }else if(_.include(nameList, attrs.name)){
        err.name = 'not_allow';
      }
      if(attrs.pass == ""){
	err.pass = "is_null";
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
      "blur #name"     : "blurName",
      "blur #pass"     : "blurPass",
      "focus #name"    : "cleanError",
      "focus #pass"    : "cleanError",
      "click #agree"   : "agreeAction",
      "click .r_login" : "gotoLogin",
      "click .reg_btn" : "submit",
      "click .close_w" : "cancel"
    },
    initialize: function(){
      this.tmpmodel = new App.Model.RegisterModel();
      this.flag = false;
    },
    blurName: function(e){
      var that = this;
      var name = $("#name").val();
      this.tmpmodel.save({name:name}, {
	url : App.ClipApp.Url.base+"/register/"+name+"/check",
	type: "GET",
	success:function(model,response){},
	error:function(model,error){
	  that.showError("register",error);
        }
      });
    },
    blurPass: function(e){
      var that = this;
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError("login",error);
	}
      });
    },
    agreeAction: function(e){
      if($("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }else{
	$(".reg_btn").attr("disabled",true);
      }
    },
    gotoLogin : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.register:@cancel");
      App.vent.trigger("app.clipapp:login");
    },
    submit: function(e){
      e.preventDefault();
      var that = this;
      var name = $("#name").val();
      var pass = $("#pass").val();
      var model = new App.Model.RegisterModel({name:name,pass:pass});
      if($(".error").length == 0){
	if($("#agree").attr("checked")){
	  model.save({},{
	    url : App.ClipApp.Url.base+"/register",
	    type: "POST",
	    success:function(model,response){
	      if(/language=en/.test(document.cookie)){
		//cliclip的uid为72
		App.vent.trigger("app.clipapp.reclip_tag:xinshou", 72, ["helper","newbie"]);
	      }else{
		App.vent.trigger("app.clipapp.reclip_tag:xinshou", 72, ["帮助","新手"]);
	      }
	      App.vent.trigger("app.clipapp.register:success","register_success",response);
	    },
	    error:function(model,error){
	      that.showError('register',error);
	    }
	  });
	}else{
	  console.log("error");
	}
      }else{
	$(e.currentTarget).attr("disabled",false);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.register:@cancel");
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
  };

  Register.show = function(model, error){
    var registerModel = new App.Model.RegisterModel();
    if (model) registerModel.set(model.toJSON());
    if (error) registerModel.set("error", error);
    var registerView = new RegisterView({model: registerModel});
    App.popRegion.show(registerView);
    if(/language=en/.test(document.cookie)){
      $("#note_img").removeClass("note_img_zh");
      $("#note_img").addClass("note_img_en");
    }else{
      $("#note_img").removeClass("note_img_en");
      $("#note_img").addClass("note_img_zh");
    }
    $("#name").focus();
    $("#agree").attr("checked",true);
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
  App.vent.bind("app.clipapp.register:@cancel", function(){
    Register.close();
  });

  // Test
  // App.bind("initialize:after", function(){Register.show();});

  return Register;
})(App, Backbone, jQuery);