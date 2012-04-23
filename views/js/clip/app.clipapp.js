// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};
  ClipApp.getMyUid = getMyUid;
  function getMyUid(){
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
    App.vent.trigger("app.clipapp.routing:query:show", word);
  };

  ClipApp.register = function(){
    ClipApp.Login.show();
  };
  ClipApp.findpasswd = function(){
    ClipApp.FindPass.show();
  };
  ClipApp.resetpasswd = function(link){
    ClipApp.ResetPass.show(link);
  };

  ClipApp.userShow = function(uid, tag){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
  };

  // user所追的人的列表 无需在请求Face 和 Bubb
  ClipApp.userFollowing = function(uid, tag){
    if(!uid) uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    App.vent.trigger("app.clipapp.followinglist:show", uid);
    // ClipApp.FollowingList.showUserFollowing(uid); // TODO
  };

  // 追user的人的列表 无需再请求Face 和 Bubb
  ClipApp.userFollower = function(uid, tag){
    if(!uid) uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    App.vent.trigger("app.clipapp.followerlist:show",uid);
    // ClipApp.FollowerList.showUserFollower(uid); // TODO
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
    App.vent.trigger("app.clipapp.routing:myquery:show", word);
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

  ClipApp.mySetup = function(){
    var uid = getMyUid();
    ClipApp.UserEdit.showUserEdit(uid);
  };

  App.vent.bind("app.clipapp:login", function(){
    // var uid = getMyUid();
    // ClipApp.Login.show(uid);
    ClipApp.Login.show();
  });

  App.vent.bind("app.clipapp:register", function(){
    ClipApp.Login.show();//register login 共用一个弹出框
  });

  App.vent.bind("app.clipapp:logout", function(){
    var uid = getMyUid();
    ClipApp.Logout.show(uid);
  });

  // clipid有值 ==> 对单独clip的reclip 否则是对 user's tag下的clip的reclip
  App.vent.bind("app.clipapp:reclip", function(clipid, user, tag){
    var uid = getMyUid();
    if(!uid) ClipApp.Login.show();
    else ClipApp.Reclip.show(clipid, user, tag);
  });

  // 当前用户追某用户的tag uid一直与face的保持一致
  App.vent.bind("app.clipapp:follow", function(uid, tag){
    var me = getMyUid();
    if(!me){
      ClipApp.Login.show();
    }else{
      if(!uid) uid = ClipApp.Face.getUserId();
      ClipApp.Bubb.followUsreBubs(uid, tag);
    }
  });

  App.vent.bind("app.clipapp:recommend", function(model){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show();
    }else{
      ClipApp.Recommend.show(model);
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

  App.vent.bind("app.clipapp:clipdetail", function(clipid,model_cid){
    // var uid = getMyUid();
    //model_cid为model的id，用来当detail的model改变时，改变list的model的数据
    ClipApp.ClipDetail.show(clipid,model_cid);
  });

    App.vent.bind("app.clipapp:clipmemo", function(model, operate){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show();
    }else{
      ClipApp.ClipMemo.show(model, operate);
    }
  });

  App.vent.bind("app.clipapp:clipedit", function(clipid){
    var uid = getMyUid();
    ClipApp.ClipEdit.show(clipid, uid);
  });

  App.vent.bind("app.clipapp:clipadd", function(){
    var uid = getMyUid(); // 当前登录用户
    if(!uid){
      ClipApp.Login.show();
    }else{
      location.href="#my";
      ClipApp.ClipAdd.show(uid);
    }
  });

  App.vent.bind("app.clipapp:cliplist.refresh", function(uid, url, tag){
    if(/interest/.test(url)){
      ClipApp.ClipList.showUserInterest(uid, tag);
    }else if(/recommend/.test(url)){
      ClipApp.ClipList.showUserRecommend(uid, tag);
    }else{
      if(!uid){
	ClipApp.ClipList.showSiteClips(tag);
      }else {
	ClipApp.ClipList.showUserClips(uid, tag);
      }
    }
  });

  App.vent.bind("app.clipapp:mycliplist", function(){
    ClipApp.myShow();
  });

  App.vent.bind("app.clipapp:clipdelete", function(clipid){
    var uid = getMyUid();
    ClipApp.ClipDelete.show(clipid);
  });

  App.vent.bind("app.clipapp:query", function(word, tag){
    var userid = ClipApp.Face.getUserId();
    var myid = getMyUid();
    if(myid == userid && myid!=null){
      ClipApp.myQuery(word, tag);
    }else{
      ClipApp.siteQuery(word, tag);
    }
  });

 // setTimeout(function(){
   // App.vent.trigger("app.clipapp:clipdetail", "1:1");
 // }, 500);

  return ClipApp;
})(App, Backbone, jQuery);
