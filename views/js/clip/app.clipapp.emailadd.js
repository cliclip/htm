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
      "click #popup_ContactClose":"EmailAddclose",
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose"
    },
    EmailAddclose: function(){
      EmailAdd.close();
    },
    EmailAddcommit: function(){
      var address = $("#email_address").val();
      console.log(address);
      this.model.save({email: address},{
	type: "POST",
  	success: function(model, res){
   	  App.vent.trigger("app.clipapp.emailadd:success",model.id);
  	},
  	error:function(model, res){
  	  App.vent.trigger("app.clipapp.emailadd:error", model, res);
  	}
      });
    }
  });

  EmailAdd.showEmailAdd = function(uid,model,error){
    var emailAddModel = new EmailAddModel({id:uid});
    if (model) emailAddModel.set(model.toJSON());
    if (error) emailAddModel.set("error", error);
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.popRegion.show(emailAddView);

  };

  EmailAdd.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    EmailAdd.showEmailAdd(uid);
  });
  App.vent.bind("app.clipapp.emailadd:success",function(uid){
    EmailAdd.close();
    App.vent.bind("app.clipapp.useredit:show",uid);
  });
  App.vent.bind("app.clipapp.emailadd:error",function(model,error){
    EmailAdd.showEmailAdd(null,model,error);
  });

  return EmailAdd;
})(App, Backbone, jQuery);