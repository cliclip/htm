App.ClipApp.Bubb = (function(App, Backbone, $){
  var Bubb = {};
  var P = App.ClipApp.Url.base;
  // model && view

  var BubbModel = App.Model.extend({});

  var BubbView = App.ItemView.extend({
    id : "bubbles",
    tagName : "iframe",
    className : "bubb-view",
    render : function(){
      this.$el.attr("frameborder", "0",0);//兼容属性大小写问题
      this.$el.attr("scrolling", "no");
      this.$el.attr("src", "bub.html");
      return this;
    }
  });
  // private
  var _uid  = null;
  var last = null;
  var old_self = null;
  var self = true;
  var lang = App.versions.getLanguage(); // 用户语言设置
  var homepage = false;

  // constants
  // 与显示无关，只是用来确定泡泡的大小而已
  var sink = {
    zh: ["讨厌"],
    en: ["hate"]
  };
  var bubs = App.util.getBubbs();
  // exports
  Bubb.showSiteTags = function(tag){
    _uid = null;
    self = false;
    homepage = true;
    getSiteTags(function(tags, follows){
      showTags(mkTag(_uid, tags, follows, tag, self, homepage));
    });
  };

  Bubb.showSiteBubs = function(tag){
    _uid = null;
    self = false;
    homepage = true;
    getSiteBubs(function(tags, follows){
      showTags(mkTag(_uid, tags, follows, tag, self, homepage));
    });
  };

  Bubb.showUserTags = function(uid, tag){
    _uid = uid;
    self = App.util.self(uid);
    homepage = false;
    getUserTags(uid, function(tags, follows){
      showTags(mkTag(_uid, tags, follows, tag, self));
    });
  };

  Bubb.cleanTags = function(){
    showTags(mkTag(_uid, [], [], null, false));
  };
/*
  Bubb.showUserBubs = function(uid, tag){
    _uid = uid;
    getUserBubs(uid, function(tags, follows){
      self = App.util.self(uid);
      showTags(mkTag(_uid, tags, follows, tag, self));
    });
  };
*/
  Bubb.followUserBubs = function(uid, tag){
    if(!uid) uid = App.ClipApp.Face.getUserId();;
    followUserTag(uid, tag, function(){
      // 更新bubb显示
      if(tag == '*'){
	refresh(uid, ['*']);
	last.follows = ['*'];
      }else{
	iframe_call('bubbles', "followTag", tag);
	last.follows.push(tag);
      }
      App.vent.trigger("app.clipapp.follow:success", last.follows);
    });
  };

  Bubb.unfollowUserBubs = function(uid, tag){
    if(!uid) uid = App.ClipApp.Face.getUserId();
    unfollowUserTag(uid, tag, function(){
      // 更新bubb显示
      if(tag == '*'){
	refresh(uid, []);
	last.follows = [];
      }else{
	iframe_call('bubbles', "unfollowTag", tag);
	last.follows = _.without(last.follows,tag);
      }
      App.vent.trigger("app.clipapp.unfollow:success", last.follows);
    });
  };

  function showTags(tags){
    if($('#bubbles').length == 0){
      var bubbView = new BubbView();
      App.bubbRegion.show(bubbView);
    }
    if (hasChanged(last, tags, old_self)) {
      iframe_call('bubbles', "resetTags", tags);
    } else if (changeDefault(last, tags)) {
      iframe_call('bubbles', "openTag", tags.current);
    }
    old_self = _uid;
    last = tags;
  };

  App.vent.bind("app.clipapp.clipadd:success",function(addmodel){
    if(App.util.self(_uid)){
      refresh(App.util.getMyUid(), null, addmodel.get("tag"));
    }
  });

  App.vent.bind("app.clipapp.clipedit:success", function(){
    if(App.util.self(_uid)){
      Bubb.showUserTags(_uid);
    }
  });

  App.vent.bind("app.clipapp.clipmemo:success", function(){
     if(App.util.self(_uid)){
      Bubb.showUserTags(_uid);
    }
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    if(App.util.self(_uid)){
      Bubb.showUserTags(_uid);
    }
  });

  function refresh(uid, follow, new_tags){
    _uid = uid;
    self = App.util.self(uid);
    if(follow){
      showTags(mkTag(_uid, last.tags, follow, null, self));
    }else if(!_.isEmpty(new_tags)){
      showTags(mkTag(_uid, _.union(last.tags, new_tags), follow, null, self));
    }
  };

  //高版本的marionette 设为false也可直接刷新 但是提交上去的数据是乱码
  App.vent.bind("app.clipapp:open", function(uid, tag){
    // console.log("open %s", tag + "  " +uid);
    iframe_call('bubbles', "openTag", tag); // 更新bubb显示
    var url = mkUrl(tag);
    Backbone.history.navigate(url, false);
    App.vent.trigger("app.clipapp.bubb:open", uid, tag);
  });

  // service api
  function getSiteTags(callback){
    // API getSiteTags
    // 替换掉之前的取用户2的数据为，常量
    var	siteTags = {
      zh: ["好看", "有趣","好听", "真赞", "好吃",  "想要", "精辟","讨厌","书籍","电影","旅游","资料"],
      en: ["pretty","funny","musical","cool","tasty","wish","incisive","hate","book","film","tour","data"]
    };
    callback(siteTags[lang],[]);
  }

  function getSiteBubs(callback){
    getSiteTags(function(tags, follows){
      var tags2 = _.intersection(tags,bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }

  // 取 uid 的 tag
  function getUserTags(uid, callback){
    // API getUserTags
    // CHANGE 需按当前用户查找各 tag 的 follow 关系
    // GET $HOST/$BASE/_/user/:id/tag/0..19
    var bubbModel = new BubbModel({id: uid});
    var url = App.util.unique_url(P+"/user/"+uid+"/meta/0..0");
    bubbModel.fetch({url: url});
    bubbModel.onChange(function(bubbs){
      var bubb = bubbs.toJSON();
      App.vent.trigger("app.clipapp.follow:get", bubb.follow);
      if(callback)callback(bubb.tag.slice(0,19), bubb.follow);
    });
  };
/*
  function getUserBubs(uid, callback){
    getUserTags(uid, function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }
*/
  function followUserTag(uid, tag, callback){
    if(!uid) uid = _uid;
    var url = url = P+"/user/"+uid+"/follow";
    if(tag == '*') {
      tag = "all";
    }else{
      tag = [tag];
    }
    var bubbModel = new BubbModel();
    bubbModel.save({tag: tag}, {
      url: url,
      data: JSON.stringify({tag: tag}),
      contentType:"application/json; charset=utf-8",
      success:callback,
      error:function(model, error){
	App.ClipApp.showConfirm(error);
      }
    });
  }

  function unfollowUserTag(uid, tag, callback){
    var url = "";
    if(!uid){
      uid = _uid ? _uid : 2;
    }
    if(tag == '*') {
      url = P+"/user/"+uid+"/follow";
    }else{
      //encodeURIComponent() 函数可把字符串作为 URI 组件进行编码。
      //该方法不会对 ASCII 字母和数字进行编码，也不会对这些 ASCII 标点符号进行编码： - _ . ! ~ * ' ( ) 。其他字符（比如 ：;/?:@&=+$,# 这些用于分隔 URI 组件的标点符号），都是由一个或多个十六进制的转义序列替换的。此方法会编码URI中的特殊字符
      url  = P+"/user/"+uid+"/follow/"+encodeURIComponent(tag);
    }
    var bubbModel = new BubbModel({id: uid});
    bubbModel.destroy({
      url: url,
      success:callback,
      error:function(){}
    });
  }

  // call functions inside iframe

  function iframe_call(ifname, fname, fargs){
    var _iframe =  document.getElementById(ifname);
    var ifwin;
    if(!_iframe.contentDocument){//ie6 7
      ifwin = document.frames[ifname].document.parentWindow;;
    }else if(_iframe.contentDocument.parentWindow){//ie8
      ifwin = _iframe.contentDocument.parentWindow;
    }else{//其他主流浏览器
      ifwin = _iframe.contentDocument.defaultView;
    }
    if(ifwin && ifwin[fname]){
      // console.info("ifwin :: "+ifwin);
      // console.log(ifwin[fname]);
      // console.log("iframe_call(", ifname, fname, fargs, ")");
      // console.log(typeof fargs.bubs);
      // console.dir(fargs);
      ifwin[fname](fargs);
    }else { // waiting for iframe load
      //console.info("waiting for iframe reload");
      setTimeout(function(){ iframe_call(ifname, fname, fargs); }, 100);
    }
  }

  // utils 因为追了所有没有办法只停追一个
  function mkTag(uid, tags, follows, tag, self, homepage){
    // DEBUG PURPOSE
    // tags = _.without(_.union(bubs, sink, tags, follows),"*");
    //tags = _.compact(_.without(_.union(tags, follows),"*"));
    tags = _.compact(_.without(tags,"*"));
    follows = follows === null ? [] : follows;
    var opt = {
      tags: tags,
      follows: follows,
      bubs: self ? bubs : _.intersection(bubs, tags),
      sink: self ? sink[lang] : _.intersection(sink[lang], tags),
      user: uid,
      self: self,
      t_reclip: _i18n('bubb.reclip'),
      t_follow: _i18n('bubb.follow'),
      t_unfollow: _i18n('bubb.unfollow')
    };
    if(homepage) opt.homepage = homepage;
    if(tag) opt.current = tag;
    return opt;
  }

  // 需要区分 my/interest、 my/recommend、和 my
  function mkUrl(tag){
    var encode_tag = encodeURIComponent(tag);
    var url = Backbone.history.fragment;
    var i = url.indexOf("/tag");
    if(_uid){
      if(i >= 0){
	url = url.substr(0, i);
	return url += "/tag/"+encode_tag;
      }else{
	/* if(url.indexOf("my/interest") >= 0)
	 return "/my/interest/tag/"+encode_tag;
	 else if(url.indexOf("my/recommend") >= 0)
	 return "/my/recommend/tag/"+encode_tag; */
	if(url.indexOf("my") >= 0)
	  return "/my/tag/"+encode_tag;
	else
	  return "/user/"+_uid+"/tag/"+encode_tag;
      }
    }else{
      return "/tag/"+encode_tag;
    }
  };

  function hasChanged(tags1, tags2, old_self){
    if(old_self != _uid){ // 若 self 已经变化，则 tag 不能重用
      return true;
    }
    if(_.isEmpty(tags2.follows) || tags2.follows[0]=="*"){
      // 若 follows 为空，意味着追（[*]被过滤为[]）或停（[]），则 tag 不能重用
      return true;
    }
    if(tags1 && tags1.tags && tags2 && tags2.tags){
      // 若 tag1 和 tag2 的 tags 没有不同，则可以重用
      return _.difference(tags1.tags, tags2.tags).length != 0;
    }
    else {
      // 否则，不能重用
      return true;
    }
  }

  function changeDefault(tags1, tags2){
    if(tags1 && tags1.current && tags2 && tags2.current){
      return tags1.current != tags2.current;
    } else {
      return true;
    }
  }


  // return
  return Bubb;
})(App, Backbone, jQuery);