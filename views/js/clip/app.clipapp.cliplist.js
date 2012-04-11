// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var precliplength=0,flag=true;
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
	  	console.info(resp);
	if(!resp[i].clip){
	  var clip = resp[i];
	  resp[i] = {clip: clip};
	  resp[i].id = clip.user.id+":"+clip.id;
	}else{
	  resp[i].id = resp[i].clip.user.id+":"+resp[i].clip.id;
	}
	if(resp[i].clip.user.id != App.ClipApp.getMyUid("id")){
	  resp[i].manage = ["biezhen","refresh","comment"];
	}else{
	  resp[i].manage = ["note","change","del"];
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
      // 双击clip就响应show_detail事件
      "click article.clip" : "show_detail",
      "click #comment": "commentAction",
      "click #reclip" : "reclipAction",
      "click .operate" : "operate",
      "mouseover .master": "mouseover", // mouseover子类也响应
      "mouseout .master": "mouseout" // mouseout 只自己响应
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
	  //setTimeout(function(){
	    //$("#list").masonry( 'appended', $newElems,true);
	    $("#list").masonry("reload");
	  //},0);
	});
      });
    },
    show_detail: function(){
      App.vent.trigger("app.clipapp:clipdetail",this.model.id);
    },
    commentAction: function(){
      App.vent.trigger("app.clipapp:comment",this.model.id);
    },
    reclipAction: function(){
      App.vent.trigger("app.clipapp:reclip",this.model.id);
    },
    // mouseover与mouseout的某些区域还是不能正常显示
    mouseover: function(e){
      e.preventDefault();
      if(checkHover(e,e.target)){
	$(e.currentTarget).children("#opt").css("display","block");
      }
    },
    mouseout: function(e){
      e.preventDefault();
      if(checkHover(e,e.target)){
	$(e.currentTarget).children("#opt").css("display","none");
      }
    },
    operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      var clip = this.model.get("clip");
      var cid = this.model.id;
      var pub = clip["public"];
      var tags = clip.tag;
      var note = [clip.note];
      switch(opt){
	case 'biezhen'://收
	  console.log(opt);
	  App.vent.trigger("app.clipapp:reclip", cid);break;
	case 'refresh'://转
	  App.vent.trigger("app.clipapp:recommend", cid);break;
	case 'comment'://评
	  App.vent.trigger("app.clipapp:comment", cid);break;
	case 'note'://注
	  App.vent.trigger("app.clipapp:clipmemo", cid,tags,note,pub);break;
	case 'change'://改
	  App.vent.trigger("app.clipapp:clipedit", cid);break;
	case 'del'://删
	  App.vent.trigger("app.clipapp:clipdelete", cid);break;
      }
    }
  });

  var contains = function(parentNode,childNode){
    if(parentNode.contains){
      return parentNode != childNode && parentNode.contains(childNode);
    }else{
      return  !!(parentNode.compareDocumentPosition(childNode) & 16);
    }
  };

  var checkHover = function(e,target){
    if(getEvent(e).type=="mouseover")
      return !contains(target,getEvent(e).relatedTarget||getEvent(e).fromElement) && !((getEvent(e).relatedTarget||getEvent(e).fromElement)===target);
    else
      return !contains(target,getEvent(e).relatedTarget||getEvent(e).toElement) && !((getEvent(e).relatedTarget||getEvent(e).toElement)===target);
  };

  var getEvent = function(e){
    return e||window.event;
  };

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "preview-view",
    itemView: ClipPreviewView,
    initialize: function(){
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
//	  $("#list").masonry("reload");
	},0);
      });
    }
  });

  var getClips = function(options){
    var clips = new ClipPreviewList();
    options.params = clips;
    if(!options.start &&! options.end){
      options.start = 1;
      options.end = App.ClipApp.Url.page;
    }
    options.params.url = options.url;
    options.url += "/" + options.start+".."+ options.end;
    if(options.data){
      options.data = JSON.stringify(options.data),
      options.contentType = "application/json; charset=utf-8";
    }
    // console.info(options);
    options.params.fetch(options);
    options.params.onReset(function(previewlist){
      //location.reload() ;
      App.vent.trigger("app.clipapp.cliplist:show",previewlist, options);
    });
  };

  // site == user2 网站首首页
  ClipList.showSiteClips = function(tag){
    var url = App.ClipApp.Url.base+"/user/2/query";
    var data = {user: 2, "public": true};
    if(tag) data.tag = [tag];
    getClips({url: url, type: "POST", data:data});
  };

  ClipList.showUserClips = function(uid, tag){
    var url = App.ClipApp.Url.base+"/user/"+uid+"/query";
    var data = {user: uid};
    if(tag) data.tag = [tag];
    getClips({url: url, type:"POST", data: data});
  };

  // 这两个Query对结果是没有要求的，按照关键字相关度
  ClipList.showSiteQuery = function(word, tag){
    var url = "/query";
    url = App.ClipApp.Url.base + url;
    var data = {text: word};
    if(tag) data.tag = [tag];
    getClips({url: url, type: "POST", data: data});
  };

  ClipList.showUserQuery = function(uid, word, tag){
    var url = "/user/"+uid+"/query";
    url = App.ClipApp.Url.base + url;
    var data = {text: word, user: uid};
    if(tag) data.tag = [tag];
    getClips({url: url, type:"POST", data:data});
  };

  ClipList.showUserInterest = function(uid, tag){
    var url = "/user/" + uid + "/interest";
    if(tag) url += "/tag/" + tag;
    url = App.ClipApp.Url.base + url;
    getClips({url: url, type: "GET",start:0,end:App.ClipApp.Url.page});
  };

  ClipList.showUserRecommend = function(uid, tag){
    var url = "/user/"+uid+"/recomm";
    if(tag) url += "/tag/"+tag;
    url = App.ClipApp.Url.base + url;
    getClips({url: url, type:"GET",start:0,end:App.ClipApp.Url.page});
  };

  App.vent.bind("app.clipapp.cliplist:show", function(clips, options){
    var clipListView = new ClipListView({collection: clips});
    $("#list").masonry({
      itemSelector : '.clip',
      columnWidth : 360,
      isAnimated: false
    });
    App.listRegion.show(clipListView);
    App.vent.trigger("app.clipapp.util:scroll", clipListView, options);
  });
  return ClipList;
})(App, Backbone, jQuery);