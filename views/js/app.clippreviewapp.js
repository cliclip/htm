// app.clippreviewapp.js
var P = '/_2_/';
App.ClipPreviewApp = (function(App, Backbone, $){
  var ClipPreviewApp = {};
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      id:"",
      name:"",
      content:{
	text:"",//text:String
	image:""//image:imgid || url
      },
      note:{
	text:"",//{text:string}
	sound:""//{sound:sndid}
      },
      device:"",
      city:"",
      source:{
	type:""//type : "browser" | "clipboard" | "photolib" | "camera"
      }
    },
    validate:function(){},
    initialize:function(){},
    parse : function(resp, xhr) {
    //console.info(resp);
    return resp;
    }
  });
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
    itermView: ClipPreviewView
  });
  var showClipPreview = function(previewlist){
    var clipPreviewView = new ClipPreviewView({
      collection: previewlist
    });

    App.listRegion.show(clipPreviewView);
  };

  ClipPreviewApp.show = function(uid,s,e){
    var collection = new PreviewList();
    collection.url = P + "user/" + uid + "/clip/" + s + ".." + e;
    collection.fetch();
    console.info(collection);
    collection.onChange(function(previewlist){
      App.vent.trigger("clippreview:show", previewlist);
    });
  };

  App.vent.bind("clippreview:show", function(previewlist){
    showClipPreview(previewlist);
  });

  return ClipPreviewApp;
})(App, Backbone, jQuery);
