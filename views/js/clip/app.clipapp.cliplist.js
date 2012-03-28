// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var start = 0;
  var end = App.ClipApp.Url.page-1;
  var precliplength=0,flag=true;;
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommened:{},//列表推荐的clip时有此属性
      content:{
	text:"",//text:String
	image:""//image:imgid || url
      },
      note:{
	text:"",//{text:string}
	sound:""//{sound:sndid}
      },
      tag:[],
      parent:"",
      device:"",
      city:"",
      source:{
	type:""//type : "browser" | "clipboard" | "photolib" | "camera"
      },
      id:"",
      user:"",
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
	if(resp[i].clip.user != App.ClipApp.Me.me.get("id")){
	  resp[i].manage = ["收","转","评"];
	}else{
	  resp[i].manage = ["注","改","删"];
	}
      }
      return resp;
    }
  });

  var ClipPreviewView = App.ItemView.extend({
    tagName: "div",
    className: "clip",
    template: "#clippreview-view-template",
    events: {
      "click #detail" : "show_detail",
      "click #comment": "commentAction",
      "click #reclip" : "reclipAction",
      "click .operate" : "operate",
      "mouseover .preview-info": "mouseover", // mouseover子类也响应
      "mouseout .preview-info": "mouseout" // mouseout 只自己响应
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
    itemView: ClipPreviewView
  });

  App.vent.bind("clip:preview:scroll", function(view, options){
    var paddingTop = 0;
    $(window).scroll(function() {
      var st = $(window).scrollTop();
      var wh = window.innerHeight;
      // fix left while scroll
      var mt = $(".main").offset().top;
      if(st > mt){
	$(".left").addClass("fixed").css({"margin-top": "0px", "top": paddingTop+"px"});
	$(".gotop").fadeIn();
	// show go-top while scroll
      } else {
	$(".left").removeClass("fixed").css("margin-top", paddingTop+"px");
	$(".gotop").fadeOut();
      }
      // loader while scroll down to the page end
      // var lt = $(".loader").offset().top;
      var scrollTop=document.body.scrollTop+document.documentElement.scrollTop;
      if(view.$el[0].scrollHeight>0&&(view.$el[0].scrollHeight-scrollTop)<500){
	start += App.ClipApp.Url.page;
	end += App.ClipApp.Url.page;
	options.url = options.clips.url + "/" +start + ".." + end;
	options.add = true;
	options.clips.fetch(options,{
	  success:function(collection,resp){
	    if(resp[0] == 0){
	      if(s != 0){
	      }
	      else{
	      }
	    }else{
	      //server response exception
	    }
	  },
	  error:function(collection,resp){
	    //client request error
	  }
	});
      }
    });
/*
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
*/
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
    var url =  App.ClipApp.Url.base+"/user/2/clip";
    if(tag) url += "/tag/"+tag;
    getClips({url: url, type: 'GET'});
  };

  ClipList.showUserClips = function(uid, tag){
    var	url = App.ClipApp.Url.base + "/user/"+uid+"/clip";
    if(tag) url += "/tag/"+tag;
    getClips({url:url, type:"GET"});
  };

  ClipList.showSiteQuery = function(word, tag){
    getUserQuery(2,word,tag);
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
    //console.info(clipListView);
    //console.info($("#list"));
    //console.dir(clipListView);
    $("#list").masonry({
      itemSelector : '.clip',
      columnWidth : 320
    });
    App.listRegion.show(clipListView);
    $("#list").masonry("reload");
    App.vent.trigger("clip:preview:scroll", clipListView, options);
  });

  return ClipList;
})(App, Backbone, jQuery);