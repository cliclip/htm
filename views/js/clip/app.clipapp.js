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
    return App.ClipApp.Me.getFace();
  };

  ClipApp.getMyUid = function(){
    //return App.ClipApp.Me.getUid();
    return App.util.getMyUid();
  };

  ClipApp.getFaceUid = function(){
    return App.ClipApp.Face.getUserId();
  };

  ClipApp.isSelf = function(uid){
    return uid == App.ClipApp.getMyUid();
  };

  ClipApp.img_upUrl = function(){
    return App.util.getImg_upUrl(ClipApp.getMyUid());
  };
  //头像上传与content中图片上传共用相同url，此url废弃
  /*
  ClipApp.face_upUrl = function(){
    return App.util.getFace_upUrl(ClipApp.getMyUid());
  };
   */
  ClipApp.encodeURI = function(url){ //公共调用
    var base = url;
    var arr = base ? base.split("/") : [];
    _.map(arr, function(a){ return encodeURIComponent(a);});
    url = App.util.unique_url(arr.join("/")); // 加上时间戳
    return url;
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
    item = item || 0 ;
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags();
    ClipApp.ClipList.showSiteClips();
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

  ClipApp.consumeLink = function(link){ // 接受用户的邮件添加激活或者是合并激活
    ClipApp.Link.consume(link);
  };

  ClipApp.findpasswd = function(){
    ClipApp.FindPass.show();
  };

  ClipApp.oauth = function(key){
    ClipApp.Oauth.process(key);
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
    ClipApp.Notify.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:usershow",uid, tag);
  };

  ClipApp.myQuery = function(word, tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word, uid);
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
  ClipApp.clipDetail = function(uid, clipid, link){
    ClipApp.userShow(uid);
    App.ClipApp.ClipDetail.show(uid+":"+clipid, null, {}, link);
    //App.Routing.ClipRouting.router.trigger("app.clipapp.routing:clipdetail", uid, clipid);
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

  ClipApp.showMemo = function(clip){
    ClipApp.ClipMemo.show(clip);
  };

  ClipApp.showInnerMemo = function(region, clip, edit){
    ClipApp.ClipMemo.showInner(region, clip, edit);
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
  ClipApp.showClipAdd = function(clipper,clipper_content){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	App.ClipApp.ClipAdd.show(clipper,clipper_content);
      });
    }else{
      ClipApp.ClipAdd.show(clipper,clipper_content);
    }
  };

  //reclip 用户一个clip
  ClipApp.showReclip = function(clipid, model_id, rid, pub){
    // 将没有做完的操作当作callback传给login，登录成功后有callback则进行处理
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.Reclip.show(clipid,model_id,rid,pub);
      });
    }else{
      ClipApp.Reclip.show(clipid,model_id,rid,pub);
    }
  };

  ClipApp.showShareDialog = function(clipid, pub, preview){
    ClipApp.Share.show(clipid, pub, preview);
  };
  ClipApp.showSetName = function(){
    ClipApp.SetName.show();
  };
  /*
  ClipApp.showReclipTag = function(user,tag){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.ReclipTag.show(user, tag);
      });
    }else{
      ClipApp.ReclipTag.show(user,tag);
    }
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
      ClipApp.Comment.show(cid, model_id);
    }
  };

  ClipApp.showUserEdit = function(){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.UserEdit.show();
	ClipApp.RuleEdit.show();
	ClipApp.WeiboEdit.show();
	ClipApp.TwitterEdit.show();
	ClipApp.DropboxEdit.show();
      });
    }else{
      ClipApp.UserEdit.show();
      ClipApp.RuleEdit.show();
      ClipApp.WeiboEdit.show();
      ClipApp.TwitterEdit.show();
      ClipApp.DropboxEdit.show();
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

  ClipApp.showWaiting = function(key, value){
    ClipApp.Message.waiting(key, value);
  };
  ClipApp.closeWaiting = function(){
    ClipApp.Message.close();
  }
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
    App.vent.unbind("app.clipapp.message:sure");
    if(typeof(fun) == "function"){
      App.vent.bind("app.clipapp.message:sure", fun);
    }
  };

  // dialog end

  App.vent.bind("all", function(eventName){
    console.log(eventName);
  });

  //对 user's tag下的clip的reclip
  App.bind("initialize:after", function(){
    $("#return_top").click(function(){
      if($('html').hasClass("lt-ie8"))
	$(document.body).scrollTop(0);
    });
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

    tmp = $('html').hasClass('lt-ie8') ? $(document.body) : tmp = $(window);
    tmp.scroll(function() {
      if($("#editor").length > 0){
	return;// console.log("编辑器的滚动事件，nextpage不用响应");
      }else{
	remove_fixed(paddingTop);
	var st = tmp.scrollTop();
	var shifting =$(".user_head").height() ? $(".user_head").height()+ 15 : 0;
	var mt = $(".clearfix").offset().top + shifting;
	if(st>0){
	  $(".return_top").show();
	  $("#add_right").show();
	}else{
	  $(".return_top").hide();
	  $("#add_right").hide();
	}
	if(st > mt ){
	  fixed(paddingTop); // console.log("锁定气泡组件",st,mt);
	} else {
	  remove_fixed(paddingTop);//console.log("解除锁定气泡组件",st,mt);
	}
	var wh = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight;
	var lt = $(".loader").offset().top;
	var obj = $("#list .clip");
	if(obj && obj.last()&& obj.last()[0]){
	  var last_top = obj.last()[0].offsetTop;
	}
	// console.log(st + "  ",wh + "  ",lt + "  " ,time_gap,last_top);
	if((st + wh - 300 > last_top || st + wh > lt)&& time_gap==true ){
	  time_gap = false;
	  setTimeout(function(){
	    var st1 = tmp.scrollTop();
	    // 再次判断是为了兼容ie7，
	    // ie7详情窗口关闭时st会瞬间取得一个过大的值导致请求下一页的代码被执行
	    if(st1 + wh - 300 > last_top || st1 + wh > lt ){
	      App.vent.trigger("app.clipapp:nextpage");
	    }
	  },50);
	  setTimeout(function(){time_gap = true;},500);
	}
      }
    });
  });

  return ClipApp;
})(App, Backbone, jQuery);