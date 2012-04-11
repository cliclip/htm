// app.delete.js
App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {};
  var collection = {};
  var DeleteView = App.ItemView.extend({
    tagName : "div",
    className : "delete-view",
    template : "#delete-view-template",
    events : {
      "click #deleteok_button" : "delete",
      "click #cancel_button" : "cancel",
      "click .close_w"       : "cancel"
    },
    delete : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.clipdelete:action",this.model);
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.clipdelete:cancel");
     }
   });

   ClipDelete.show = function(view){
     collection = view.options.model.collection;
     var deleteView = new DeleteView({model : view.model});
     App.popRegion.show(deleteView);
   };

   ClipDelete.close = function(){
     App.popRegion.close();
   };

   var deleteAction = function(clipModel){
     clipModel.destroy({
       url:App.ClipApp.Url.base+"/clip/"+clipModel.id ,
       success: function(model, res){
	 App.vent.trigger("app.clipapp.clipdelete:success",model);
       },
       error: function(model, res){
	 App.vent.trigger("app.clipapp.clipdelete:error", model, res);
       }
     });
   };

  App.vent.bind("app.clipapp.clipdelete:action", function(clipModel){
    deleteAction(clipModel);
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(model){
    collection.remove(model);
    ClipDelete.close();
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