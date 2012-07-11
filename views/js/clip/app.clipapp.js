// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};
  ClipApp.getMyUid = getMyUid;

  function getMyUid(){
    return App.util.getMyUid();
  };

  ClipApp.siteShow = function(tag){
    //alert("siteShow     " + document.URL + "    " + window.location.href);
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteTags(tag);
    ClipApp.ClipList.showSiteClips(tag);
  };

  ClipApp.siteQuery = function(word, tag){
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteBubs(tag);
    ClipApp.ClipList.showSiteQuery(word, tag);
    App.vent.trigger("app.clipapp.routing:query", word);
  };

  ClipApp.register = function(){
    ClipApp.Login.show();
  };

  ClipApp.invite = function(key){ // 接受处理用户的激活注册
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteTags();
    ClipApp.ClipList.showSiteClips();
    ClipApp.Register.invite(key);
  };

  ClipApp.active = function(key){ // 接受用户的邮件添加激活或者是合并激活
    ClipApp.Face.showUser();
    ClipApp.Bubb.showSiteTags();
    ClipApp.ClipList.showSiteClips();
    ClipApp.EmailAdd.active(key);
  };

  ClipApp.findpasswd = function(){
    ClipApp.FindPass.show();
  };

  ClipApp.resetpasswd = function(link){
    ClipApp.ResetPass.show(link);
  };
  ClipApp.oauth = function(){
    ClipApp.Oauth.process();
  };
  ClipApp.error = function(message){
    ClipApp.Error.process(message);
  };

  ClipApp.userShow = function(uid, tag){
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.vent.trigger("app.clipapp.routing:usershow", uid, tag);
  };

  // user所追的人的列表 无需在请求Face 和 Bubb
  ClipApp.userFollowing = function(uid, tag){
    if(!uid) uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowingList.showUserFollowing(uid);
    App.vent.trigger("app.clipapp.routing:userfollowing", uid);
  };

  // 追user的人的列表 无需再请求Face 和 Bubb
  ClipApp.userFollower = function(uid, tag){
    if(!uid) uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowerList.showUserFollower(uid);
    App.vent.trigger("app.clipapp.routing:userfollower", uid);
  };

  ClipApp.myShow = function(tag){
   /* var now_url = window.location.href;
    alert("myShow    " + document.URL +"   "+document.location+ "  "+window.location.href);
    setTimeout(function(){
      alert("myShow    " + document.URL +"   "+document.location+ "  "+window.location.href);
    },200);
   */
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.vent.trigger("app.clipapp.routing:usershow",uid, tag);
  };

  ClipApp.myQuery = function(word, tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    // ClipApp.Bubb.showUserBubs(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.vent.trigger("app.clipapp.routing:query", word);
  };

  // interest和recommend 只需要显示 主观tag就可以了
  ClipApp.myInterest = function(tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showBubs(uid);
    // ClipApp.Bubb.showUserBubs(uid, tag);
    ClipApp.ClipList.showUserInterest(uid, tag);
    App.vent.trigger("app.clipapp.routing:interest", tag);
  };

  ClipApp.myRecommend = function(tag){
    var uid = getMyUid();
    ClipApp.Face.showUser(uid);
    ClipApp.Bubb.showBubs(uid);
    // ClipApp.Bubb.showUserBubs(uid, tag);
    ClipApp.ClipList.showUserRecommend(uid, tag);
    App.vent.trigger("app.clipapp.routing:recommend", tag);
  };

  ClipApp.mySetup = function(){
    var uid = getMyUid();
    ClipApp.UserEdit.showUserEdit(uid);
  };

  App.vent.bind("app.clipapp:login", function(callback){
    ClipApp.Login.show(callback);
  });

  App.vent.bind("app.clipapp:register", function(){
    ClipApp.Login.show();//register login 共用一个弹出框
  });

  App.vent.bind("app.clipapp:logout", function(){
    var uid = getMyUid();
    ClipApp.Logout.show(uid);
  });

  App.vent.bind("app.clipapp:usershow", function(uid){
    ClipApp.ClipList.showUserClips(uid);
    App.vent.trigger("app.clipapp.routing:usershow", uid);
  });

  App.vent.bind("app.clipapp:showfollowing", function(uid){
    ClipApp.FollowingList.showUserFollowing(uid);
    App.vent.trigger("app.clipapp.routing:userfollowing", uid);
  });

  App.vent.bind("app.clipapp:showfollower", function(uid){
    ClipApp.FollowerList.showUserFollower(uid);
    App.vent.trigger("app.clipapp.routing:userfollower", uid);
  });

  //reclip 用户一个clip
  App.vent.bind("app.clipapp:reclip", function(clipid, model_id, rid, pub){
    var uid = getMyUid();
    // 将没有做完的操作当作callback传给login，登录成功后有callback则进行处理
    if(!uid)
      ClipApp.Login.show(function(){
	App.ClipApp.Reclip.show(clipid,model_id,rid,pub);
      });
    else ClipApp.Reclip.show(clipid,model_id,rid,pub);
  });

  //对 user's tag下的clip的reclip
  App.vent.bind("app.clipapp:reclip_tag", function(user,tag){
    var uid = getMyUid();
    if(!uid) ClipApp.Login.show(function(){
      App.ClipApp.ReclipTag.show(user, tag);
    });
    else ClipApp.ReclipTag.show(user,tag);
  });

  // 当前用户追某用户的tag uid一直与face的保持一致
  App.vent.bind("app.clipapp:follow", function(uid, tag){
    var me = getMyUid();
    if(!me){
      ClipApp.Login.show(function(){
	App.ClipApp.Bubb.followUserBubs(uid, tag);
      });
    }else{
      if(!uid) uid = ClipApp.Face.getUserId();
      ClipApp.Bubb.followUserBubs(uid, tag);
    }
  });

  App.vent.bind("app.clipapp:recommend", function(cid,model_id,pub){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show(function(){
	App.ClipApp.Recommend.show(cid,model_id,pub);
      });
    }else{
      ClipApp.Recommend.show(cid,model_id,pub);
    }
  });

  App.vent.bind("app.clipapp:comment", function(cid,model_id){
    var uid = getMyUid();
    if(!uid){
      ClipApp.Login.show(function(){
	App.ClipApp.Comment.show(cid, model_id);
      });
    }else{
      ClipApp.Comment.show(cid,model_id);
    }
  });

  App.vent.bind("app.clipapp:clipdetail", function(clipid,model_id,recommend){
    //model_id为model的id，用来当detail的model改变时，改变list的model的数据
    ClipApp.ClipDetail.show(clipid,model_id,recommend);
  });

  App.vent.bind("app.clipapp:clipmemo", function(cid){
      App.ClipApp.ClipMemo.show(cid);
  });

  App.vent.bind("app.clipapp:clipedit", function(clipid){
    ClipApp.ClipEdit.show(clipid);
  });

  App.vent.bind("app.clipapp:clipadd", function(){
    var uid = getMyUid(); // 当前登录用户
    if(!uid){
      ClipApp.Login.show(function(){
	App.ClipApp.ClipAdd.show();
      });
    }else{
      // 不用回到用户首页[在进行list同步的时候判断一下就可以了]
      ClipApp.ClipAdd.show();
    }
  });

  // 牵扯太多的路由所以在 bubb中使用history.navigate进行路由的设定
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

  App.vent.bind("app.clipapp:clipdelete", function(clipid){
    var uid = getMyUid();
    ClipApp.ClipDelete.show(clipid);
  });

  App.vent.bind("app.clipapp:query", function(word, tag){
    var userid = ClipApp.Face.getUserId();
    var now_href = window.location.href;
    var myid = getMyUid();
    if(/my/.test(now_href)){
      ClipApp.myQuery(word, tag);
    }else{
      ClipApp.siteQuery(word, tag);
    }
  });

  return ClipApp;
})(App, Backbone, jQuery);
