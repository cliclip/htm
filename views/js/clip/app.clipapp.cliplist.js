 // app.clipapp.cliplist.js
App.ClipApp.ClipList = (function(App, Backbone, $){

  var ClipList = {};
  var options = {};
  var clipListView = {};

  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommend:"",//列表推荐的clip时有此属性
      clip :{}
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
	  resp[i] = {clip: clip};
	  resp[i].id = clip.user.id+":"+clip.id;
	}else{
	  if(resp[i].recommend){
	    resp[i].id = resp[i].recommend.user.id+":"+resp[i].recommend.rid;
	  }else{
	    resp[i].id = resp[i].clip.user.id+":"+resp[i].clip.id;
	  }
	}
      }
      return resp;
    }
  });

  var ClipPreviewView = App.ItemView.extend({
    tagName: "article",
    className: "clip",
    template: "#clippreview-view-template",
    events: {
      // 单击clip就响应show_detail事件
      "click #header" : "show_detail",
      //"click #comment": "commentAction",
      //"click #reclip" : "reclipAction",
      "click .operate" : "operate",
      "mouseenter #header":"mouseHand",
      "mouseenter .clip_item": "mouseEnter",
      "mouseleave .clip_item": "mouseLeave"
    },
    initialize: function(){
      var $container = $('#list');
      $container.imagesLoaded( function(){
	$container.masonry({
	  itemSelector : '.clip'
	});
      });
      this.bind("item:rendered",function(itemView){
	var $newElems = itemView.$el.css({ opacity: 0 });
	$newElems.imagesLoaded(function(){
	  $newElems.animate({ opacity: 1 });
	  $("#list").masonry("reload");
	});
      });
    },
    show_detail: function(){
      var clip = this.model.get("clip");
      var clipid = clip.user.id+":"+clip.id;
      App.vent.trigger("app.clipapp:clipdetail",clipid,this.model.id);
    },
/*
    commentAction: function(){
      var clip = this.model.get("clip");
      var clipid = clip.user.id+":"+clip.id;
      App.vent.trigger("app.clipapp:comment",clipid);
    },
    reclipAction: function(){
      var clip = this.model.get("clip");
      var clipid = clip.user.id+":"+clip.id;
      App.vent.trigger("app.clipapp:reclip",clipid);
    },
*/
    mouseEnter: function(e){
      $(e.currentTarget).children(".master").children("#opt").show();
    },
    mouseLeave: function(e){
      $(e.currentTarget).children(".master").children("#opt").hide();
    },
    mouseHand:function(e){
      e.currentTarget.style.cursor="pointer";
    },
    operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      var clip = this.model.get("clip");
      var cid = clip.user.id+":"+clip.id;
      switch(opt){
	case 'biezhen'://收
	  App.vent.trigger("app.clipapp:reclip", cid,this.model.id);break;
	case 'refresh'://转
	App.vent.trigger("app.clipapp:recommend", cid,this.model.id);break;
	case 'comment'://评
	  App.vent.trigger("app.clipapp:comment", cid,this.model.id);break;
	case 'note'://注
	App.vent.trigger("app.clipapp:clipmemo", cid);break;
	case 'change':{//改
	  App.vent.trigger("app.clipapp:clipedit", cid);break;
	}
	case 'del'://删
	  App.vent.trigger("app.clipapp:clipdelete", cid);break;
      }
    }
  });

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "preview-view",
    itemView: ClipPreviewView,
    initialize: function(){
      /*
      this.bind("collection:rendered",function(itemView){
      	var $container = $('#list');
	$container.imagesLoaded( function(){
	  $container.masonry({
	    itemSelector : '.clip'
	  });
	});
	setTimeout(function(){ // STRANGE BEHAVIOUR
	  //$("#list").masonry("appended", itemView.$el);
	  //$('#list').prepend( itemView.$el ).masonry( 'reload' );
	  //$("#list").masonry("reload");
	},0);
      });
       */
    }
  });

  ClipList.flag_show_user = true;//clippreview是否显示用户名和用户头像

  // site == user2 网站首首页
  ClipList.showSiteClips = function(tag){
    ClipList.flag_show_user = true;
    var url = App.ClipApp.Url.base+"/user/2/query";
    var data = {user: 2, "public": true};
    if(tag) data.tag = [tag];
    options = {base_url: url, type: "POST", data:data};
    getClips();
  };

  ClipList.showUserClips = function(uid, tag){
    ClipList.flag_show_user = false;
    var url = App.ClipApp.Url.base+"/user/"+uid+"/query";
    var data = {user: uid};
    if(tag) data.tag = [tag];
    options = {base_url: url, type:"POST", data: data};
    getClips();
    //修改地址栏的内容
    if(uid == App.util.getMyUid()){
      tag != undefined ? App.vent.trigger("app.clipapp.routing:mytag_show", tag) : App.vent.trigger("app.clipapp.routing:myshow");
    }else{
      tag != undefined ? App.vent.trigger("app.clipapp.routing:usertag_show", uid, tag) : App.vent.trigger("app.clipapp.routing:usershow", uid);
    }
  };

  // 这两个Query对结果是没有要求的，按照关键字相关度
  ClipList.showSiteQuery = function(word, tag){
    ClipList.flag_show_user = true;
    var url = "/query";
    url = App.ClipApp.Url.base + url;
    var data = {text: word};
    if(tag) data.tag = [tag];
    options = {base_url: url, type: "POST", data: data};
    getClips();
    App.vent.trigger("app.clipapp.routing:sitequery", word);
  };

  ClipList.showUserQuery = function(uid, word, tag){
    ClipList.flag_show_user = false;
    var url = "/user/"+uid+"/query";
    url = App.ClipApp.Url.base + url;
    var data = {text: word, user: uid};
    if(tag) data.tag = [tag];
    options = {base_url: url, type:"POST", data:data};
    getClips();
    App.vent.trigger("app.clipapp.routing:myquery", word);
  };

  ClipList.showUserInterest = function(uid, tag){
    ClipList.flag_show_user = true;
    var url = "/user/" + uid + "/interest";
    if(tag) url += "/tag/" + tag;
    url = App.ClipApp.Url.base + url;
    options ={base_url: url, type: "GET",start:0,end:App.ClipApp.Url.page};
    getClips();
    //修改地址栏的内容
    tag	? App.vent.trigger("app.clipapp.routing:interest_tag", tag): App.vent.trigger("app.clipapp.routing:interest");
  };

  ClipList.showUserRecommend = function(uid, tag){
    ClipList.flag_show_user = true;
    var url = "/user/"+uid+"/recomm";
    if(tag) url += "/tag/"+tag;
    url = App.ClipApp.Url.base + url;
    options ={base_url: url, type:"GET",start:0,end:App.ClipApp.Url.page};
    getClips();
    //修改地址栏的内容
    tag ? App.vent.trigger("app.clipapp.routing:recommend_tag", tag) : App.vent.trigger("app.clipapp.routing:recommend");
  };

  function getClips(){
    var clips = new ClipPreviewList();
    options.collection = clips;
    //if(!options.start &&! options.end){
      options.start = 1;
      options.end = App.ClipApp.Url.page;
    //}
    options.url = options.base_url + "/" + options.start+".."+ options.end;
    if(options.data){
      options.data = JSON.stringify(options.data),
      options.contentType = "application/json; charset=utf-8";
    }
    options.collection.fetch(options);
    options.collection.onReset(function(clips){
      options.collection_length = options.collection.length;
      options.fetch_flag = options.collection.length==App.ClipApp.Url.page ? true :false;
      App.vent.trigger("app.clipapp.cliplist:@reset",clips);
    });
  };

  App.vent.bind("app.clipapp.cliplist:@reset",function(collection){
    clipListView = new ClipListView({collection:collection});
    $('#list').masonry({
      itemSelector : '.clip',
      columnWidth : 360,
      isAnimated: false
    });
    $("#list").css({height:"0px"});
    App.listRegion.show(clipListView);
    App.vent.trigger("app.clipapp:showpage");
    /*
    if(options.collection && options.collection.length==0){
      //$("#list").append("抱歉，没有找到相应的信息...");
    } */
  });

  App.vent.bind("app.clipapp:nextpage",function(){
    if(App.listRegion.currentView.$el[0].className=="preview-view"&&options.fetch_flag){
      options.start += App.ClipApp.Url.page;
      options.end += App.ClipApp.Url.page;
      options.url = options.base_url + "/" +options.start + ".." + options.end;
      options.add = true;
      options.error = function(){ options.fetch_flag = false; };
      options.success = function(){
	if(options.collection.length-options.collection_length>=App.ClipApp.Url.page){
	  options.collection_length = options.collection.length;
	}else{
	  options.fetch_flag = false;
	}
      };
      options.collection.fetch(options);
    }
  });

  App.vent.bind("app.clipapp.cliplist:add",function(addmodel){
    var uid = App.util.getMyUid();
    var id = uid+":"+addmodel.id;
    var model = new ClipPreviewModel();
    var clip = {};
    clip.id = addmodel.id;
    clip.tag = addmodel.get("tag");
    clip.note = addmodel.get("note");
    clip.public = addmodel.get("public");
    clip.user = {id : uid};
    clip.content = App.util.getPreview(addmodel.get("content"), 100);
    //clip本身的id为自己的id，model的id为uid:cid
    model.set({clip:clip,id:id});
    model.set({recommend:""});

    var fn = clipListView.appendHtml;
    clipListView.appendHtml = function(collectionView, itemView){
      collectionView.$el.prepend(itemView.el);
      clipListView.appendHtml = fn;
    };
    clipListView.collection.add(model,{at:0});
    options.start++;
    options.collection_length++;
    $("#list").masonry("reload");
  });

  App.vent.bind("app.clipapp.cliplist:remove",function(model_id){
    var model = clipListView.collection.get(model_id);
    clipListView.collection.remove(model);
    $("#list").masonry("reload");
    options.start--;
    options.collection_length--;
    //console.info(options.collection_length);
    if(options.collection_length == 0){
      App.vent.trigger("app.clipapp:nextpage");
    }
  });

  App.vent.bind("app.clipapp.cliplist:refresh",function(args){
    var model=App.listRegion.currentView.collection.get(args.model_id);
    var clip=model.get("clip");
    if(args.type == "comment"){
      if(args.pid == 0)
	clip.reply_count = clip.reply_count ? clip.reply_count+1 : 1;
    }
    if(args.type == "reclip"){
      clip.reprint_count = clip.reprint_count ? clip.reprint_count+1 : 1;
    }
    model.set({clip:clip});
    App.listRegion.show(clipListView);
    var that = clipListView;
    that.bindTo(that.collection, "add", that.addChildView, that);
    that.bindTo(that.collection, "remove", that.removeItemView, that);
  });

  App.vent.bind("app.clipapp.cliplist:edit", function(content,model_id){
    var collection = clipListView.collection;
    var model = collection.get(model_id);
    var clip = model.get("clip");
    clip.content = App.util.getPreview(content, 100);
    model.set({clip:clip});
    App.listRegion.show(clipListView);
    var that = clipListView;
    that.bindTo(that.collection, "add", that.addChildView, that);
    that.bindTo(that.collection, "remove", that.removeItemView, that);
  });

  return ClipList;

})(App, Backbone, jQuery);