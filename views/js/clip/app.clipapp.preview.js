// app.clippreviewapp.js
App.ClipApp.Preview = (function(App, Backbone, $){
  var Preview = {};
  var start = 0;
  var end = 9;
//  var id = null;
  var collection = null;
  var url = "";
  var PreviewModel = App.Model.extend({
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
  var PreviewList = App.Collection.extend({
    model : PreviewModel
  });
  var PreviewView = App.ItemView.extend({
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

  var PreviewListView = App.CollectionView.extend({
    tagName: "div",
    className: "clippreview-item",
    itemView: PreviewView,
    initialize: function(){
      App.vent.trigger("clip:preview:scroll", this);
    }
  });

  var showPreview = function(previewlist){
    //console.info(previewlist.toJSON());
    var preview_view = new PreviewListView({
      collection : previewlist
    });
    App.listRegion.show(preview_view);
  };
  //程序入口(显示clip的列表)
  Preview.show = function(_url,s,e){
    collection = new PreviewList();
    start = s ? parseInt(s) : start;
    end = e ? parseInt(e) : end;
    url = _url;
    //collection.url = "/test/recommend.json";
    //collection.url = "/test/clip.json";
    collection.url = url + start + ".." + end;
    collection.fetch();
    collection.onReset(function(previewlist){
      showPreview(previewlist);
    });
  };

  App.vent.bind("clippreview:show", function(previewlist){
    showPreview(previewlist);
  });

  App.vent.bind("clip:preview:scroll", function(view){
    $(document).scroll(function(evt){
      var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
      if(view.$el[0].scrollHeight > 0 && (view.$el[0].scrollHeight - scrollTop)<500){
	start = start +10;
	end = end + 10;
	collection.url = url + start + ".." + end;
	collection.fetch({add: true});
      }
    });
  });
  return Preview;

})(App, Backbone, jQuery);
