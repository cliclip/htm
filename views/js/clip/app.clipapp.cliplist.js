// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var collection = null;
  var start = 0;
  var end = 9;
  var url = "";
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
	start +=App.ClipApp.Url.page;
	end +=App.ClipApp.Url.page;
	collection.url = url + start + ".." + end;
	collection.fetch({add: true});
      }
    });
  });

  ClipList.showSiteClips = function(tag){
    getSiteClips(tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  function getSiteClips(tag){
    //var _url =  ;
    if(tag){
      //_url +=;
    }
    //url = "test/clip.json";
    getClips();
  };

  ClipList.showSiteQuery = function(word, tag){
    getSiteQuery(word, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  function getSiteQuery(word, tag){
    var _url = "/query/" ;
    url = App.ClipApp.Url.base + _url;
    var data = {text:word};
    getClips(data);
  };

  ClipList.showUserClips = function(uid, tag){
    getUserClips(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  function getUserClips(uid,tag){
    var _url = "/user/"  + uid + "/clip/" ;
    if(tag){ _url += "tag/"+tag+"/"; }
    url = App.ClipApp.Url.base + _url;
    getClips();

  };

/*
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
*/
  App.vent.bind("app.clipapp.cliplist:show", function(clips){
    var clipListView = new ClipListView({collection: clips});
    App.listRegion.show(clipListView);
  });

  App.vent.bind("app.clipapp.cliplist:query",function(word){
    ClipList.showSiteQuery(word);
  });

  getClips = function(data){
    collection = new ClipPreviewList();
    //collection.url = "/test/recommend.json";
    //collection.url = "/test/clip.json";
    collection.url = url + start+".." + end;
    if(data){
      console.info(collection);
      collection.fetch({data:data,type:"POST",contentType:"application/json; charset=utf-8"});
    }else{
      collection.fetch();
    }
    collection.onReset(function(previewlist){
      App.vent.trigger("app.clipapp.cliplist:show",previewlist);
    });
  };

  return ClipList;
})(App, Backbone, jQuery);