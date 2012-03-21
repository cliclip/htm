// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};

  function getMyUid(){
    // console.log("getMyUid  :: "+ClipApp.Me.me.get("id"));
    // return ClipApp.Me.me.get("id");
    var id = null;
    if(document.cookie){
      id =  document.cookie.split("=")[1].split(":")[0];
    }
    return id;
  };

  ClipApp.siteShow = function(tag){
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteTags(tag);
    ClipApp.ClipList.showSiteClips(tag);
  };

  ClipApp.siteQuery = function(word, tag){
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteBubs(tag);
    ClipApp.ClipList.showSiteQuery(word, tag);
  };

  ClipApp.register = function(){
    ClipApp.Register.show();
  };

  ClipApp.userShow = function(uid, tag){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
  };

  ClipApp.userFollowing = function(uid, tag){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowingList.showUserFollowing(uid); // TODO
  };

  ClipApp.userFollower = function(uid, tag){
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
    // var uid = getMyUid();
    // ClipApp.Login.show(uid);
    ClipApp.Login.show();
  });

  App.vent.bind("app.clipapp:logout", function(){
    var uid = getMyUid();
    ClipApp.Logout.show(uid);
  });

  App.vent.bind("app.clipapp:reclip", function(clipid){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show();
    }else{
      ClipApp.Reclip.show(clipid);
    }
  });

  App.vent.bind("app.clipapp:recommend", function(clipid){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show();
    }else{
      ClipApp.Recommend.show(clipid);
    }
  });

  App.vent.bind("app.clipapp:comment", function(clipid){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show();
    }else{
      ClipApp.Comment.show(clipid);
    }
  });

  App.vent.bind("app.clipapp:clipdetail", function(clipid){
    var uid = getMyUid();
    ClipApp.ClipDetail.show(uid, clipid);
  });

  App.vent.bind("app.clipapp:clipmemo", function(clipid,tags,note,pub){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show();
    }
      ClipApp.ClipMemo.show(clipid, tags, note, pub);
  });

  App.vent.bind("app.clipapp:clipedit", function(clipid){
    var uid = getMyUid();
    ClipApp.ClipEdit.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:clipadd", function(){
    var uid = getMyUid(); // 当前登录用户
    if(!uid){
      ClipApp.Login.show();
    }
    ClipApp.ClipAdd.show(uid);
  });

  App.vent.bind("app.clipapp:mycliplist", function(){
    ClipApp.myShow();
  });

  App.vent.bind("app.clipapp:clipdelete", function(clipid){
    var uid = getMyUid();
    ClipApp.ClipDelete.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:query", function(word, tag){
    var userid = ClipApp.Face.getUserId();
    var uid = getMyUid();
    if(uid == userid){
      App.vent.trigger("app.clipapp.routing:myquery:show", word);
      ClipApp.myQuery(word, tag);
    }else{
      App.vent.trigger("app.clipapp.routing:query:show", word);
      ClipApp.siteQuery(word, tag);
    }
  });

  setTimeout(function(){
//    App.vent.trigger("app.clipapp:clipdetail", "1:2");
  }, 500);

  return ClipApp;
})(App, Backbone, jQuery);
