// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
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
  var ClipPreviewList = App.Collection.extend({
    model : ClipPreviewModel
  });
  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    template: "#clippreview-view-template"
  });

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "clippreview-item",
    itemView: ClipPreviewView,
    initialize: function(){
      App.vent.trigger("clip:preview:scroll", this);
    }
  });

  App.vent.bind("clip:preview:scroll", function(view){
    $(document).scroll(function(evt){
      var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
      if(view.$el[0].scrollHeight > 0 && (view.$el[0].scrollHeight - scrollTop)<500){
	App.ClipApp.Url.start +=App.ClipApp.Url.page;
	App.ClipApp.Url.end +=App.ClipApp.Url.page;
	collection.url = App.ClipApp.Url.url + App.ClipApp.Url.start + ".." + App.ClipApp.Url.end;
	collection.fetch({add: true});
      }
    });
  });

  ClipList.showSiteClips = function(tag){
    getSiteClips(tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showSiteQuery = function(word, tag){
    getSiteQuery(word, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserClips = function(uid, tag){
    getUserClips(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  function getUserClips(uid,tag){
    var _url = "/user/"  + uid + "/clip/" ;
    if(tag){ _url += "tag/"+tag+"/"; }
    App.ClipApp.Url.url += _url;
    getClips();
  };

  ClipList.showUserQuery = function(uid, word, tag){
    getUserQuery(uid, word, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserInterest = function(uid, tag){
    getUserInterest(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserRecommend = function(uid, tag){
    getUserRecommend(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };
  App.vent.bind("app.clipapp.cliplist:show", function(clips){
    var clipListView = new ClipListView({collection: clips});
    App.listRegion.show(clipListView);
  });

  getClips = function(){
    collection = new ClipPreviewList();
    //collection.url = "/test/recommend.json";
    //collection.url = "/test/clip.json";
    collection.url = App.ClipApp.Url.url + App.ClipApp.Url.start+".." + App.ClipApp.Url.end;
    collection.fetch();
    collection.onReset(function(previewlist){
      App.vent.trigger("app.clipapp.cliplist:show",previewlist);
    });
  };

  return ClipList;
})(App, Backbone, jQuery);