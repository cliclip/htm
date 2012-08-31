App.ClipApp.Register = (function(App, Backbone, $){
  var Register = {};
  var P = App.ClipApp.Url.base;

  App.Model.RegisterModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(P + "/register");
    },
    validate: function(attrs){
      var err = {};
      if(!attrs.name ||attrs.name == ""){
        err.name = "is_null";
      }else if(!App.util.name_pattern.test(attrs.name)){
        err.name = "invalidate";
      }
      if(attrs.pass == ""){
	err.pass = "is_null";
      }
      return _.isEmpty(err) ? null : err;
    }
  });

  // 会在不同的区域进行显示
  var RegisterView = App.DialogView.extend({
    tagName: "div",
    className: "register-view",
    template: "#register-view-template",
    events:{
      "blur #name"     : "blurName",
      "blur #pass"     : "blurPass",
      "focus #name"    : "cleanError",
      "focus #pass"    : "cleanError",
      "input #name"   : "changeAction",
      "input #pass"   : "changeAction",
      "change #agree"   : "changeAction",
      "click #agree"   : "agreeAction",
      "click .r_login" : "gotoLogin",
      "click .reg_btn" : "submit",
      "click .weibo"   : "openWeibo",
      "click .twitter" : "openTwitter",
      "click .masker"  : "masker",
      "click .close_w" : "cancel"
    },
    initialize: function(){
      this.tmpmodel = new App.Model.RegisterModel();
      this.bind("@cancel", cancel);
    },
    blurName: function(e){
      var that = this;
      var name = $("#name").val();
      this.tmpmodel.save({name:name},{
	url : App.ClipApp.encodeURI(P+"/user/check/"+name),
	type: "GET",
	success:function(model,response){
	  if($("#pass").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	    $(".reg_btn").attr("disabled",false);
	  }
	},
	error:function(model,error){
	  that.showError("register",error);
	  $(".reg_btn").attr("disabled",true);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError("login",error);
	  $(".reg_btn").attr("disabled",true);
	}
      });
      if($("#name").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }
    },
    changeAction: function(e){
      if($("#name").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }
    },
    agreeAction: function(e){
      if($("#name").val() && $("#pass").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }else{
	$(".reg_btn").attr("disabled",true);
      }
    },
    gotoLogin : function(e){
      e.preventDefault();
      this.trigger("@cancel");
      App.ClipApp.showLogin();
    },
    submit: function(e){
      e.preventDefault();
      var that = this;
      var data = that.getInput();
      var model = new App.Model.RegisterModel();
      if($(".error").length == 0){
	if($("#agree").attr("checked")){
	  model.save(data,{
	    url : App.ClipApp.encodeURI(P+"/register"),
	    type: "POST",
	    success:function(model,response){
	      App.vent.trigger("app.clipapp.register:gotToken","register_success",response);
	    },
	    error:function(model,error){
	      that.showError('register',error);
	    }
	  });
	}else{
	  $(e.currentTarget).attr("disabled",true);
	}
      }else{
	$(e.currentTarget).attr("disabled",true);
      }
    },
    openWeibo : function(e){
      this.trigger("@cancel");
      window.location.href="/oauth/req/weibo";
    },
    openTwitter : function(e){
      this.trigger("@cancel");
      window.location.href="/oauth/req/twitter";
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@cancel");
      }
    },
    cancel : function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });

  Register.invite = function(key){
    var model = new App.Model(); // 不能用RegisterModel
    model.save({},{
      url : App.ClipApp.encodeURI(P+"/invite/"+key),
      type: "POST",
      success:function(model,response){
	App.vent.trigger("app.clipapp.register:gotToken","invite",response);
      },
      error:function(model,error){
	App.ClipApp.showConfirm(error);
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
    $(".reg_btn").attr("disabled",true);
  };

  App.vent.bind("app.clipapp.register:gotToken", function(key, res){
    Register.close();
    var data = new Date();
    data.setTime(data.getTime() + 7*24*60*60*1000);
    document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    Backbone.history.navigate("my", true);
    App.vent.trigger("app.clipapp.register:success", key, res);
  });

  var cancel = function(){
    Register.close();
  };

  // Test
  // App.bind("initialize:after", function(){Register.show();});

  return Register;
})(App, Backbone, jQuery);