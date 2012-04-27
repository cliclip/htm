App.ClipApp.EmailAdd = (function(App, Backbone, $){
  var EmailAdd = {};
  var P = App.ClipApp.Url.base;

  var EmailAddModel = App.Model.extend({
    defaults:{
      email:""
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
      App.vent.trigger("app.clipapp.emailadd:@close");
    },
    EmailAddcommit: function(){
      var email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
      var address = $("#email_address").val().trim();
      this.model.set({email:address});
      if(!address){
	App.vent.trigger("app.clipapp.emailadd:@error",this.model,{email:"is_null"});
	return false;
      }else if(!email_pattern.test(address)){
	App.vent.trigger("app.clipapp.emailadd:@error",this.model,{email:"invalidate"});
	return false;
      }else{
	App.vent.trigger("app.clipapp.emailadd:@ok",this.model);
	return true;
      }
    },
    cleanError:function(){
      $("#alert").hide();
    }
  });

  EmailAdd.showEmailAdd = function(uid,model,error){
    var emailAddModel = new EmailAddModel({id:uid});
    if (model) emailAddModel.set(model.toJSON());
    if (error) emailAddModel.set("error", error);
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.setpopRegion.show(emailAddView);
    if(error){
      $("#alert").show();
    }else{
      $("#alert").hide();
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

  App.vent.bind("app.clipapp.emailadd:@ok",function(model){
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.message:confirm", "addemail", model.get("email"));
	EmailAdd.close();
      },
      error:function(model, res){
	EmailAdd.showEmailAdd(null,model,App.util.getErrorMessage(res));
      }
    });
  });

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    EmailAdd.showEmailAdd(uid);
  });
  App.vent.bind("app.clipapp.emailadd:@error",function(model,error){
    EmailAdd.showEmailAdd(null,model,App.util.getErrorMessage(error));
  });
  App.vent.bind("app.clipapp.emailadd:@close",function(){
    EmailAdd.close();
  });


  return EmailAdd;
})(App, Backbone, jQuery);