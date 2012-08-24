App.ClipApp.ResetPass=(function(App,Backbone,$){
  var ResetPass = {};
  var P = App.ClipApp.Url.base;

  var ResetPassModel = App.Model.extend({
    validate:function(attrs){
      var error = {};
      if(!attrs.newpass){
	error["newpass"] = "is_null";
      }
      if(!attrs.confirm){
	error["conpass"] = "is_null";
      }
      if(attrs.newpass && attrs.confirm && attrs.newpass != attrs.confirm){
	error["confirm"] = "password_diff";
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });
  var ResetPassView=App.ItemView.extend({
    tagName:"div",
    className:"resetpass-view",
    template:"#resetpass-view-template",
    events:{
      "focus #newpass":"clearmsg",
      "focus #confirm":"clearmsg",
      "keydown #confirm": "keydownAction",
      "click #submit" :  "submit",
      "click #reset"  :  "reset",
      "click .close_w":  "cancel"
    },
    initialize: function(){
      this.bind("@success", success);
      this.bind("@cancel",cancel);
    },
    clearmsg:function(e){
      this.cleanError(e);
    },
    keydownAction : function(e){
      $('#confirm').unbind("keydown");
      if(e.keyCode==13){
	$("#confirm").blur();
	$('#submit').click();
      }
    },
    submit:function(e){
      e.preventDefault();
      that=this;
      var newpass = $("#newpass").val();
      var conpass = $("#confirm").val();
      this.model.save({newpass:newpass,confirm:conpass},{
	url: P+"/password/reset/"+this.model.get("link"),
	type:"PUT",
	success:function(model,res){
	  this.trigger("@success",res);
	},
	error:function(model,res){
	  if(res.link){
	    App.ClipApp.showConfirm(res,null,function(){
	      ResetPass.close();
	      Backbone.history.navigate("",true);
	    });
	  }else{
	    that.showError('resetpass',res);
	  }
	}
      });
    },
    reset:function(e){
      e.preventDefault();
      $("#newpass").val("");
      $("#confirm").val("");
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });
  ResetPass.show=function(link){
    var resetPassModel=new ResetPassModel({link:link});
    var resetPassView=new ResetPassView({model:resetPassModel});
    App.popRegion.show(resetPassView);
  };
  ResetPass.close=function(){
    App.popRegion.close();
  };

  var success = function(res){
    ResetPass.close();
    document.cookie = "token="+res.token;
    App.ClipApp.showSuccess("resetpwd_success");
    App.vent.trigger("app.clipapp.login:success",res);
  };
			 
  var cancel = function(){
    ResetPass.close();
    Backbone.history.navigate("",true);
  };

   return ResetPass;
})(App,Backbone,jQuery);