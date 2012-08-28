App.ClipApp.FindPass=(function(App,Backbone,$){
  var FindPass = {};

  var FindPassModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(App.ClipApp.Url.base+"/password/find");
    },
    validate:function(attrs){
      var error = {};
      if(!attrs.address){
	error["address"] = "is_null";
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });
  var FindPassView=App.DialogView.extend({
    tagName:"div",
    className:"findpass-view",
    template:"#findpass-view-template",
    events:{
      "focus #address"  :"clearmsg",
      "keydown #address": "keydownAction",
      "click #submit"   :  "submit",
      "click #cancel"   :  "cancel",
      "click .masker"   :  "masker",
      "click .close_w"  :  "cancel"
    },
    initialize:function(){
      this.bind("@success", success);
      this.bind("@cancel", cancel);
    },
    clearmsg:function(e){
      this.cleanError(e);
    },
    keydownAction : function(e){
      $('#address').unbind("keydown");
      if(e.keyCode==13){
	$("#address").blur();
	$('#submit').click();
      }
    },
    submit:function(e){
      e.preventDefault();
      var that = this;
      var address = this.$("#address").val();
      this.model.save({address:address},{
	type:"POST",
	success:function(model,res){
	  that.trigger("@success",res.address);
	},
	error:function(model, res){
	  that.showError('findpass',res);
	}
      });
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@cancel");
      }
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });

  FindPass.show=function(){
    var findPassModel=new FindPassModel();
    var findPassView=new FindPassView({model:findPassModel});
    App.popRegion.show(findPassView);
  };

  FindPass.close=function(){
    App.popRegion.close();
  };

  var success = function(address){
    Backbone.history.navigate("",true);
    FindPass.close();
    App.ClipApp.showConfirm("go_resetpass",address);
  };

  var cancel = function(){
    FindPass.close();
    Backbone.history.navigate("",true);
    App.ClipApp.showLogin();
  };

 //App.bind("initialize:after", function(){ FindPass.show(); });
  return FindPass;
})(App,Backbone,jQuery);