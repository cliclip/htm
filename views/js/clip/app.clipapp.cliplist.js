 // app.clipapp.cliplist.js
App.ClipApp.ClipList = (function(App, Backbone, $){

  var ClipList = {};
  var flag = false;
  var clips_exist = true;
  var hide_clips = [];
  var clipListView = {};
  var collection = {},start = 1,end = App.ClipApp.Url.page;
  var url = "",base_url = "",data = "",type = "",collection_length,new_page;
  var loading = false;
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommend:"",//列表推荐的clip时有此属性
      user :{},
      content:{},
      reprint_count:"",
      reply_count:"",
      hide:false
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
	  resp[i].clipid = resp[i].id;
	  resp[i].id = resp[i].user.id+":"+resp[i].id;
	}else{ // 表示是别人推荐的clip
	  resp[i].clipid = resp[i].clip.id;
	  resp[i].user = resp[i].clip.user;
	  resp[i].content = resp[i].clip.content;
	  resp[i].reprint_count = resp[i].clip.reprint_count? resp[i].clip.reprint_count:0;
	  resp[i].reply_count = resp[i].clip.reply_count? resp[i].clip.reply_count:0;
	  resp[i]["public"] = resp[i].clip["public"];
	  delete resp[i].clip;
	  resp[i].id = resp[i].recommend.user.id+":"+resp[i].recommend.rid;
	}
	if(resp[i].hide){// 取interest数据的时候，该属性描述是否显示
	  hide_clips.push(resp[i].id);
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
      "click .operate" : "operate",
      "mouseenter .clip_item": "mouseEnter",
      "mouseleave .clip_item": "mouseLeave"
    },
    initialize: function(){
      var $container = $('#list');
      this.bind("item:rendered",function(itemView){
	if(this.model.get("content").image){
	  this.$el.find("p").addClass("text");
	  itemView.$el.imagesLoaded(function(){
	    $container.masonry("reload");
	  });
	}else{
          this.$el.find("p").addClass("no_img_text");
	  this.$el.find("span.biezhen").remove();
	  //STRANGE若不加延时则所有clip无图片,在翻页时最后一个clip不产生动态布局效果
	  setTimeout(function(){
	    $container.masonry("reload");
	  },0);
	}
	flag = true;
      });
    },
    show_detail: function(){
      //部分ff浏览器 选中clip preview 中内容会触发鼠标单击事件打开详情页面
      if(window.getSelection&&$.trim(window.getSelection().toString())){//ie-9 chrome ff 都有此对象
	//console.info($.trim(window.getSelection().toString()));
	return;
      }else if(document.selection&&document.selection.createRange().text){
	//ie-7 8 无getSelection()只有document.selection
	return;
      }
      var recommend = {
	rid: this.model.get("recommend").rid,
	user: this.model.get("recommend").user ? this.model.get("recommend").user.id : null
      };
      var clipid = this.model.get("user").id + ":" + this.model.get("clipid");
      App.vent.trigger("app.clipapp:clipdetail",clipid,this.model.id,recommend);
    },
    mouseEnter: function(e){
      $(e.currentTarget).children(".master").children("#opt").show();
    },
    mouseLeave: function(e){
      $(e.currentTarget).children(".master").children("#opt").hide();
    },
    operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      var cid = this.model.get("user").id + ":" + this.model.get("clipid");
      var pub = this.model.get("public");
      var mid = this.model.id;
      var recommend = { // 只是传给reclip用
	rid : this.model.get("recommend").rid,
	user: this.model.get("recommend").user ? this.model.get("recommend").user.id : null
      };
      switch(opt){
	case 'biezhen'://收
	  App.vent.trigger("app.clipapp:reclip",cid,mid,recommend,pub);break;
	//case 'refresh'://转
	  //App.vent.trigger("app.clipapp:recommend",cid,mid,pub);break;
	case 'comment'://评
	  App.vent.trigger("app.clipapp:comment",cid,mid);break;
	case 'note'://注
	  App.vent.trigger("app.clipapp:clipmemo",cid);break;
	case 'change'://改
	  App.vent.trigger("app.clipapp:clipedit",cid);break;
	case 'del'://删
	  App.vent.trigger("app.clipapp:clipdelete",cid);break;
      }
    }
  });

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "preview-view",
    itemView: ClipPreviewView
  });

  ClipList.flag_show_user = true;//clippreview是否显示用户名和用户头像
  // site == user2 网站首首页
  ClipList.showSiteClips = function(tag){
    ClipList.flag_show_user = true;
    base_url = App.ClipApp.Url.base+"/query";
    // 起始时间设置为，endTime前推一个月
    var date = (new Date()).getTime();
    data = {"startTime":date-86400000*30,"endTime":date+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page();
  };

  ClipList.showUserClips = function(uid, tag){
    ClipList.flag_show_user = false;
    base_url = App.ClipApp.Url.base+"/user/"+uid+"/query";
    data = {user: uid,"startTime":Date.parse('March 1, 2012'),"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page();
  };

  // 这两个Query对结果是没有要求的，按照关键字相关度
  ClipList.showSiteQuery = function(word, tag){
    ClipList.flag_show_user = true;
    base_url = App.ClipApp.Url.base + "/query";
    var date = (new Date()).getTime();
    data = {text: word, "startTime":date-86400000*30,"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page();
  };

  ClipList.showUserQuery = function(uid, word, tag){
    ClipList.flag_show_user = false;
    base_url = App.ClipApp.Url.base + "/user/"+uid+"/query";
    data = {text: word, user: uid, "startTime":Date.parse('May 1, 2012'),"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page();
  };

  ClipList.showUserInterest = function(uid, tag){
    ClipList.flag_show_user = true;
    base_url = "/user/" + uid + "/interest";
    if(tag) base_url += "/tag/" + encodeURIComponent(tag);
    base_url = App.ClipApp.Url.base + base_url;
    data = null;
    type = "GET";
    init_page();
  };

  ClipList.showUserRecommend = function(uid, tag){
    ClipList.flag_show_user = true;
    base_url = "/user/"+uid+"/recomm";
    if(tag) base_url += "/tag/"+encodeURIComponent(tag);
    base_url = App.ClipApp.Url.base + base_url;
    data = null;
    type = "GET";
    init_page();
  };
  function collection_filter(collection,hide_list){
    collection_length -= hide_list.length;
    for(var i=0;i<hide_list.length;i++){
      collection.remove(collection.get(hide_list[i]));
    }
  };
  function init_page(){
    var clips = new ClipPreviewList();
    collection = clips;
    start = 1;
    end = App.ClipApp.Url.page;
    url = App.util.unique_url(base_url + "/" + start+".."+ end);
    if(data){
      var tag = data.tag ? data.tag : null;
      data = JSON.stringify(data);
      var contentType = "application/json; charset=utf-8";
      collection.fetch({url:url,type:type,contentType:contentType,data:data});
    }else{
      collection.fetch({url:url,type:type});
    }
    collection.onReset(function(clips){
      if(clips&&clips.length==0){
	clips_exist = false;
      }else{
	clips_exist = true;
      }
      collection_length = clips.length;
      new_page = collection.length==App.ClipApp.Url.page ? true :false;
      collection_filter(clips,hide_clips);
      clipListView = new ClipListView({collection:clips});
      $('#list').masonry({
	itemSelector : '.clip',
	columnWidth : 330,
	isAnimated: false,//动态效果导致：overflow:hidden  cliplist 边被裁掉
	animationOptions: {
	  duration: 800,
	  easing: 'linear',
	  queue: false
	}
      });
      $("#list").css({height:"0px"});
      if($(window).scrollTop()>100){
	window.location.href="javascript:scroll(0,100)";
      }
      App.listRegion.show(clipListView);
      //App.vent.trigger("app.clipapp:showpage");
      if(collection.length<10){ // 去重之后不够十条继续请求
	App.vent.trigger("app.clipapp:nextpage");
      }
      //console.info(tag);
      if(!clips_exist){
	if(window.location.hash=="#my"){
	  $("#list").append(_i18n('message.cliplist_null.my'));
	}else if(window.location.hash=="#my/recommend"){
	  $("#list").append(_i18n('message.cliplist_null.recommend'));
	}else if(window.location.hash=="#my/interest"){
	  $("#list").append(_i18n('message.cliplist_null.interest'));
	}else{
	  $("#list").append(_i18n('message.cliplist_null.all'));
	}
      }
    });
  };

  App.vent.bind("app.clipapp:nextpage",function(){
    if(loading)return;
    if(!App.listRegion.currentView)return;
    if(App.listRegion.currentView.$el[0].className=="preview-view"&&new_page){
      loading = true;
      start += App.ClipApp.Url.page;
      end =start + App.ClipApp.Url.page-1;
      url = App.util.unique_url(base_url + "/" + start + ".." + end);
      var contentType = "application/json; charset=utf-8";
      if(!data){
	contentType = null;
      }
      collection.fetch({
	url:url,
	type:type,
	contentType:contentType,
	add:true,
	data:data,
	error :function(){
	  new_page = false;
	  loading = false;
	},
	success :function(col,res){
	  if(res.length>=App.ClipApp.Url.page){
	    collection_length = collection.length;
	  }else{
	    new_page = false;
	  }
	  setTimeout(function(){
	    loading = false;
	  },500);
	}
      });
    }
  });

  App.vent.bind("app.clipapp.cliplist:add",function(addmodel){
    var uid = App.util.getMyUid();
    var id = uid+":"+addmodel.id;
    var model = new ClipPreviewModel();
    var clip = {};
    var clipid = addmodel.id;
    var tag = addmodel.get("tag");
    var note = addmodel.get("note");
    var _public = addmodel.get("public");
    var user = {id : uid};
    var content = App.util.getPreview(addmodel.get("content"), 100);
    //clip本身的id为自己的id，model的id为uid:cid
    model.set({"public":_public,"content":content,"id":id,"clipid":clipid,"tag":tag,"note":note,"user":user,"recommend":""});
    var fn = clipListView.appendHtml;
    clipListView.appendHtml = function(collectionView, itemView){
      collectionView.$el.prepend(itemView.el);
      clipListView.appendHtml = fn;
    };
    clipListView.collection.add(model,{at:0});
    start++;
    collection_length++;
    $("#list").masonry("reload");
  });

  App.vent.bind("app.clipapp.cliplist:remove",function(model_id){
    var model = clipListView.collection.get(model_id);
    clipListView.collection.remove(model);
    $("#list").masonry("reload");
    start--;
    collection_length--;
    if(collection_length == 0){
      App.vent.trigger("app.clipapp:nextpage");
    }
  });

  // 评论总数以及转载总数的同步
  App.vent.bind("app.clipapp.cliplist:refresh",function(args){
    var model=App.listRegion.currentView.collection.get(args.model_id);
    var clip=model.get("clip");
    if(args.type == "comment"){
      if(args.pid == 0){
	var reply_count = model.get("reply_count") ? model.get("reply_count")+1 : 1;
	model.set({"reply_count":reply_count});
      }
    }
    if(args.type == "reclip"){
      var reprint_count = model.get("reprint_count") ? model.get("reprint_count")+1 : 1;
      model.set({"reprint_count":reprint_count});
    }
  });

  App.vent.bind("app.clipapp.cliplist:edit", function(content,model_id){
    var collection = clipListView.collection;
    var model = collection.get(model_id);
    var newcontent = App.util.getPreview(content, 100);
    model.set({content:newcontent});
  });

  return ClipList;

})(App, Backbone, jQuery);