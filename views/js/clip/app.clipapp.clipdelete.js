// app.delete.js
App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {}, flag = false;
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
      flag = false;
    },
    okClick : function(e){
      App.vent.trigger("app.clipapp.clipdelete:@ok",this.model);
    },
    masker : function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelClick(e);
      };
    },
    cancelClick : function(e){
      App.vent.trigger("app.clipapp.clipdelete:@close");
     }
   });

   ClipDelete.show = function(cid){
     var model = new App.Model.DetailModel({id:cid});
     var view = new DeleteView({model : model});
     App.popRegion.show(view);
     if(!$("body").hasClass("noscroll")){
       flag = true;
       $("body").addClass("noscroll");
     }
   };

   ClipDelete.close = function(){
     if(flag) { $("body").removeClass("noscroll"); }
     App.popRegion.close();
   };

   App.vent.bind("app.clipapp.clipdelete:@ok",function(deleteModel){
     deleteModel.destroy({
       success: function(model, res){
	 App.vent.trigger("app.clipapp.cliplist:remove",model.id);
	 //在删clip时不能根据删除clip的tag来refresh   bubbs。所以重新load
	 if(/my/.test(window.location.hash)){
	   App.vent.trigger("app.clipapp.bubb:showUserTags",App.util.getMyUid());
	 }
	 ClipDelete.close();
	 if(App.viewRegion){ // 从detail来，需要关闭viewRegion
	   App.vent.trigger("app.clipapp.clipdetail:@close");
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
     // ClipDelete.show();
     //	删除出错
   });

  // TEST
  //App.bind("initialize:after", function(){ ClipDelete.show(); });

  return ClipDelete;
})(App, Backbone, jQuery);