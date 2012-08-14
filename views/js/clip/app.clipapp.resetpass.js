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
      "click #submit" :  "submit",
      "click #reset"  :  "reset",
      "click .close_w":  "cancel"
    },
    clearmsg:function(e){
      this.cleanError(e);
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
	  console.log(res.token);
	  App.vent.trigger("app.clipapp.resetpass:@success",res);
	},
	error:function(model,res){
	  if(res.link){
	    App.vent.trigger("app.clipapp.message:confirm",res);
	    App.vent.unbind("app.clipapp.message:sure");
	    App.vent.bind("app.clipapp.message:sure",function(){
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
       App.vent.trigger("app.clipapp.resetpass:cancel");
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

  App.vent.bind("app.clipapp.resetpass:@success",function(res){
    document.cookie = "token="+res.token;
    ResetPass.close();
    Backbone.history.navigate("my",true);
    console.log(document.cookie);
    App.vent.trigger("app.clipapp.message:success","resetpwd_success");
    Backbone.history.navigate("my",true);
  });
  App.vent.bind("app.clipapp.resetpass:cancel",function(){
    ResetPass.close();
    Backbone.history.navigate("",true);
  });

  App.bind("initialize:after", function(){
    var res={token:"1:68e8deb1a984f0298b05d7ca27c7eb7a"};
      //App.vent.trigger("app.clipapp.resetpass:@success",res);
   });
   return ResetPass;
})(App,Backbone,jQuery);