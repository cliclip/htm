// app.clippreviewapp.js
//var P = '/_2_/';
App.ClipPreviewApp = (function(App, Backbone, $){
  var ClipPreviewApp = {};
  var start = 0;
  var end = 9;
  var id = null;
  var collection = null;

  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommend:"",
      id:"",
      user:"",
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
      },
      reprint_count:"",
      reply_count:"",
      author:""
    }
  });
  var PreviewList = App.Collection.extend({
    model : ClipPreviewModel
  });
  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    template: "#clippreview-view-template"
/*    timer:"",
    events:{
      "mouseover .recommend":"showMessage",
      "mouseover .author":"showMessage",
      "mouseout .recommend":"closeMessage",
      "mouseout .author":"closeMessage"
    },
    showMessage:function(evt){
      this.timer = window.setTimeout('console.info("显示用户信息")',2000);
      //console.info(this.model.toJSON());
    },
    closeMessage:function(){
    	clearTimeout(this.timer);
    }
*/
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
	  collection.url = P + "/user/" + id + "/clip/" + start + ".." + end;
	  collection.fetch({add: true});
	}
      });
    }
  });

  var showClipPreview = function(previewlist){
    //console.info(previewlist.toJSON());
    var previewView = new PreviewListView({
      collection : previewlist
    });
    App.listRegion.show(previewView);
  };

  ClipPreviewApp.show = function(uid,s,e){
    collection = new PreviewList();
    start = parseInt(s);
    end = parseInt(e);
    id = uid;
    //collection.url = "/test/recommend.json";
    //collection.url = "/test/clip.json";
    collection.url = P + "/user/" + id + "/clip/" + start + ".." + end;
    collection.fetch();
    collection.onReset(function(previewlist){
      App.vent.trigger("clippreview:show", previewlist);
    });
  };

  App.vent.bind("clippreview:show", function(previewlist){
    showClipPreview(previewlist);
  });

  App.vent.bind("clip_preview:show", function(uid, start, end){
    ClipPreviewApp.show(uid, start, end);
  });

  return ClipPreviewApp;

})(App, Backbone, jQuery);
