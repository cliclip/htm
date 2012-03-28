App.ClipApp.Bubb = (function(App, Backbone, $){
  var Bubb = {};
  var P = App.ClipApp.Url.base;
  // model && view

  var BubbModel = App.Model.extend({
    parse: function(resp){
      return resp;
    }
  });

  var BubbView = App.ItemView.extend({
    id : "bubbles",
    tagName : "iframe",
    className : "bubb-view",
    render : function(){
      this.$el.attr("src", "bub.html");
      return this;
    }
  });

  // constants

  var bubs = ["好玩", "好听", "好看", "好吃", "酷", "精辟"];
  var sink = ["讨厌"];

  // private
  var _uid  = null;
  var last = null;
  var old_self = null;
  var self = true;

  // exports

  Bubb.showSiteTags = function(tag){
    _uid = null;
    self = false;
    getSiteTags(function(tags, follows){
      App.vent.trigger("app.clipapp.bubb:show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.showSiteBubs = function(tag){
    _uid = null;
    self = false;
    getSiteBubs(function(tags, follows){
      App.vent.trigger("app.clipapp.bubb:show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.showUserTags = function(uid, tag){
    _uid = uid;
    self = false;
    var token = document.cookie.split("=")[1];
    getUserTags(uid, function(tags, follows){
      if(token && token.split(":")[0] == uid){
	self = true;
      }
      App.vent.trigger("app.clipapp.bubb:show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.showUserBubs = function(uid, tag){
    _uid = uid;
    slef = false;
    var token = document.cookie.split("=")[1];
    getUserBubs(uid, function(tags, follows){
      if(token && token.split(":")[0] == uid)
	self = true;
      App.vent.trigger("app.clipapp.bubb:show", mkTag(tags, follows, tag, self));
    });
  };

  // events

  App.vent.bind("app.clipapp.bubb:show", function(tags){
    if($('#bubbles').length == 0){
      var bubbView = new BubbView();
      App.bubbRegion.show(bubbView);
    }
    if (changeTags(last, tags, old_self, self)) {
      resetTags(tags);
    } else if (changeDefault(last, tags)) {
      openTag(tags.default);
    }
    old_self = self;
    last = tags;
  });

  App.vent.bind("app.clipapp.bubb:open", function(tag){
    // console.log("open %s", tag);
    // 可以是在当前路由上加上某个值
    App.Routing.ClipRouting.router.navigate(mkUrl(tag), true);
  });

  App.vent.bind("app.clipapp.bubb:follow", function(tag){
    var bubbModel = new BubbModel({id: _uid});
    var url = P+"/user/"+_uid+"/follow/"+tag;
    bubbModel.fetch({
      type:'POST',
      url: url,
      data: JSON.stringify({tag: tag}),
      contentType:"application/json; charset=utf-8"
    });
  });

  App.vent.bind("app.clipapp.bubb:unfollow", function(tag){
    // console.log("unfollow %s", tag);
    var bubbModel = new BubbModel({id: _uid});
    var url = P+"/user/"+_uid+"/follow/"+tag;
    // console.info(bubbModel.id+"   "+url);
    bubbModel.destroy({
      url: url
    });
  });

  // 有_uid作为全局变量，进行url地址匹配
  App.vent.bind("app.clipapp.bubb:reclip", function(tag){
    App.vent.trigger("app.clipapp:reclip", null, _uid, tag);
  });

  // init

  App.addInitializer(function(){
  });

  // ---- implements

  // service api

  function getSiteTags(callback){
    // API getSiteTags
    // CHANGE 需按当前用户查找各 tag 的 follow 关系
    // GET $HOST/$BASE/_/user/0/tag/0..19
    // var follows = ["动漫", "科技"];
    // var tags = ["电影", "音乐", "美女", "穿越", "户外", "流行"];
    var bubbModel = new BubbModel({id: "1"});
    var url = P+"/user/"+bubbModel.id+"/tag/0..19";
    bubbModel.fetch({url: url});
    bubbModel.onChange(function(bubbs){
      var bubb = bubbs.toJSON();
      callback(bubb.tag, bubb.follow);
    });
  }

  function getSiteBubs(callback){
    getSiteTags(function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
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
    var url = P+"/user/"+uid+"/tag/0..19";
    bubbModel.fetch({url: url});
    bubbModel.onChange(function(bubbs){
      var bubb = bubbs.toJSON();
      callback(bubb.tag, bubb.follow);
    });
  }

  function getUserBubs(uid, callback){
    getUserTags(uid, function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }

  // delegates
  function resetTags(tags){
    var bw = document.getElementById('bubbles').contentDocument.defaultView;
    if(bw.resetTags){
      bw.resetTags(tags);
    } else { // waiting for bubble iframe load
      setTimeout(function(){ resetTags(tags); }, 100);
    }
  }

  function openTag(tag){
    var bw = document.getElementById('bubbles').contentDocument.defaultView;
    if(bw.openTag){
      bw.openTag(tag);
    } else { // waiting for bubble iframe load
      setTimeout(function(){ openTag(tag); }, 100);
    }
  }

  // utils

  function mkTag(tags, follows, tag, self){
    // DEBUG PURPOSE
    tags = _.union(bubs, sink, tags, follows);
    var opt = {
      tags: tags,
      follows: follows,
      bubs: _.intersection(bubs, tags),
      sink: _.intersection(sink, tags),
      self: self
    };
    if(tag) opt.default = tag;
    return opt;
  }

  function mkUrl(tag){
    var url = Backbone.history.fragment;
    var i = url.indexOf("/tag");
    if(i > 0){
      url = url.substr(0, i);
    }
    return url += "/tag/"+tag;
  }

  function changeTags(tags1, tags2, old_self, self){
    if(old_self != self){
      return true;
    }else if(tags1 && tags1.tags && tags2 && tags2.tags){
      if(tags1.tags.length != tags2.tags.length)
	return true;
      return _.difference(tags1.tags, tags2.tags).length != 0;
    } else {
      return true;
    }
  }

  function changeDefault(tags1, tags2){
    if(tags1 && tags1.default && tags2 && tags2.default){
      return tags1.default != tags2.default;
    } else {
      return true;
    }
  }

  // return

  return Bubb;
})(App, Backbone, jQuery);