 // app.clipapp.cliplist.js
App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var clips_exist = true;
  var hide_clips = [];
  var clipListView = {};
  var collection = {},start, end, current;
  var url = "",base_url = "",data = "",type = "",collection_length,new_page;
  var loading = false, P = App.ClipApp.Url.base;
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommend:"",//列表推荐的clip时有此属性
      user :{},
      content:{},
      refby:"",
      reply:"",
      hide:false,
      "public": true
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
	  resp[i].refby = resp[i].clip.refby? resp[i].clip.refby:0;
	  resp[i].reply = resp[i].clip.reply? resp[i].clip.reply:0;
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
      "click .type_text" : "createClipShareLink",
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
	  //STRANGE若不加延时则所有clip无图片
	  // 在翻页时最后一个clip不产生动态布局效果
	  setTimeout(function(){
	    $container.masonry("reload");
	  },0);
	}
      });
    },

    createClipShareLink: function(e){
      e.stopPropagation();
      var clipid = this.model.get("user").id + ":" + this.model.get("clipid");
      var model = new App.Model();
      if(document.selection&&document.selection.createRange().htmlText){
	return;
      }else if(window.getSelection&&$.trim(window.getSelection().toString())){
	return;
      }
      model.save({},{
	url: App.ClipApp.encodeURI(P+"/clip/"+clipid+'/sharelink'),
	type: "POST",
	success:function(model,res){ // 不只是弹出提示框这么简单
	  App.ClipApp.ClipDetail.show(clipid, null, {}, res);
	},
	error:function(model,error){ // 则显示该链接不能再点击
	  App.ClipApp.showConfirm(error, null, function(){});
	}
      });
    },

    show_detail: function(){
      //部分ff ie 选中clip preview 中内容会触发鼠标单击事件打开详情页
      //ie-7 8 无getSelection()只有document.selection  ie9 两个对象都有
      if(document.selection&&document.selection.createRange().htmlText){
	return;
      }else if(window.getSelection&&$.trim(window.getSelection().toString())){
	return;
      }
      var recommend = {
	rid: this.model.get("recommend").rid,
	user: this.model.get("recommend").user ? this.model.get("recommend").user.id : null
      };
      var clipid = this.model.get("user").id + ":" + this.model.get("clipid");
      App.ClipApp.showDetail(clipid,this.model.id,recommend);
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
      switch(opt){
	case 'reclip'://收
	  var recommend = { // 只是传给reclip用
	    rid : this.model.get("recommend").rid,
	    user: this.model.get("recommend").user ? this.model.get("recommend").user.id : null
	  };
	  App.ClipApp.showReclip(cid, mid, recommend, pub); break;
	case 'recommend'://转
	  //createClipShareLink(cid); break;
	  //App.ClipApp.showRecommend(cid,mid,pub);break;
	case 'comment'://评
	  App.ClipApp.showComment(cid, mid); break;
	case 'note'://注
	  App.ClipApp.showMemo(cid); break;
	case 'modify'://改
	  App.ClipApp.showEditClip(cid); break;
	case 'del'://删
	  App.ClipApp.showClipDelete(cid); break;
      }
    }
  });

