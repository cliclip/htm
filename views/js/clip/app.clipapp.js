// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};

  // util methods
  ClipApp.isLoggedIn = function(){
    return ClipApp.getMyUid() != null ? true : false;
  };

  ClipApp.isOwner = function(uid1, uid2){
    return uid1 == uid2;
  };

  ClipApp.getMyFace = function(){
    return ClipApp.Me.getFace();
  };

  ClipApp.getMyUid = function(){
    return ClipApp.Me.getUid();
  };

  ClipApp.getFaceUid = function(){
    return ClipApp.Face.getUserId();
  };

  ClipApp.isSelf = function(uid){
    return uid == ClipApp.getMyUid();
  };

  ClipApp.img_upUrl = function(){
    return App.util.getImg_upUrl(ClipApp.getMyUid());
  };

  ClipApp.face_upUrl = function(){
    return App.util.getFace_upUrl(ClipApp.getMyUid());
  };

  // main_tag 部分从这取
  ClipApp.getDefaultBubbs = function(){
    var lang = App.versions.getLanguage(); // 用户语言设置
    if(lang == "en"){
      return ["pretty","funny","musical","cool","tasty","wish"];
    }{
      return ["好看", "有趣","好听", "真赞", "好吃",  "想要"];
    }
  };

  // routing methods

  ClipApp.siteShow = function(tag){
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags(tag);
    ClipApp.ClipList.showSiteClips(tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:siteshow",tag);
  };

  ClipApp.siteQuery = function(word, tag){
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteBubs(tag);
    ClipApp.ClipList.showSiteQuery(word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word);
  };

  ClipApp.help = function(item){
    ClipApp.Help.show(item);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:help",item);
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
    if(!uid) uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowingList.showUserFollowing(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollowing", uid);
  };

  // 追user的人的列表 无需再请求Face 和 Bubb
  ClipApp.userFollower = function(uid, tag){
    if(!uid) uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowerList.showUserFollower(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollower", uid);
  };

  ClipApp.myShow = function(tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:usershow",uid, tag);
  };

  ClipApp.myQuery = function(word, tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word);
  };

  // interest和recommend 只需要显示 主观tag就可以了
  ClipApp.myInterest = function(tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.cleanTags();
    ClipApp.ClipList.showUserInterest(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:interest", tag);
  };

  // 为detail页面添加网址
  ClipApp.clipDetail = function(uid, clipid){
    ClipApp.userShow(uid);
    App.ClipApp.ClipDetail.show(uid+":"+clipid, null, {});
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:clipdetail", uid, clipid);
  };

  /*ClipApp.myRecommend = function(tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.cleanTags();
    ClipApp.ClipList.showUserRecommend(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:recommend",tag);
  };*/

  // routing end

  // dialog methods

  ClipApp.showLogin = function(callback){
    ClipApp.Login.show(callback);
  };

  ClipApp.showRegister = function(){
    ClipApp.Register.show();
  };

  ClipApp.showDetail = function(clipid,model_id,recommend){
    //model_id为model的id，用来当detail的model改变时，改变list的model的数据
    ClipApp.ClipDetail.show(clipid,model_id,recommend);
  };

  ClipApp.showMemo = function(args){
    ClipApp.ClipMemo.show(args);
  };

  // 对于那些直接点击修改按钮的部分，有些多余
  ClipApp.showEditClip = function(clipId){
    if(!ClipApp.isLoggedIn()){
      ClipApp.showLogin(function(){
	if (ClipApp.isOwner(clipId.split(":")[0], ClipApp.getMyUid())) {
	  ClipApp.ClipEdit.show(clipId);
	}
      });
    }else{
      if (ClipApp.isOwner(clipId.split(":")[0], ClipApp.getMyUid())) {
	ClipApp.ClipEdit.show(clipId);
      }
    }
  };

  ClipApp.showClipDelete = function(clipid){
    ClipApp.ClipDelete.show(clipid);
  };

  // 不用回到用户首页[在进行list同步的时候判断一下就可以了]
  ClipApp.showClipAdd = function(clipper){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.ClipAdd.show(clipper);
      });
    }else{
      ClipApp.ClipAdd.show(clipper);
    }
  };

  //reclip 用户一个clip
  ClipApp.showReclip = function(clipid, model_id, rid, pub){
    // 将没有做完的操作当作callback传给login，登录成功后有callback则进行处理
    if(!ClipApp.isLoggedIn())
      ClipApp.Login.show(function(){
	ClipApp.Reclip.show(clipid,model_id,rid,pub);
      });
    else ClipApp.Reclip.show(clipid,model_id,rid,pub);
  };

  /*
  ClipApp.showReclipTag = function(user,tag){
    if(!ClipApp.isLoggedIn())
      ClipApp.Login.show(function(){
	ClipApp.ReclipTag.show(user, tag);
      });
    else ClipApp.ReclipTag.show(user,tag);
  };

  ClipApp.showRecommend =  function(cid,model_id,pub){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.Recommend.show(cid,model_id,pub);
      });
    }else{
      ClipApp.Recommend.show(cid,model_id,pub);
    }
  };*/

  ClipApp.showComment = function(cid, model_id){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.Comment.show(cid, model_id);
      });
    }else{
      ClipApp.Comment.show(cid,model_id);
    }
  };

  ClipApp.showUserEdit = function(){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.UserEdit.show();
	ClipApp.RuleEdit.show();
	ClipApp.WeiboEdit.show();
	ClipApp.TwitterEdit.show();
      });
    }else{
      ClipApp.UserEdit.show();
      ClipApp.RuleEdit.show();
      ClipApp.WeiboEdit.show();
      ClipApp.TwitterEdit.show();
    }
  };

  ClipApp.showUserBind = function(oauth, fun, remember){
    ClipApp.UserBind.show(oauth, fun, remember);
  };

  ClipApp.showEmailAdd = function(uid){
    ClipApp.EmailAdd.show(uid);
  };

  ClipApp.showFollowing = function(uid){
    ClipApp.FollowingList.showUserFollowing(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollowing", uid);
  };

  ClipApp.showFollower = function(uid){
    ClipApp.FollowerList.showUserFollower(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollower", uid);
  };

  ClipApp.showSuccess = function(key, value){
    ClipApp.Message.success(key, value);
  };

  ClipApp.showAlert = function(key, value, fun, cancel_fun){
    ClipApp.Message.alert(key, value);
    if(typeof(fun) == "function"){
      App.vent.unbind("app.clipapp.message:sure");
      App.vent.bind("app.clipapp.message:sure", fun);
    }
    if(typeof(cancel_fun) == "function"){
      App.vent.unbind("app.clipapp.message:cancel");
      App.vent.bind("app.clipapp.message:cancel", cancel_fun);
    }
  };

  ClipApp.showConfirm = function(key, value, fun){
    ClipApp.Message.confirm(key, value);
    if(typeof(fun) == "function"){
      App.vent.unbind("app.clipapp.message:sure");
      App.vent.bind("app.clipapp.message:sure", fun);
    }
  };

  // dialog end

  App.vent.bind("all", function(eventName){
    console.log(eventName);
  });

  //对 user's tag下的clip的reclip
  App.bind("initialize:after", function(){
    var fixed = function(paddingTop){
      $(".user_detail").addClass("fixed").css({"margin-top": "0px", "top": paddingTop});
      var y = $(".user_detail").height()+5;
      $("#bubb").addClass("fixed").css({"margin-top":y+"px", "top": paddingTop});
    };

    var remove_fixed = function(paddingTop){
      $(".user_detail").removeClass("fixed").css("margin-top", paddingTop);
      $("#bubb").removeClass("fixed").css("margin-top", 5+"px");
    };

    var time_gap = true, tmp;
    var paddingTop = 0 + "px";
    remove_fixed(paddingTop);

    $("#add_right").on("click", function(){App.ClipApp.showClipAdd();});
    if($('html').hasClass('lt-ie8')){ // 如果是ie7
      tmp = $(document.body);
    }else{
      tmp = $(window);
    }
    tmp.scroll(function() {
      if($("#editor").length > 0){
      // console.log("编辑器的滚动事件，nextpage不用响应");
	return;
      }else{
	remove_fixed(paddingTop);
	var st = $(window).scrollTop();
	var shifting =$(".user_head").height() ? $(".user_head").height()+ 15 : 0;
	var mt = $(".clearfix").offset().top + shifting;
	//console.info(shifting+"shifting");
	//var mt = $(".clearfix").offset().top + $(".user_info").height()-$(".user_detail").height();
	//var gap = document.getElementById("user_info").style.paddingTop;
	//console.info(gap);
	//mt = $(".user_detail").height() ? $(".user_detail").offset().top:$(".clearfix").offset().top;
	if(st>0){
	  $(".return_top").show();
	  $("#add_right").show();
	}else{
	  $(".return_top").hide();
	  $("#add_right").hide();
	}
	if(st > mt ){
	  //console.log("锁定气泡组件",st,mt);
	  fixed(paddingTop);
	} else {
	  //console.log("解除锁定气泡组件",st,mt);
	  remove_fixed(paddingTop);
	}
	var wh = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight;
	var lt = $(".loader").offset().top;
	var obj = $("#list .clip");
	if(obj && obj.last()&& obj.last()[0]){
	  var last_top = $("#list .clip").last()[0].offsetTop;
	}
	//console.log(st + "  ",wh + "  ",lt + "  " ,time_gap);
	if((st + wh - 300 > last_top || st + wh > lt)&& time_gap==true ){
	  time_gap = false;
	  App.vent.trigger("app.clipapp:nextpage");
	  setTimeout(function(){
	    time_gap = true;
	  },500);
	}
      }
    });
  });

  return ClipApp;
})(App, Backbone, jQuery);