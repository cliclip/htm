// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var start = 0;
  var end = App.ClipApp.Url.page-1;
  var precliplength=0,flag=true;;
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommened:{},//列表推荐的clip时有此属性
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
      parent:"",
      device:"",
      city:"",
      source:{
	type:""//type : "browser" | "clipboard" | "photolib" | "camera"
      },
      reprint_count:0,//此clip被转摘的次数
      reply_count:0,//此clip被回复的次数
      author:{}//此clip的作者，列表推荐和列表follow动态时有此属性
    }
  });

  // 对my interest 和 my recommened的数据进行转换
  // [同时避免不同用户之间的clipid相同的冲突]
  // 不同用户转载给我相同的数据
  var ClipPreviewList = App.Collection.extend({
    model : ClipPreviewModel,
    parse : function(resp){
      for( var i=0; resp && i<resp.length; i++){
	// 使得resp中的每一项内容都是对象
	if(!resp[i].clip){
	  var clip = resp[i];
	  if(clip.parent){
	    clip.imguid = clip.parent.split(":")[0];
	  }else{
	    clip.imguid = clip.user;
	  }
	  resp[i] = {clip: clip};
	  resp[i].id = clip.user+":"+clip.id;
	}else{
	  resp[i].clip.imguid = resp[i].clip.user;
	  resp[i].id = resp[i].clip.user+":"+resp[i].clip.id;
	}
      }
      return resp;
    }
  });

  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    template: "#clippreview-view-template",
    events: {
      "click #detail" : "show_detail",
      "click #comment": "commentAction",
      "click #reclip" : "reclipAction"
    },
    show_detail: function(){
      App.vent.trigger("app.clipapp:clipdetail",this.model.id);
    },
    commentAction: function(){
      App.vent.trigger("app.clipapp:comment",this.model.id);
    },
    reclipAction: function(){
      App.vent.trigger("app.clipapp:reclip",this.model.id);
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
    if(tag) url += "/tag/"+tag;
    getClips({url: url, type: 'GET'});
  };

  ClipList.showUserClips = function(uid, tag){
    var	url = App.ClipApp.Url.base + "/user/"+uid+"/clip";
    if(tag) url += "/tag/"+tag;
    getClips({url:url, type:"GET"});
  };

  ClipList.showSiteQuery = function(word, tag){
    getUserQuery(1,word,tag);
  };

  ClipList.showUserQuery = function(uid, word, tag){
    getUserQuery(uid, word, tag);
  };

  function getUserQuery(uid, word, tag){
    var url = "/user/" + uid + "/query";
    url = App.ClipApp.Url.base + url;
    var data = { text:word , user:uid};
    if(tag) data.tag = tag;
    getClips({url:url,type:"POST",data:data});
  }

  ClipList.showUserInterest = function(uid, tag){
    var url = "/user/" + uid + "/interest";
    if(tag) url += "/tag/" + tag;
    url = App.ClipApp.Url.base + url;
    getClips({url: url, type: "GET"});
  };

  ClipList.showUserRecommend = function(uid, tag){
    var url = "/user/"+uid+"/recomm";
    if(tag) url += "/tag/"+tag;
    url = App.ClipApp.Url.base + url;
    getClips({url: url, type:"GET"});
  };

  App.vent.bind("app.clipapp.cliplist:show", function(clips, options){
    var clipListView = new ClipListView({collection: clips});
    App.listRegion.show(clipListView);
    App.vent.trigger("clip:preview:scroll", clipListView, options);
  });

  return ClipList;
})(App, Backbone, jQuery);