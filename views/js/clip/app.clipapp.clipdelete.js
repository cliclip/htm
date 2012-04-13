// app.delete.js
App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {};
  var DeleteModel = App.Model.extend({});
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

   ClipDelete.show = function(cid){
     var deleteModel = new DeleteModel({id:cid});
     var deleteView = new DeleteView({model : deleteModel});
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
     App.vent.trigger("app.clipapp.cliplist:removeshow", model);
     ClipDelete.close();
     if(App.viewRegion){ // 从detail来，需要关闭viewRegion
       App.viewRegion.close();
     }
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