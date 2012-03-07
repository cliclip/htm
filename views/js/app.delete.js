// app.delete.js

App.Delete = (function(App, Backbone, $){
  var Delete = {};
  var DeleteModel = App.Model.extend({});

  var DeleteView = App.ItemView.extend({
  	tagName : "div",
  	className : "delete-view",
  	template : "#delete-view-template",
  	events : {
  	  "click #delete_button" : "delete",
  	  "click #cancel_button" : "cancel"
  	},

  	delete : function(e){
	  e.preventDefault();
	  var url = "/_2_/clip/1:1";
	  App.vent.trigger("delete", url, this.model.cid);
  	},
  	cancel : function(e){
  	  e.preventDefault();
  	  App.vent.trigger("delete-view:cancel");
  	}
  });

  Delete.open = function(model, error){
  	var deleteModel = new DeleteModel();
  	if (model) deleteModel.set(model.toJSON());
  	if (error) deleteModel.set("error", error);
  	deleteView = new DeleteView({model : deleteModel});
	App.popRegion.show(deleteView);
  };

  Delete.close = function(){
  	App.popRegion.close();
  };

  var deleteAction = function(url,cid){
    var del = new DeleteModel({id:cid});
    del.destroy({
      url: url,
      success: function(model, res){
  	 App.vent.trigger("delete-view:success");
       },
      error: function(model, res){
  	 App.vent.trigger("delete-view:error", model, res);
       }
     });
  };

  App.vent.bind("delete", function(url, cid){
    deleteAction(url, cid);
  });

  App.vent.bind("delete-view:success", function(){
  	Delete.close();
  });

  App.vent.bind("delete-view:error", function(model, error){
  	Delete.open(model, error);
  });

  App.vent.bind("delete-view:cancel", function(){
  	Delete.close();
  });

  // TEST
  //App.bind("initialize:after", function(){ Delete.open(); });

  return Delete;
})(App, Backbone, jQuery);