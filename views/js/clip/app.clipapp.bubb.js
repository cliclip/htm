App.ClipApp.Bubb = (function(App, Backbone, $){
  var Bubb = {};

  var View = App.ItemView.extend({
    tagName : "iframe",
    className : "bubb-view",
    render : function(){
      this.$el.attr("src", "bub.html");
      return this;
    }
  });

  Bubb.showSiteTags = function(tag)
    getSiteTags(function(tags){
      tags.default = tag;
      App.vent.trigger("app.clipapp.bubb:show", tags);
    });
  };

  Bubb.showSiteBubs = function(tag)
    getSiteBubs(function(tags){
      tags.default = tag;
      App.vent.trigger("app.clipapp.bubb:show", tags);
    });
  };

  Bubb.showUserTags = function(uid, tag){
    getUserTags(uid, tag, function(tags){
      tags.default = tag;
      App.vent.trigger("app.clipapp.bubb:show", tags);
    });
  };

  Bubb.showUserBubs = function(uid, tag){
    getUserBubs(uid, tag, function(tags){
      tags.default = tag;
      App.vent.trigger("app.clipapp.bubb:show", tags);
    });
  };



  App.vent.bind("app.clipapp.bubb:show", function(tags){
    var bubbView = new BubbView({model: tags});
    App.bubbRegion.show(bubbView);
  });
  App.vent.bind("app.clipapp.bubb:reset", function(options){
    var bw = document.getElementById('bubbles').contentDocument.defaultView;
    if(bw.reset){
      bw.reset(options);
    } else { // waiting for bubble iframe load
      setTimeout(function(){ bubbles.trigger("reset", options); }, 100);
    }
  });
  App.vent.bind("app.clipapp.bubb:open", function(tag){
    console.log("open %s", tag);
  });
  App.vent.bind("app.clipapp.bubb:follow", function(tag){
    console.log("follow %s", tag);
  });
  App.vent.bind("app.clipapp.bubb:unfollow", function(tag){
    console.log("unfollow %s", tag);
  });
  App.vent.bind("app.clipapp.bubb:reclip", function(tag){
    console.log("reclip %s", tag);
  });

  App.addInitializer(function(){
    Bubb.siteTags = new Bubb.SiteTags();
    Bubb.siteTags.fetch();
    Bubb.siteBubbs = new Bubb.SiteBubbs();
    Bubb.siteBubbs.fetch();
  });

  var bubs = ["好玩", "好听", "好看", "好吃", "酷", "精辟"];
  var sink = ["讨厌"];

  // TEST
  setTimeout(function(){
    var follows = ["动漫", "科技"];
    var tags = ["电影", "音乐", "美女", "穿越", "户外", "流行"];
    tags = _.union(bubs, sink, tags, follows);

    App.vent.trigger("app.clipapp.bubb:reset", {
      // default: "美女",
      tags: tags,
      follows: follows,
      bubs: _.intersection(bubs, tags),
      sink: _.intersection(sink, tags)
    });
  }, 500);

  return Bubb;
})(App, Backbone, jQuery);