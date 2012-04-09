// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var start = 1;
  var end = App.ClipApp.Url.page;
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
	if(!resp[i].clip){
	  var clip = resp[i];
	  resp[i] = {clip: clip};
	  resp[i].id = clip.user+":"+clip.id;
	}else{
	  resp[i].id = resp[i].clip.user+":"+resp[i].clip.id;
	}
	if(resp[i].clip.user != App.ClipApp.getMyUid("id")){
	  resp[i].manage = ["收","转","评"];
	}else{
	  resp[i].manage = ["注","改","删"];
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
      "dblclick #header" : "show_detail",
      "click #comment": "commentAction",
      "click #reclip" : "reclipAction",
      "click .operate" : "operate",
      "mouseover .preview-info": "mouseover", // mouseover子类也响应
      "mouseout .preview-info": "mouseout" // mouseout 只自己响应
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
      var opt = $(e.currentTarget).val();
      var clip = this.model.get("clip");
      var cid = this.model.id;
      var pub = clip["public"];
      var tags = clip.tag;
      var note = [clip.note];
      switch(opt){
	case '收':
	  App.vent.trigger("app.clipapp:reclip", cid);break;
	case '转':
	  App.vent.trigger("app.clipapp:recommend", cid);break;
	case '评':
	  App.vent.trigger("app.clipapp:comment", cid);break;
	case '注':
	  App.vent.trigger("app.clipapp:clipmemo", cid,tags,note,pub);break;
	case '改':
	  App.vent.trigger("app.clipapp:clipedit", cid);break;
	case '删':
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
    var _start = 1;
    var _end = App.ClipApp.Url.page;
    var clips = new ClipPreviewList();
    options.clips = clips;
    options.clips.url = options.url;
    options.url += "/" + _start+".."+ _end;
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

  // site == user2
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
    $("#list").masonry({
      itemSelector : '.clip',
      columnWidth : 360,
      isAnimated: false
    });
    App.listRegion.show(clipListView);
    App.vent.trigger("clip:preview:scroll", clipListView, options);
  });

  App.vent.bind("clip:preview:scroll", function(view, options){
    var paddingTop = 0;
    $(window).scroll(function() {
      var st = $(window).scrollTop();
      var wh = window.innerHeight;
      // fix left while scroll
      var mt = $(".layout").offset().top;
      if(st > mt){
	$(".left").addClass("fixed").css({"margin-top": "0px", "top": paddingTop+"px"});
	$(".gotop").fadeIn();
	// show go-top while scroll
      } else {
	$(".left").removeClass("fixed").css("margin-top", paddingTop+"px");
	$(".gotop").fadeOut();
      }
      // loader while scroll down to the page end
      var lt = $(".loader").offset().top;
      var scrollTop=document.body.scrollTop+document.documentElement.scrollTop;
      //if(view.$el[0].scrollHeight>0&&(view.$el[0].scrollHeight-scrollTop)<500){
      if(st + wh > lt){
	if(flag){
	  start += App.ClipApp.Url.page;
	  end += App.ClipApp.Url.page;
	  options.url = options.clips.url + "/" +start + ".." + end;
	  options.add = true;
	  options.clips.fetch(options);
	  flag = false;
	  setTimeout(function(){
	    flag = true;
	    if(options.clips.length-precliplength<App.ClipApp.Url.page){
	      flag = false;
	      $(".loader").text("reach to the end.");
	    }else{
	      precliplength = options.clips.length;
	    }
	  },200);
	}
      }
    });
  });

  return ClipList;
})(App, Backbone, jQuery);