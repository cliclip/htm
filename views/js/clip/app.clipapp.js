// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};

  function getMyId(){
    return ClipApp.Me.me.get("uid");
  }


  ClipApp.siteShow = function(tag){
    // ClipApp.Face.showUser();
    // ClipApp.Bubb.showSiteTags(tag);
    ClipApp.ClipList.showSiteClips(tag);
  };

  ClipApp.siteQuery = function(word, tag){
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteBubs(tag);
    ClipApp.ClipList.showSiteQuery(word, tag);
  };

  ClipApp.userShow = function(uid, tag){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
  };

  ClipApp.userFollowing = function(uid){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowingList.showUserFollowing(uid); // TODO
  };

  ClipApp.userFollower = function(uid){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowerList.showUserFollower(uid); // TODO
  };

  ClipApp.myShow = function(tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
  };

  ClipApp.myQuery = function(word, tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserBubs(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
  };

  ClipApp.myInterest = function(tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserBubs(uid, tag);
    ClipApp.ClipList.showUserInterest(uid, tag);
  };

  ClipApp.myRecommend = function(tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserBubs(uid, tag);
    ClipApp.ClipList.showUserRecommend(uid, tag);
  };

  App.vent.bind("app.clipapp:login", function(){
    var uid = getMyUid();
    ClipApp.Login.show(uid);
  });

  App.vent.bind("app.clipapp:logout", function(){
    var uid = getMyUid();
    ClipApp.Logout.show(uid);
  });

  App.vent.bind("app.clipapp:reclip", function(clipid){
    var uid = getMyUid();
    ClipApp.Reclip.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:recommend", function(clipid){
    var uid = getMyUid();
    ClipApp.Recommend.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:comment", function(clipid){
    var uid = getMyId();
    ClipApp.Comment.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:clipdetail", function(clipid){
    var uid = getMyId();
    ClipApp.ClipDetail.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:clipmemo", function(clipid){
    var uid = getMyId();
    ClipApp.ClipMemo.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:clipedit", function(clipid){
    var uid = getMyId();
    ClipApp.ClipEdit.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:clipdelete", function(clipid){
    var uid = getMyId();
    ClipApp.ClipDelete.show(clipid, uid);
  });

  return ClipApp;
})(App, Backbone, jQuery);
