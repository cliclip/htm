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
		  console.log(uid);
    EmailAdd.showEmailAdd(uid);
  });
  App.vent.bind("app.clipapp.emailadd:success",function(email){
    $(".email_add").remove();
      var com = "";
      if(email.split("@")[1] == "qq.com"){
	com = "http://mail.qq.com";
      }else{
	com = "http://www."+email.split("@")[1];
      }
    var emailDiv = "<div id='email_add'>你添加的邮箱是："+email+"<br><a href='"+com+"' target=\"_blank\">点击激活<a></div>";
    $(".emailadd_edit").append(emailDiv);
   // App.vent.bind("app.clipapp.useredit:show",uid);
  });
  App.vent.bind("app.clipapp.emailadd:error",function(model,error){
    EmailAdd.showEmailAdd(null,model,error);
  });

  return EmailAdd;
})(App, Backbone, jQuery);