App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {};
  var DeleteView = App.DialogView.extend({
    tagName : "div",
    className : "delete-view",
    template : "#delete-view-template",
    events : {
      "click #deleteok_button" : "okClick",
      "click #cancel_button" : "cancelClick",
      "click .masker"        : "masker",
      "click .close_w"       : "cancelClick"
    },
    initialize:function(){
      this.bind("@ok", ok);
      this.bind("@closeView", close);
    },
    okClick : function(e){
      this.trigger("@ok",this.model);
    },
    masker : function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@closeView");
      };
    },
    cancelClick : function(e){
      this.trigger("@closeView");
    }
   });

   var ok = function(deleteModel){
     deleteModel.destroy({
       success: function(model, res){
	 ClipDelete.close();
	 App.vent.trigger("app.clipapp.clipdelete:success", model.id);
       },
       error: function(model, error){
	 App.ClipApp.showConfirm(error);
       }
     });
   };

   var close = function(){
     ClipDelete.close();
   };

   ClipDelete.show = function(cid){
     var model = new App.Model.DetailModel({id:cid});
     var view = new DeleteView({model : model});
     App.popRegion.show(view);
   };

   ClipDelete.close = function(){
     App.popRegion.close();
   };

  // TEST
  //App.bind("initialize:after", function(){ ClipDelete.show(); });

  return ClipDelete;
})(App, Backbone, jQuery);