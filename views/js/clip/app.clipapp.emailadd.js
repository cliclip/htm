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
  var EmailActiveModel = App.Model.extend({
    defaults:{
      email:"",
      com:""
    }
  });

  var EmailAddView = App.ItemView.extend({
    tagName: "div",
    className: "emailadd-view",
    template: "#emailAdd-view-template",
    events: {
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose",
      "click .close_w"        :"EmailAddclose"
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
    }
  });
  var EmailActiveView = App.ItemView.extend({
    tagName: "div",
    className: "emailactive-view",
    template: "#emailActive-view-template",
    events: {
      "click #active_cancel":"EmailActiveclose"
    },
    EmailActiveclose: function(){
      App.popRegion.close();
    }
  });

  EmailAdd.showEmailAdd = function(uid,model,error){
    var emailAddModel = new EmailAddModel({id:uid});
    if (model) emailAddModel.set(model.toJSON());
    if (error) emailAddModel.set("error", error);
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.popRegion.show(emailAddView);
    if(error){
      $("#alert").css("display","block");
    }else{
      $("#alert").css("display","none");
    }
  };
  EmailAdd.showActive = function(email,com){
    var emailActiveModel = new EmailActiveModel();
    emailActiveModel.set({email:email});
    emailActiveModel.set({com:com});
    var emailActiveView = new EmailActiveView({model : emailActiveModel});
    App.popRegion.show(emailActiveView);
  };

  EmailAdd.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    EmailAdd.showEmailAdd(uid);
  });
  App.vent.bind("app.clipapp.emailadd:success",function(email){
      var com = "";
      if(email.split("@")[1] == "qq.com"){
	com = "http://mail.qq.com";
      }else{
	com = "http://www."+email.split("@")[1];
      }
      EmailAdd.close();
      EmailAdd.showActive(email,com);
  });
  App.vent.bind("app.clipapp.emailadd:error",function(model,error){
    EmailAdd.showEmailAdd(null,model,error);
  });

  return EmailAdd;
})(App, Backbone, jQuery);