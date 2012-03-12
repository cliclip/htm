// app.clippreviewapp.js
App.ClipApp.Preview = (function(App, Backbone, $){
  var Preview = {};
  var collection = null;
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommend:"",//列表推荐的clip时有此属性
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
      reprint_count:"",//此clip被转摘的次数
      reply_count:"",//此clip被回复的次数
      author:""//此clip的作者，列表推荐和列表follow动态时有此属性
    }
  });
  var CLipPreviewList = App.Collection.extend({
    model : ClipPreviewModel
  });
  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    template: "#clippreview-view-template"
/*  timer:"",
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

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "clippreview-item",
    itemView: ClipPreviewView,
    initialize: function(){
      App.vent.trigger("clip:preview:scroll", this);
    }
  });

  Preview.show = function(){
    collection = new PreviewList();
    //collection.url = "/test/recommend.json";
    //collection.url = "/test/clip.json";
    collection.url = App.clipApp.Url.url + App.clipApp.Url.start+".." + App.clipApp.Url.end;
    collection.fetch();
    collection.onReset(function(previewlist){
      App.vent.trigger("app.clipapp.cliplist:show",previewlist);
    });
  };

  Preview.getUserClips = function(uid,tag){
    var _url = "/user/"  + uid + "/clip/" ;
    if(tag){ _url += "tag/"+tag+"/"; }
    App.clipApp.Url.url = _url;
    Preview.show();
  };

  App.vent.bind("clip_preview:show", function(url, start, end){
    Preview.show(url, start, end);
  });

  App.vent.bind("clip:preview:scroll", function(view){
    $(document).scroll(function(evt){
      var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
      if(view.$el[0].scrollHeight > 0 && (view.$el[0].scrollHeight - scrollTop)<500){
	App.clipApp.Url.start +=10;
	App.clipApp.Url.end +=10;
	collection.url = App.clipApp.Url.url + App.clipApp.Url.start + ".." + App.clipApp.Url.end;
	collection.fetch({add: true});
      }
    });
  });
  return Preview;

})(App, Backbone, jQuery);
