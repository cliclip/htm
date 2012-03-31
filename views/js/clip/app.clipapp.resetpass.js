App.ClipApp.ResetPass=(function(App,Backbone,$){
  var ResetPass = {};

  var ResetPassModel = App.Model.extend({});
  var ResetPassView=App.ItemView.extend({
    tagName:"div",
    className:"resetpass-view",
    template:"#resetpass-view-template",
    events:{
      "click input[type=submit]"  :  "submit",
      "click input[type=reset]"  :  "reset"
    },
    submit:function(e){
      var pass1 = $("#pass1").val();
      var pass2 = $("#pass2").val();
      e.preventDefault();
      if(!pass1 || !pass2){
	App.vent.trigger("app.clipapp.resetpass:error",this.model,{error:"请输入新密码"});
      }else{
	if(pass1==pass2){
	  this.model.save({pass:pass2},{
	    url:App.ClipApp.Url.base+"/password/reset/"+this.model.get("link"),
	    type:"PUT",
	    success:function(model,res){
	      App.vent.trigger("app.clipapp.resetpass:success",res);
	    },
	    error:function(model, res){
	      App.vent.trigger("app.clipapp.resetpass:error",model,res);
	    }
	  });
	}else{
	  App.vent.trigger("app.clipapp.resetpass:error",this.model,{error:"两次密码不一致"});
	}
      }
    },
    reset:function(e){
      e.preventDefault();
      $("#pass1").val("");
      $("#pass2").val("");
    }
  });
  ResetPass.show=function(link,model,error){
    var resetPassModel=new ResetPassModel({
      link:link
    });
    if(model) resetPassModel.set(model.toJSON());
    if(error) resetPassModel.set("error",error);
    var resetPassView=new ResetPassView({model:resetPassModel});
    App.popRegion.show(resetPassView);
  };
  ResetPass.close=function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.resetpass:success",function(link){
    Backbone.history.navigate("",true);
    ResetPass.close();
  });
  App.vent.bind("app.clipapp.resetpass:error",function(model,error){
    ResetPass.show(model.get("link"),model,error);
  });

  return ResetPass;
})(App,Backbone,jQuery);