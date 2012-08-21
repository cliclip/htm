// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};
  ClipApp.isLoggedIn = function(){
    return App.util.getMyUid() != null ? true : false;
  };

  ClipApp.isOwner = function(uid1, uid2){
    return uid1 == uid2;
  };

  ClipApp.siteShow = function(tag){
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags(tag);
    ClipApp.ClipList.showSiteClips(tag);
    App.vent.trigger("app.clipapp.ga:track_homepage");
  };

  ClipApp.siteQuery = function(word, tag){
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteBubs(tag);
    ClipApp.ClipList.showSiteQuery(word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word);
  };

  ClipApp.register = function(){
    ClipApp.Login.show();
  };

  ClipApp.invite = function(key){ // 接受处理用户的激活注册
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags();
    ClipApp.ClipList.showSiteClips();
    ClipApp.Register.invite(key);
  };

  ClipApp.active = function(key){ // 接受用户的邮件添加激活或者是合并激活
    ClipApp.Face.show();
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
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:usershow", uid, tag);
  };

  ClipApp.userQuery = function(uid, word, tag){
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word, uid);
  };

  // user所追的人的列表 无需在请求Face 和 Bubb
  ClipApp.userFollowing = function(uid, tag){
    if(!uid) uid = App.util.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowingList.showUserFollowing(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollowing", uid);
  };

  // 追user的人的列表 无需再请求Face 和 Bubb
  ClipApp.userFollower = function(uid, tag){
    if(!uid) uid = App.util.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowerList.showUserFollower(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollower", uid);
  };

  ClipApp.myShow = function(tag){
    var uid = App.util.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:usershow",uid, tag);
  };

  ClipApp.myQuery = function(word, tag){
    var uid = App.util.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word);
  };

  // interest和recommend 只需要显示 主观tag就可以了
  ClipApp.myInterest = function(tag){
    var uid = App.util.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.cleanTags();
    ClipApp.ClipList.showUserInterest(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:interest", tag);
  };

  /*ClipApp.myRecommend = function(tag){
    var uid = App.util.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.cleanTags();
    ClipApp.ClipList.showUserRecommend(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:recommend", tag);
  };
  ClipApp.mySetup = function(){
    var uid = App.util.getMyUid();
    ClipApp.UserEdit.showUserEdit();
    ClipApp.UserEdit.showFace(false);
    ClipApp.UserEdit.showEmail();
    ClipApp.RuleEdit.show();
    ClipApp.WeiboEdit.show();
    ClipApp.TwitterEdit.show();
    ClipApp.UserEdit.showPassEdit();
  };*/

  // 为detail页面添加网址
  ClipApp.showDetail = function(uid, clipid){
    ClipApp.siteShow();
    App.ClipApp.ClipDetail.show(uid+":"+clipid, null, {});
  };


  ClipApp.showLogin = function(callback){
    ClipApp.Login.show(callback);
  };

  // 对于那些直接点击修改按钮的部分，有些多余
  ClipApp.showEditClip = function(clipId){
    if(!ClipApp.isLoggedIn()){
      ClipApp.showLogin();
    }else{
      if (ClipApp.isOwner(clipId.split(":")[0], App.util.getMyUid())) {
	if(/clip\/([0-9]+)\/([0-9]+)/.test(Backbone.history.fragment))
	  ClipApp.ClipDetail.close();
	ClipApp.ClipEdit.show(clipId);
      }
    }
  };

  ClipApp.showSuccess = function(key, value){
    ClipApp.Message.success(key, value);
  };

  ClipApp.showAlert = function(key, value, fun){
    ClipApp.Message.alert(key, value);
    if(typeof(fun) == "function"){
      App.vent.unbind("app.clipapp.message:sure");
      App.vent.bind("app.clipapp.message:sure", fun);
    }
  };

  ClipApp.showConfirm = function(key, value){
    ClipApp.Message.confirm(key, value);
  };

  App.vent.bind("all", function(eventName){
    console.log(eventName);
  });

  App.vent.bind("app.clipapp:login", function(callback){
    ClipApp.Login.show(callback);
  });

  App.vent.bind("app.clipapp.login:success", function(res, remember){
    ClipApp.Login.success(res, remember);
    ClipApp.Me.me.fetch();
    ClipApp.Bubb.getUserTags(res.token.split(":")[0]);
  });

  App.vent.bind("app.clipapp:register", function(){
    ClipApp.Register.show();
  });

  App.vent.bind("app.clipapp.register:success", function(key, res){
    ClipApp.Register.success(key, res);
    ClipApp.Me.me.fetch();
    if(key == "register_success"){ // invite的情况不需要触发gotosetup
      ClipApp.GotoSetup.show(key, res.email);
    }
    if(/language=en/.test(document.cookie)){ //cliclip的uid为72
      ReclipTag.help(72,["helper","newbie"]);
    }else{
      ReclipTag.help(72,["帮助","新手"]);
    }
  });

  App.vent.bind("app.clipapp:logout", function(){
    var uid = App.util.getMyUid();
    ClipApp.Logout.show();
  });

  App.vent.bind("app.clipapp.useredit:show", function(){
    ClipApp.UserEdit.showUserEdit();
    ClipApp.UserEdit.showFace();
    ClipApp.UserEdit.showEmail();
    ClipApp.RuleEdit.show();
    ClipApp.WeiboEdit.show();
    ClipApp.TwitterEdit.show();
    ClipApp.UserEdit.showPassEdit();
  });

  App.vent.bind("app.clipapp.useredit:rename", function(){
    ClipApp.UserEdit.rename();
  });

  App.vent.bind("app.clipapp.userbind:show",function(oauth,fun,remember){
    UserBind.show(oauth, fun, remember);
  });

  App.vent.bind("app.clipapp.face:reset", function(){
    ClipApp.Me.me.fetch();
    if(/my/.test(window.location.hash))
      ClipApp.Face.show(ClipApp.Me.me.get("id"));
  });

  App.vent.bind("app.clipapp.emailadd:show",function(uid){
    ClipApp.EmailAdd.show(uid);
  });

  App.vent.bind("app.clipapp:nextpage", function(){
    ClipApp.ClipList.nextpage();
    ClipApp.FollowerList.nextpage();
    ClipApp.FollowingList.nextpage();
  });

  App.vent.bind("app.clipapp:showfollowing", function(uid){
    ClipApp.FollowingList.showUserFollowing(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollowing", uid);
  });

  App.vent.bind("app.clipapp.followerlist:refresh", function(){
    ClipApp.FollowerList.refresh();
  });

  App.vent.bind("app.clipapp:showfollower", function(uid){
    ClipApp.FollowerList.showUserFollower(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollower", uid);
  });

  //reclip 用户一个clip
  App.vent.bind("app.clipapp:reclip", function(clipid, model_id, rid, pub){
    var uid = App.util.getMyUid();
    // 将没有做完的操作当作callback传给login，登录成功后有callback则进行处理
    if(!uid)
      ClipApp.Login.show(function(){
	App.ClipApp.Reclip.show(clipid,model_id,rid,pub);
      });
    else ClipApp.Reclip.show(clipid,model_id,rid,pub);
  });

  //对 user's tag下的clip的reclip
  App.vent.bind("app.clipapp:reclip_tag", function(user,tag){
    var uid = App.util.getMyUid();
    if(!uid)
      ClipApp.Login.show(function(){
	App.ClipApp.ReclipTag.show(user, tag);
      });
    else ClipApp.ReclipTag.show(user,tag);
  });

  // 当前用户追某用户的tag uid一直与face的保持一致
  App.vent.bind("app.clipapp:follow", function(uid, tag){
    var me = App.util.getMyUid();
    if(!me){
      ClipApp.Login.show(function(){
	App.ClipApp.Bubb.followUserBubs(uid, tag);
      });
    }else{
      ClipApp.Bubb.followUserBubs(uid, tag);
    }
  });

  App.vent.bind("app.clipapp:unfollow", function(uid, tag){
    var me = App.util.getMyUid(); // 需要判断是因为可能出现token过期现象
    if(!me){
      ClipApp.Login.show(function(){
	App.ClipApp.Bubb.unfollowUserBubs(uid, tag);
      });
    }else{
      ClipApp.Bubb.unfollowUserBubs(uid, tag);
    }
  });

  App.vent.bind("app.clipapp:recommend", function(cid,model_id,pub){
    var uid = App.util.getMyUid();
    if(!uid){
      ClipApp.Login.show(function(){
	App.ClipApp.Recommend.show(cid,model_id,pub);
      });
    }else{
      ClipApp.Recommend.show(cid,model_id,pub);
    }
  });

  App.vent.bind("app.clipapp:comment", function(cid,model_id){
    var uid = App.util.getMyUid();
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

  App.vent.bind("app.clipapp.clipdetail:close", function(){
    ClipApp.ClipDetail.close();
  });

  App.vent.bind("app.clipapp:clipmemo", function(cid){
    ClipApp.ClipMemo.show(cid);
  });

  App.vent.bind("app.clipapp:clipadd", function(){
    var uid = App.util.getMyUid(); // 当前登录用户
    if(!uid){
      ClipApp.Login.show(function(){
	App.ClipApp.ClipAdd.show();
      });
    }else{
      // 不用回到用户首页[在进行list同步的时候判断一下就可以了]
      ClipApp.ClipAdd.show();
    }
  });

  App.vent.bind("app.clipapp.clipadd:memo",function(data){
    ClipApp.ClipAdd.memo(data);
  });

  App.vent.bind("app.clipapp.taglist:mytag",function(tags){
    ClipApp.TagList.setbaseTag(tags);
  });

  App.vent.bind("app.tagsinput:taglist",function(str){
    ClipApp.TagList.show(str);
  });

  App.vent.bind("app.clipapp.taglist:close",function(){
    ClipApp.TagList.close();
  });

  App.vent.bind("app.clipapp.bubb:showUserTags", function(uid){
    ClipApp.Bubb.showUserTags(uid);
  });

  App.vent.bind("app.clipapp.bubb:refresh",function(uid,follow,new_tags){
    ClipApp.Bubb.refresh(uid, follow, new_tags);
  });

  App.vent.bind("app.clipapp.cliplist:add",function(addmodel){
    ClipApp.ClipList.add(addmodel);
  });

  App.vent.bind("app.clipapp.cliplist:edit",function(content, model_id){
    ClipApp.ClipList.edit(content, model_id);
  });

  App.vent.bind("app.clipapp.cliplist:remove",function(model_id){
    ClipApp.ClipList.remove(model_id);
  });

  // 更新转载和评论次数
  App.vent.bind("app.clipapp.comment:success", function(args){
    ClipList.refresh(args);
  });

  App.vent.bind("app.clipapp.reclip:success", function(args){
    ClipList.refresh(args);
  });

  // 牵扯太多的路由所以在 bubb中使用history.navigate进行路由的设定
  App.vent.bind("app.clipapp.cliplist:route", function(uid, url, tag){
    ClipApp.ClipList.route(uid, url, tag);
  });

  App.vent.bind("app.clipapp:clipdelete", function(clipid){
    ClipApp.ClipDelete.show(clipid);
  });

  App.vent.bind("app.clipapp:query", function(word, tag){
    ClipApp.siteQuery(word, tag);
  });

  App.vent.bind("app.clipapp:userquery", function(uid, word, tag){
    ClipApp.userQuery(uid, word, tag);
  });

  App.vent.bind("app.clipapp:followset", function(follow){
    ClipApp.Face.followSet(follow);
  });

  App.vent.bind("app.clipapp.message:alert", function(key, value){
    App.vent.unbind("app.clipapp.message:sure");
    ClipApp.Message.alert(key, value);
  });

  App.vent.bind("app.clipapp.message:confirm", function(key, value){
    App.vent.unbind("app.clipapp.message:sure");
    ClipApp.Message.confirm(key, value);
  });

  App.vent.bind("app.clipapp.message:success", function(key, value){
    ClipApp.Message.success(key, value);
  });

  App.vent.bind("app.clipapp.versions:change",function(lang){
    App.versions.setLanguage(lang);
  });
  App.vent.bind("app.clipapp.ga:track_homepage",function(){
    var now =new Date().getTime();
    var page_load_time=now-window.performance.timing.fetchStart;
    var hourInMillis = 1000 * 60 * 60;
    if(0 < page_load_time && page_load_time < hourInMillis){ // avoid sending bad data
      _gaq.push(['_trackTiming', 'Home_page',"Load Home_page",page_load_time]);
    }
    _gaq.push(['_setSiteSpeedSampleRate', 100]);//采样比例，访问量过大应减小
    _gaq.push(['_trackPageview', '/']);
    _gaq.push(['_trackPageLoadTime']);
  });

  return ClipApp;
})(App, Backbone, jQuery);
