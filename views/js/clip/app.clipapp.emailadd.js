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
      message:""
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
  var EmailActiveView = App.ItemView.extend({
    tagName: "div",
    className: "message-view",
    template: "#message-view-template",
    events: {
      "click #sure": "MessageSure",
      "click #cancel":"Messageclose"
    },
    MessageSure: function(){
      App.setpopRegion.close();
      App.vent.trigger("app.clipapp.message:sure");
    },
    Messageclose: function(){
      App.vent.trigger("app.clipapp.message:cancel");
      App.setpopRegion.close();
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
  EmailAdd.showActive = function(message){
    var emailActiveModel = new EmailActiveModel();
    emailActiveModel.set({message:message});
    var emailActiveView = new EmailActiveView({model : emailActiveModel});
    App.setpopRegion.show(emailActiveView);
  };

  EmailAdd.close = function(){
    App.setpopRegion.close();
  };

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    EmailAdd.showEmailAdd(uid);
  });

  App.vent.bind("app.clipapp.message:alert", function(message){
    EmailAdd.showActive(message);
  });

  App.vent.bind("app.clipapp.emailadd:success",function(email){
      EmailAdd.close();
      App.vent.trigger("app.clipapp.message:alert", email);
      // EmailAdd.showActive(email);
  });
  App.vent.bind("app.clipapp.emailadd:error",function(model,error){
    EmailAdd.showEmailAdd(null,model,App.util.getErrorMessage(error));
  });

  return EmailAdd;
})(App, Backbone, jQuery);