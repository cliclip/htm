// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var start = 0;
  var end = App.ClipApp.Url.page-1;
  var precliplength=0,flag=true;;
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
    model : ClipPreviewModel,
    parse : function(resp){
      // 如果拿到多用户的clip，id会重复
      for( var i=0; i<resp.length; i++){
	resp[i].id = resp[i].user+":"+resp[i].id;
      }
      return resp;
    }
  });

  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    template: "#clippreview-view-template",
    events: {
      "click #detail" : "show_detail"
    },
    show_detail: function(){
      App.vent.trigger("app.clipapp:clipdetail",this.model.id);
    }
  });

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "preview-item",
    itemView: ClipPreviewView
  });

  App.vent.bind("clip:preview:scroll", function(view, options){
    $(document).scroll(function(evt){
      var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
      if(view.$el[0].scrollHeight > 0 &&$(window).height()+scrollTop-view.$el[0].scrollHeight>=100 ){
      // if(view.$el[0].scrollHeight > 0 && (view.$el[0].scrollHeight - scrollTop)<500){
	start += App.ClipApp.Url.page;
	end += App.ClipApp.Url.page;
	options.url = options.clips.url + "/" +start + ".." + end;
	options.add = true;
	if(options.clips.length-precliplength<end-start){
	    flag=false;
	}
	if(flag){
	  options.clips.fetch(options);
	  precliplength=options.clips.length;
	}
      }
    });
  });

  var getClips = function(options){
    options.clips = new ClipPreviewList();
    options.clips.url = options.url;
    start = 0;
    end = App.ClipApp.Url.page - 1;
    options.url += "/" + start+".."+end;
    if(options.data){
      options.data = JSON.stringify(options.data),
      options.contentType = "application/json; charset=utf-8";
    }
    // console.info(options);
    options.clips.fetch(options);
    options.clips.onReset(function(previewlist){
      App.vent.trigger("app.clipapp.cliplist:show",previewlist, options);
    });
  };

  ClipList.showSiteClips = function(tag){
    var url =  App.ClipApp.Url.base+"/user/1/clip";
    if(tag){
      url += "/tag/"+tag;
    }
    getClips({url: url, type: 'GET'});
  };

  ClipList.showSiteQuery = function(word, tag){
    // var url = App.ClipApp.Url.base+"/user/1";
    getUserQuery(1,word,tag,function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserClips = function(uid, tag){
    var	url = App.ClipApp.Url.base + "/user/"+uid+"/clip";
    if(tag){
      url += "/tag/"+tag;
    }
    getClips({url:url, type:"GET"});
  };

  ClipList.showUserQuery = function(uid, word, tag){
    getUserQuery(uid, word, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  function getUserQuery(uid, word, tag){
    var _url = "/user/" + uid + "/query";
    url = App.ClipApp.Url.base + _url;
    var data = { text:word , user:uid};
    if(tag){data.tag = tag; }
    getClips({url:url,type:"POST",data:data});
  }

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

  App.vent.bind("app.clipapp.cliplist:show", function(clips, options){
    var clipListView = new ClipListView({collection: clips});
    App.listRegion.show(clipListView);
    App.vent.trigger("clip:preview:scroll", clipListView, options);
  });

/*
  getClips = function(data){
    collection = new ClipPreviewList();
    //collection.url = "/test/recommend.json";
    //collection.url = "/test/clip.json";
    start = 0;
    end = App.ClipApp.Url.page-1;
    collection.url = url + start+".." + end;
    if(data){
      type = "POST";
      collection.fetch({
	data:JSON.stringify(data),
	type:"POST",
	contentType:"application/json; charset=utf-8"
      });
    }else{
      collection.fetch();
    }
    collection.onReset(function(previewlist){
      App.vent.trigger("app.clipapp.cliplist:show",previewlist);
    });
  };
 */
  return ClipList;
})(App, Backbone, jQuery);