/*
  function createClipShareLink(clipid){
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.encodeURI(P+"/clip/"+clipid+'/sharelink'),
      type: "POST",
      success:function(model,res){ // 不只是弹出提示框这么简单
	App.ClipApp.ClipDetail.show(clipid, null, {}, res);
      },
      error:function(model,error){ // 则显示该链接不能再点击
	App.ClipApp.showConfirm(error, null, function(){});
      }
    });
  }
*/

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "preview-view",
    itemView: ClipPreviewView
  });

  ClipList.flag_show_user = true; //clippreview是否显示用户名和用户头像
  ClipList.showSiteClips = function(tag){
    current = null;
    ClipList.flag_show_user = true;
    base_url = P+"/query";
    // 起始时间设置为，endTime前推一个月
    var date = (new Date()).getTime();
    data = {"startTime":date-86400000*30,"endTime":date+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page(current);
  };

  ClipList.showUserClips = function(uid, tag){
    current = null;
    ClipList.flag_show_user = false;
    base_url = P+"/user/"+uid+"/query";
    data = {user: uid,"startTime":Date.parse('March 1, 2012'),"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    if(App.ClipApp.isSelf(uid)) current = "my";
    init_page(current);
  };

  // 这两个Query对结果是没有要求的，按照关键字相关度
  ClipList.showSiteQuery = function(word, tag){
    current = null;
    ClipList.flag_show_user = true;
    base_url = P + "/query";
    var date = (new Date()).getTime();
    data = {text: word, "startTime":date-86400000*30,"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page(current);
  };

  // 是否public以及originality 都在api层进行判断
  ClipList.showUserQuery = function(uid, word, tag){
    current = null;
    ClipList.flag_show_user = false;
    base_url = P + "/user/"+uid+"/query";
    data = {text: word, user: uid, "startTime":Date.parse('May 1, 2012'),"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    if(App.ClipApp.isSelf(uid)) current = "my";
    init_page(current);
  };

  ClipList.showUserInterest = function(uid, tag){
    current = "interest";
    ClipList.flag_show_user = true;
    base_url = "/user/" + uid + "/interest";
    if(tag) base_url += "/tag/" + tag;
    base_url = P + base_url;
    data = null;
    type = "GET";
    init_page(current);
  };

  ClipList.showUserRecommend = function(uid, tag){
    current = "@me";
    ClipList.flag_show_user = true;
    base_url = "/user/"+uid+"/recomm";
    if(tag) base_url += "/tag/"+tag;
    base_url = P + base_url;
    data = null;
    type = "GET";
    init_page(current);
  };

  function collection_filter(collection,hide_list){
    collection_length -= hide_list.length;
    for(var i=0;i<hide_list.length;i++){
      collection.remove(collection.get(hide_list[i]));
    }
  };

  function init_page(current){
    var clips = new ClipPreviewList();
    collection = clips;
    start = 1;
    end = App.ClipApp.Url.page;
    url = App.ClipApp.encodeURI(base_url + "/" + start+".."+ end);
    if(data){
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
      //页面头部的紫色区域高度为99px；$(".header").height()==99
      if($(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8")){
	  $(document.body).scrollTop(99);
	}
      }
      $("#list").show();
      $("#follow").hide();
      App.listRegion.show(clipListView);
      current_page(current);
      if(collection.length<10){ // 去重之后不够十条继续请求
	nextpage();
      }
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

  // need refactor 不互相压着是否z-index就没有关系呢
  function current_page(str){
    setTimeout(function(){ // 如果没有延时去不到东西
      if(str=="my"){
	$(".my").css({"z-index":2,"top":"-3px","height":"33px"});
	$(".at_me").css({"z-index":1,"top":"0px","height":"30px"});
	$(".expert").css({"z-index":0,"top":"0px","height":"30px"});
      }else if(str=="@me"){
	$(".my").css({"z-index":1,"top":"0px","height":"30px"});
	$(".at_me").css({"z-index":1,"top":"-3px","height":"33px"});
	$(".expert").css({"z-index":0,"top":"0px","height":"30px"});
      }else if(str=="interest"){
	//ie7 此处层次关系导致次数必须设成0,2,2，0,0,1和0,1,2 效果不正确
	$(".my").css({"z-index":0,"top":"0px","height":"30px"});
	$(".at_me").css({"z-index":2,"top":"0px","height":"30px"});
	$(".expert").css({"z-index":2,"top":"-3px","height":"33px"});
      }else {
	$(".my").css({"z-index":2,"top":"0px","height":"30px"});
	$(".at_me").css({"z-index":1,"top":"0px","height":"30px"});
	$(".expert").css({"z-index":0,"top":"0px","height":"30px"});
      }
    }, 200);
  };

  function nextpage(){
    if(loading)return;
    if(!App.listRegion.currentView)return;
    if(App.listRegion.currentView.$el[0].className=="preview-view"&&new_page){
      loading = true;
      start += App.ClipApp.Url.page;
      end = start + App.ClipApp.Url.page-1;
      url = App.ClipApp.encodeURI(base_url + "/" + start + ".." + end);
      var contentType = "application/json; charset=utf-8";
      if(!data){ contentType = null; }
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
	  if(res.length >= App.ClipApp.Url.page){
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
  };

  App.vent.bind("app.clipapp.clipadd:success", function(addmodel){
    var json = data ? JSON.parse(data) : null;
      if(json && App.ClipApp.isSelf(json.user) && (!json.tag || _.intersection(json.tag,addmodel.get("tag")).length > 0) ){ //是my或my/tag tag in addmodel
      var model = new ClipPreviewModel();
      var uid = App.ClipApp.getMyUid();
      var id = uid+":"+addmodel.id;
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
    }else{ // 要进行myshow
      Backbone.history.navigate("my", true);
    }
  });

  function remove(model_id){
    var model = clipListView.collection.get(model_id);
    clipListView.collection.remove(model);
    $("#list").masonry("reload");
    start--;
    collection_length--;
    if(collection_length == 0){
      nextpage();
    }
  };

  App.vent.bind("app.clipapp.clipedit:success",function(content,model_id){
    var collection = clipListView.collection;
    var model = collection.get(model_id);
    var newcontent = App.util.getPreview(content, 100);
    model.set({content:newcontent});
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(model_id){
    remove(model_id);
  });

  App.vent.bind("app.clipapp.clipmemo:success", function(model, mid){
    var json = JSON.parse(data); // 此处的data是标识list的全局变量
    var user = json.user;
    if(App.ClipApp.isSelf(user) && json.tag){
      var tag = json.tag[0];
      var flag = _.find(model.get("tag"), function(t){ return t == tag; });
      if(flag === undefined) remove(user+":"+model.get("clipid"));
    }else if(model.get("public")){
      var collection = clipListView.collection;
      var tmp = collection.get(mid);
      tmp.set("public", model.get("public"));
    }
  });

  App.vent.bind("app.clipapp.comment:success", function(args){
    if(!args || !args.model_id){
      return;
    }else{
      var model=App.listRegion.currentView.collection.get(args.model_id);
      var reply = model.get("reply");
      reply = reply ? reply + 1 : 1;
      model.set({reply:reply});
    }
  });

  App.vent.bind("app.clipapp.delComment:success", function(args){
    if(!args || !args.model_id){
      return;
    }else{
      var model=App.listRegion.currentView.collection.get(args.model_id);
      var reply = model.get("reply");
      reply = (reply-1) >= 0 ? reply - 1 : 0;
      model.set({reply:reply});
    }
  });

  App.vent.bind("app.clipapp.reclip:success", function(args){
    if(!args || !args.model_id){
      return;
    }else{
      var model=App.listRegion.currentView.collection.get(args.model_id);
      var refby = model.get("refby");
      refby = refby ? refby + 1 : 1;
      model.set({refby: refby});
    }
  });

  App.vent.bind("app.clipapp:nextpage", function(){
    nextpage();
  });

  // 牵扯太多的路由所以在 bubb中使用history.navigate进行路由的设定
  App.vent.bind("app.clipapp:open_bubb", function(uid, tag){
    if(/interest/.test(base_url)){
      ClipList.showUserInterest(uid, tag);
    }else if(/recommend/.test(base_url)){
      ClipList.showUserRecommend(uid, tag);
    }else{
      if(!uid){
	ClipList.showSiteClips(tag);
      }else {
	ClipList.showUserClips(uid, tag);
      }
    }
  });

  return ClipList;
})(App, Backbone, jQuery);