// app.delete.js
App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {};
  var DeleteModel = App.Model.extend({
    url : function(){
      return App.ClipApp.Url.base+"/clip/"+this.id;
      console.log(this.id);
    }
  });

  var DeleteView = App.ItemView.extend({
    tagName : "div",
    className : "delete-view",
    template : "#delete-view-template",
    events : {
      "click #deleteok_button" : "delete",
      "click #cancel_button" : "cancel"
    },
    delete : function(e){
      e.preventDefault();
      var clipid = this.options.clipid;
      App.vent.trigger("app.clipapp.clipdelete:action",clipid);
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.clipdelete:cancel");
     }
   });

   ClipDelete.show = function(clipid){
     var deleteModel = new DeleteModel();
     var deleteView = new DeleteView({model : deleteModel,clipid:clipid});
     App.popRegion.show(deleteView);
   };

   ClipDelete.close = function(){
     App.popRegion.close();
   };

   var deleteAction = function(clipid){
     var del = new DeleteModel({id:clipid});
     del.destroy({
       success: function(model, res){
	 App.vent.trigger("app.clipapp.clipdelete:success");
       },
       error: function(model, res){
	 App.vent.trigger("app.clipapp.clipdelete:error", model, res);
       }
     });
   };

  App.vent.bind("app.clipapp.clipdelete:action", function(cid){
    deleteAction(cid);
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    ClipDelete.close();
    // 操作成功刷新页面
    location.reload();
  });

  App.vent.bind("app.clipapp.clipdelete:error", function(model, error){
    ClipDelete.show(null);
  });

  App.vent.bind("app.clipapp.clipdelete:cancel", function(){
   ClipDelete.close();
  });

  // TEST
  //App.bind("initialize:after", function(){ ClipDelete.show(); });

  return ClipDelete;
})(App, Backbone, jQuery);