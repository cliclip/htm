// app.delete.js
App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {};
  var DeleteView = App.ItemView.extend({
    tagName : "div",
    className : "delete-view",
    template : "#delete-view-template",
    events : {
      "click #deleteok_button" : "okClick",
      "click #cancel_button" : "cancelClick",
      "click .close_w"       : "cancelClick"
    },
    okClick : function(e){
      App.vent.trigger("app.clipapp.clipdelete:@ok",this.model);
    },
    cancelClick : function(e){
      App.vent.trigger("app.clipapp.clipdelete:@close");
     }
   });

   ClipDelete.show = function(cid){
     var model = new App.Model.DetailModel({id:cid});
     var view = new DeleteView({model : model});
     App.popRegion.show(view);
   };

   ClipDelete.close = function(){
     App.popRegion.close();
   };
   App.vent.bind("app.clipapp.clipdelete:@ok",function(deleteModel){
     deleteModel.destroy({
       success: function(model, res){
	 App.vent.trigger("app.clipapp.cliplist:remove",deleteModel.id);
	 //在删clip时不能根据删除clip的tag来refresh   bubbs。所以重新load
 	 App.vent.trigger("app.clipapp.bubb:showUserTags",App.util.getMyUid());
	 ClipDelete.close();
	 if(App.viewRegion){ // 从detail来，需要关闭viewRegion
	   App.viewRegion.close();
	 }
       },
       error: function(model, res){
	 App.vent.trigger("app.clipapp.clipdelete:@error", model, res);
       }
     });
   });
   App.vent.bind("app.clipapp.clipdelete:@close", function(){
     ClipDelete.close();
   });
   App.vent.bind("app.clipapp.clipdelete:@error", function(model, error){
     ClipDelete.show();
   });

  // TEST
  //App.bind("initialize:after", function(){ ClipDelete.show(); });

  return ClipDelete;
})(App, Backbone, jQuery);