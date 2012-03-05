// app.clippreviewapp.js
var P = '/_2_/';
App.ClipPreviewApp = (function(App, Backbone, $){
  var ClipPreviewApp = {};
  var ClipPreviewModel = App.Model.extend({});
  var start = 0;
  var end = 9;
  var id = null;
  var collection = null;
  PreviewList = App.Collection.extend({
    model : ClipPreviewModel
  });
  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    template: "#clippreview-view-template"
  });
  var PreviewListView = App.CollectionView.extend({
    tagName: "div",
    className: "clippreview-item",
    itemView: ClipPreviewView,
    initialize: function(){
      var view = this;
      $(document).scroll(function(evt){
	var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
	if(view.$el[0].scrollHeight > 0 && (view.$el[0].scrollHeight - scrollTop)<500){
	  start = start +10;
	  end = end + 10;
	  collection.url = P + "user/" + id + "/clip/" + start + ".." + end;
	  collection.fetch({add: true});
	}
      });
    }
  });
  var showClipPreview = function(previewlist){
    console.info(previewlist.toJSON());
    var previewView = new PreviewListView({
      collection: previewlist
    });
    App.listRegion.show(previewView);
  };

  ClipPreviewApp.show = function(uid,s,e){
    collection = new PreviewList();
    start = parseInt(s);
    end = parseInt(e);
    id = uid;
    collection.url = P + "user/" + id + "/clip/" + start + ".." + end;
    collection.fetch();
    collection.onReset(function(previewlist){
      App.vent.trigger("clippreview:show", previewlist);
    });
  };

  App.vent.bind("clippreview:show", function(previewlist){
    showClipPreview(previewlist);
  });

  return ClipPreviewApp;

})(App, Backbone, jQuery);
