App.ClipApp.EmailAdd = (function(App, Backbone, $){
  var EmailAdd = {};
  var P = App.ClipApp.Url.base;

  var EmailAddModel = App.Model.extend({
    defaults:{
      uid:"",
      address:""
    },
    url:function(){
      return P+"/user/"+this.id+"/email";
    }
  });

  var EmailAddView = App.ItemView.extend({
    tagName: "div",
    className: "emailadd-view",
    template: "#emailAdd-view-template",
    events: {
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose",
      "click .close_w"        :"EmailAddclose",
      "focus .input_text"     :"cleanError"
    },
    EmailAddclose: function(){
      EmailAdd.close();
    },
    EmailAddcommit: function(){
      var address = $("#email_address").val();
      this.model.save({email: address},{
	type: "POST",
  	success: function(model, res){
   	  App.vent.trigger("app.clipapp.emailadd:success",address);
  	},
  	error:function(model, res){
  	  App.vent.trigger("app.clipapp.emailadd:error", model, res);
  	}
      });
    },
    cleanError:function(){
      $("#alert").css("display","none");
    }
  });
  EmailAdd.showEmailAdd = function(uid,model,error){
    var emailAddModel = new EmailAddModel({id:uid});
    if (model) emailAddModel.set(model.toJSON());
    if (error) emailAddModel.set("error", error);
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.setpopRegion.show(emailAddView);
    if(error){
      $("#alert").css("display","block");
    }else{
      $("#alert").css("display","none");
    }
  };


  App.vent.bind("app.clipapp.emailadd:active", function(key){
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.Url.base+"/active/"+key,
      type: "POST",
      success:function(model,response){
	// 不只是弹出提示框这么简单
	App.vent.trigger("app.clipapp.message:confirm", "active", response.email);
      },
      error:function(model,error){
	// 则显示该链接不能再点击
	App.vent.trigger("app.clipapp.message:chinese", error);
      }
    });
  });


  EmailAdd.close = function(){
    App.setpopRegion.close();
  };

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    EmailAdd.showEmailAdd(uid);
  });

  App.vent.bind("app.clipapp.emailadd:success",function(email){
      EmailAdd.close();
      App.vent.trigger("app.clipapp.message:confirm", "addemail", email);
  });
  App.vent.bind("app.clipapp.emailadd:error",function(model,error){
    EmailAdd.showEmailAdd(null,model,App.util.getErrorMessage(error));
  });

  return EmailAdd;
})(App, Backbone, jQuery);