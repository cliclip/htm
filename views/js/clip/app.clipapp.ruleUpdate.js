App.ClipApp.RuleUpdate = (function(App, Backbone, $){
  var RuleUpdate = {};
  var P = App.ClipApp.Url.base;

  var RuleUpdateModel = App.Model.extend({
    defaults:{
      uid:"",
      address:""
    },
    url:function(){
      return P+"/user/"+this.id+"/email";
    }
  });

  var RuleUpdateView = App.ItemView.extend({
    tagName: "div",
    className: "ruleEdit-view",
    template: "#ruleEdit-view-template",
    events: {
      "click #popup_ContactClose":"EmailAddclose",
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose"
    },
    EmailAddclose: function(){
      EmailAdd.close();
    },
    EmailAddcommit: function(){
      console.log("111");
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

  RuleUpdate.showEmailAdd = function(uid,model,error){
    var emailAddModel = new EmailAddModel({id:uid});
    if (model) emailAddModel.set(model.toJSON());
    if (error) emailAddModel.set("error", error);
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.popRegion.show(emailAddView);

  };

  RuleUpdate.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    RuleUpdate.showRuleUpdate(uid);
  });
  App.vent.bind("app.clipapp.emailadd:success",function(uid){
    RuleUpdate.close();
    App.vent.bind("app.clipapp.useredit:show",uid);
  });
  App.vent.bind("app.clipapp.emailadd:error",function(model,error){
    RuleUpdate.showRuleUpdate(null,model,error);
  });

  return RuleUpdate;
})(App, Backbone, jQuery);