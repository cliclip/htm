App.ClipApp.EmailAdd = (function(App, Backbone, $){
  var EmailAdd = {};
  var P = App.ClipApp.Url.base;
  var email_pattern = App.util.email_pattern;

  var EmailAddModel = App.Model.extend({
    defaults:{
      email:""
    },
    validate:function(attrs){
      if(!attrs.email || attrs.email == undefined){
	return {email:"is_null"};
      }else if(!email_pattern.test(attrs.email)){
	return {email:"invalidate"};
      }else{
	return null;
      }
    },
    url:function(){
      var my = App.ClipApp.getMyUid();
      return App.ClipApp.encodeURI(P+"/"+my+"/email");
    }
  });

  var EmailAddView = App.DialogView.extend({
    tagName: "div",
    className: "emailadd-view",
    template: "#emailAdd-view-template",
    events: {
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose",
      "click .masker_layer"   :"EmailAddclose",
      "click .close_w"        :"EmailAddclose",
      "blur #email"           :"blurAction",
      "focus #email"          :"cleanError"
    },
    initialize: function(){
      this.bind("@closeView", close);
    },
    EmailAddclose: function(){
      var data = this.getInput();
      this.trigger("@closeView",data.email);
    },
    EmailAddcommit: function(){
      var view = this;
      var data = view.getInput();
      if(data.email){ data.email = data.email.toLowerCase(); }
      this.model.save(data,{
	type:"POST",
	success: function(model, res){
	  App.ClipApp.showConfirm("addemail", model.get("email"));
	  view.trigger("@closeView");
	},
	error:function(model, res){
	  view.showError('emailAdd',res);
	}
      });
    },
    blurAction: function(){
      var view = this;
      var data = view.getInput();
      if(data.email){ data.email = data.email.toLowerCase(); }
      if(!data.email || data.email == undefined){
	view.showError('emailAdd',{email:"is_null"});
      }else if(!email_pattern.test(data.email)){
	view.showError('emailAdd',{email:"invalidate"});
      }else{
	return null;
      }
    }
  });

  // 操作完成直接关闭 view
  var close = function(address){
    EmailAdd.close(address);
  };

  EmailAdd.show = function(uid){
    var emailAddModel = new EmailAddModel();
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.popRegion.show(emailAddView);
  };

  EmailAdd.active = function(key){
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.encodeURI(P+"/active/"+key),
      type: "POST",
      success:function(model,response){ // 不只是弹出提示框这么简单
	App.ClipApp.showConfirm({active:"email"},response.email);
	Backbone.history.navigate("", true);
      },
      error:function(model,error){ // 则显示该链接不能再点击
	App.ClipApp.showConfirm(error, null, function(){
	  App.ClipApp.showUserEdit();
	});
      }
    });
  };

  EmailAdd.close = function(address){
    if(!address)
      App.popRegion.close();
    else{
      var fun = function(){App.popRegion.close();};
      App.ClipApp.showAlert("emailadd_save", null, fun);
    }
  };

  return EmailAdd;
})(App, Backbone, jQuery);