// app.clipapp.cliplist.js

App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  ClipList.showSiteClips = function(tag){
    getSiteClips(tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showSiteQuery = function(word, tag){
    getSiteQuery(word, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserClips = function(uid, tag){
    getUserClips(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserQuery = function(uid, word, tag){
    getUserQuery(uid, word, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserInterest = function(uid, tag){
    getUserInterest(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  ClipList.showUserRecommend = function(uid, tag){
    getUserRecommend(uid, tag, function(clips){
      App.vent.trigger("app.clipapp.cliplist:show", clips);
    });
  };

  App.vent.bind("app.clipapp.cliplist:show", function(clips){
    var clipListView = new ClipListView({collection: clips});
    App.listRegion.show(clipListView);
  });

  return ClipList;
})(App, Backbone, jQuery);