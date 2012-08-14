App.ClipApp.EmailAdd = (function(App, Backbone, $){
  var EmailAdd = {};
  var P = App.ClipApp.Url.base;

  var EmailAddModel = App.Model.extend({
    defaults:{
      email:""
    },
    validate:function(attrs){
      var email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
      if(!attrs.email || attrs.email == undefined){
	return {email:"is_null"};
      }else if(!email_pattern.test(attrs.email)){
	return {email:"invalidate"};
      }else{
	return null;
      }
    },
    url:function(){
      var my = App.util.getMyUid();
      return P+"/user/"+my+"/email";
    }
  });

  var EmailAddView = App.ItemView.extend({
    tagName: "div",
    className: "emailadd-view",
    template: "#emailAdd-view-template",
    events: {
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose",
      "click .masker_layer"   :"EmailAddclose",
      "click .close_w"        :"EmailAddclose",
      "focus #email"          :"cleanError",
      "error" : "showError"
    },
    EmailAddclose: function(){
      var data = this.getInput();
      data.email = data.email.toLowerCase(); // 将要添加的邮件地址转换为小写
      App.vent.trigger("app.clipapp.emailadd:@close",data.email);
    },
    EmailAddcommit: function(){
      var view = this;
      var data = view.getInput();
      this.model.save(data,{
	type:"POST",
	success: function(model, res){
	  App.vent.trigger("app.clipapp.message:confirm", "addemail", model.get("email"));
	  App.vent.trigger("app.clipapp.emailadd:@close");
	},
	error:function(model, res){
	  if(res.email == "no_uname"){
	    App.vent.trigger("app.clipapp.message:confirm", res);
	  }else{
	    view.showError('emailAdd',res);
	  }
	}
      });
    }
  });

  EmailAdd.show = function(uid){
    var emailAddModel = new EmailAddModel();
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.popRegion.show(emailAddView);
  };

  EmailAdd.active = function(key){
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.Url.base+"/active/"+key,
      type: "POST",
      success:function(model,response){
	// 不只是弹出提示框这么简单
	App.vent.trigger("app.clipapp.message:confirm", {active:"email"}, response.email);
      },
      error:function(model,error){
	// 则显示该链接不能再点击
	App.vent.trigger("app.clipapp.message:confirm", error);
      }
    });
  };

  EmailAdd.close = function(address){
    if(!address)
      App.popRegion.close();
    else{
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      App.vent.trigger("app.clipapp.message:alert", "emailadd_save");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.popRegion.close();
      });
    }
  };

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    EmailAdd.show(uid);
  });

  // 操作完成直接关闭 view
  App.vent.bind("app.clipapp.emailadd:@close",function(address){
    EmailAdd.close(address);
  });


  return EmailAdd;
})(App, Backbone, jQuery);