App.ClipApp.FindPass=(function(App,Backbone,$){
  var FindPass = {};

  var FindPassModel = App.Model.extend({
    url: App.ClipApp.Url.base+"/password/find"
  });
  var FindPassView=App.ItemView.extend({
    tagName:"div",
    className:"findpass-view",
    template:"#findpass-view-template",
    events:{
      "click input[type=submit]"  :  "submit",
      "click input[type=reset]"  :  "cancel"
    },
    submit:function(e){
      var address = $("#address").val();
      e.preventDefault();
      this.model.save({address:address},{
	type:"POST",
	success:function(model,res){
	  var link=res;//供测试使用
	  App.vent.trigger("app.clipapp.findpass:success",res);
	},
	error:function(model, res){
	  App.vent.trigger("app.clipapp.findpass:error",model,res);
	}
      });
    },
    cancel:function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.findpass:cancel");
    }
  });
  FindPass.show=function(model,error){
    var findPassModel=new FindPassModel();
    if(model) findPassModel.set(model.toJSON());
    if(error) findPassModel.set("error",error);
    var findPassView=new FindPassView({model:findPassModel});
    App.popRegion.show(findPassView);
  };
  FindPass.close=function(){
    App.popRegion.close();
  };
    //link仅供测试使用
  App.vent.bind("app.clipapp.findpass:success",function(link){
   // Backbone.history.navigate("",true);
    Backbone.history.navigate("password/reset/"+link,true);//测试使用
    FindPass.close();
  });
  App.vent.bind("app.clipapp.findpass:error",function(model,error){
    FindPass.show(model,error);
  });

  App.vent.bind("app.clipapp.findpass:cancel",function(){
    FindPass.close();
  });

  return FindPass;
})(App,Backbone,jQuery);