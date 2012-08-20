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
      "click .masker"        : "masker",
      "click .close_w"       : "cancelClick"
    },
    initialize:function(){
      this.flag = false;
      this.bind("ok", ok);
      this.bind("closeView", close);
    },
    okClick : function(e){
      this.trigger("ok",this.model);
    },
    masker : function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("close");
      };
    },
    cancelClick : function(e){
      this.trigger("close");
    }
   });

   var ok = function(deleteModel){
     deleteModel.destroy({
       success: function(model, res){
	 App.vent.trigger("app.clipapp.cliplist:remove",model.id);
	 //在删clip时不能根据删除clip的tag来refresh   bubbs。所以重新load
	 ClipDelete.close();
	 if(/my/.test(window.location.hash))
	   App.vent.trigger("app.clipapp.bubb:showUserTags",App.util.getMyUid());
	 if(App.viewRegion.$el){ // 从detail来，需要关闭viewRegion
	   App.vent.trigger("app.clipapp.clipdetail:close");
	 }
       },
       error: function(model, error){
	 App.vent.trigger("app.clipapp.message:confirm",error);
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