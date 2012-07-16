App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;

  util.name_pattern = /^[a-zA-Z0-9][a-zA-Z0-9\.]{3,18}[a-zA-Z0-9]$/;
  util.email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
  util.getCookie = function(name){
    var start = document.cookie.indexOf( name+"=" );
    var len = start + name.length + 1;
    if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
      return null;
    }
    if ( start == -1 )
      return null;
    var end = document.cookie.indexOf( ';', len );
    if ( end == -1 )
      end = document.cookie.length;
    return unescape(document.cookie.substring( len, end ));
  };

  util.getMyUid = function(){
    var uid = null;
    var token = util.getCookie("token");
    if (token) uid = token.split(":")[0];
    return uid;
  };

  util.getMyFace = function(){
    return {
      name: App.ClipApp.Me.me.get("name"),
      face: App.ClipApp.Me.me.get("face"),
      lang: App.ClipApp.Me.me.get("lang")
    };
  };

  // main_tag 部分从这取,
  util.getBubbs = function(){
    var lang = App.versions.getLanguage(); // 用户语言设置
    if(lang == "en"){
      return ["funny","musical","pretty","tasty","cool","useful"];
    }{
      return ["好玩", "好听", "好看", "好吃", "酷", "好用"];
    }
  };

  util.getObjTags = function(){
    var lang = App.versions.getLanguage(); // 用户语言设置
    if(lang == "en"){
      return ["music","novel","film","technology","handy"];
    }else{
      return ["音乐", "小说", "电影", "港台","牛叉", "技术", "好用"];
    }
  };

  // 判断当前的用户和传过来的参数是否是同一人
  util.self = function(uid){
    return util.getMyUid() == uid || App.ClipApp.Me.me.get("name") == uid;
  };

  util.getImg_upUrl = function(){
    return P + '/user/'+util.getMyUid()+'/image';
  };

  util.getFace_upUrl = function(){
    return P+"/user/" + util.getMyUid() + "/upload_face";
  };

  util.getPopTop = function(clss){
    var top = 0;
    var scroll = document.documentElement.scrollTop + document.body.scrollTop;
    if(clss == "big") top = 30;
    if(clss == "small") top = 150;
    return scroll + top + "px";
  };
  util.unique_url = function(url){
    var now = new Date();
    return url + "?now=" + now.getTime();
  };
  //clip列表时取得img 的 url 为裁剪后的图片
  util.url = function(image_url){
    var pattern = /user\/\d\/image\/[a-z0-9]{32}/;
    var pattern1 = /http:\/\//;
    if(image_url && pattern.test(image_url)&&!pattern1.test(image_url)){
      return image_url + "/270";
    }else return image_url;
  };

  util.face_url = function(imageid,size){
    var pattern = /^[0-9]{1,}:[a-z0-9]{32}_face/;
    if(imageid == ""){
      return "img/f.jpg";
    }else if(imageid&& pattern.test(imageid)){
      var ids = imageid.split(":");
      if(size){
	return P + "/user/" + ids[0]+ "/image/" + ids[1] + "/" + size;
      }else{
	return P + "/user/" + ids[0]+ "/image/" + ids[1];
      }
    }else return imageid;
  };

  // 将content内容转换为，可用于显示的html
  util.contentToHtml = function(content){
    return App.ClipApp.Convert.ubbToHtml(content);
  };

  util.cleanComment = function(comment){ // 对comment的内容进行html过滤，防止脚本注入
    comment = App.ClipApp.Convert.cleanHtml(comment);
    comment = comment.replace(/<\/?div[^>]*>/ig, "");
    comment = comment.replace(/<\/?div[^>]*>/ig, "");
    return comment;
  };

  util.commentToHtml = function(comment){
    comment = comment.replace(/\n{2,}/ig, "<\/p><p>");
    comment = comment.replace(/\n/ig, "<\/br>");
    return comment;
  };

  util.getPreview = function(content, length){
    var data = {};
    var reg = /\[img\].*?\[\/img\]/;
    var img = content.match(reg);
    if(img) data.image = img[0].replace('[img]',"").replace('[/img]',"");
    var text = getContentText(content);
    data.text = trim(text, length);
    return data;
  };

  function getContentText (content){
    // 取得ubb中常用的标签之后留下的内容
    // 去掉所有的ubb标签中的内容，只留下文本内容
    var reg1 = /\[img\].*\[\/img\]?/;
    var reg = /\[\/?[^\]].*?\]/gi;  //\[\/?[^].*?\]/gi;
    // 去除img标签
    while(reg1.test(content)) content = content.replace(reg1,"");
    // 去除其他标签
    while(reg.test(content)) content = content.replace(reg,"");
    return App.ClipApp.Convert.ubbToHtml(content, true);
  };

  function trim(content, length){
    var r = undefined;
    if (!content) return r;
    if (_.isString(content) && content.length){
      // 先对content内容进行空格去除，在做截断
      content = content.replace(/\s/g," ");
      if(content.length < length){
	r = content;
      } else {
	r = content.substring(0, length) + "...";
      }
    }
    return r;
  };

  util.isImage = function(id){
    var sender = document.getElementById(id);
    if (!sender.value.match(/.jpeg|.jpg|.gif|.png|.bmp/i)){
      return false;
    }else{
      return true;
    }
  };

  util.generatePastTime = function(time){
    if(!time) return null;//TODO ie8 problem
    //time=$.i18n.parseDate(time,"yyyy'-'MM'-'dd'T'HH':'mm':'ss'Z'");
    var ftime = new Date(time);
    var ttime = new Date();
    return subTimes(ftime,ttime);
  };

  subTimes = function(Ftime,Ttime){
    var dtime = (Ttime.getTime() - Ftime.getTime())/1000;
    var returnVal = "";
    if(dtime<5){
       returnVal = _i18n('util.time.moment');
    }else if(dtime<60){//second
      returnVal = Math.round(dtime)+ _i18n('util.time.second');
    }else if(dtime>=60 && dtime<60*60){//minute
      returnVal = Math.round(dtime/60) + _i18n('util.time.minute');
    }else if(dtime>=60*60 && dtime<60*60*24){//hour
      returnVal = Math.round(dtime/(60*60)) + _i18n('util.time.hour');
    }else if(dtime>=60*60*24 && dtime<60*60*24*7){//day
      returnVal = Math.round(dtime/(60*60*24)) + _i18n('util.time.day');
    }else if(dtime>=60*60*24*7 && dtime<60*60*24*30){//week
      returnVal = Math.round(dtime/(60*60*24*7)) + _i18n('util.time.week');
    }else if(dtime>=60*60*24*30 && dtime<60*60*24*30*6){//month
      returnVal = Math.round(dtime/(60*60*24*7*4)) + _i18n('util.time.month');
    }else if(dtime>=60*60*24*30*6 && dtime<60*60*24*30*6*12){//half year
      returnVal = _18n('util.time.half_year');
    }else if(dtime>=60*60*24*30*6*12){//year
      returnVal = Math.round(dtime/(60*60*24*30*6*12)) + _i18n('util.time.year');
    }
    return returnVal;
  };
  util.clip_add = function(){
    App.vent.trigger("app.clipapp:clipadd");
    return ;
  };
  App.vent.bind("app.clipapp:showpage",function(length){
/*    var paddingTop = 0 + "px";
    $(window).unbind("scroll");
    util.remove_fixed(paddingTop);
    $(window).scroll(function() {
      var st = $(window).scrollTop();
      //var mt = $(".clearfix").offset().top + $(".user_info").height()-$(".user_detail").height();
      var shifting =$(".user_head").height() ? $(".user_head").height()+15 :0;
      var mt = $(".clearfix").offset().top + shifting;
      //mt = $(".user_detail").height() ? $(".user_detail").offset().top:$(".clearfix").offset().top;
      //if($("#list").height()<=$(".left").height())return;
      if(st>0){
	$(".return_top").show();
      }else{
	$(".return_top").hide();
      }
      if(st > mt ){
	//console.info("锁定气泡组件",st,mt);
	util.fixed(paddingTop);
      } else {
	//console.info("解除锁定气泡组件",st,mt);
	util.remove_fixed(paddingTop);
      }
      // loader while scroll down to the page end
      var wh = window.innerHeight;
      var lt = $(".loader").offset().top;
      if(st + wh > lt){
	App.vent.trigger("app.clipapp:nextpage");
      }
    });
*/
  });
  util.img_load = function(img){
    img.onload = null;
    if(img.readyState=="complete"||img.readyState=="loaded"||img.complete){
      setTimeout(function(){
	$(".fake_"+img.id).hide();
	$("."+img.id).show();
      },0);
    }
  };

  util.img_error = function(img){
    img.src='img/img_error.jpg';
    $(".fake_" + img.id).hide();
    $("." + img.id).show();
    setTimeout(function(){
      $("#list").masonry("reload");
    },50);
  };

  util.get_imgid = function(frameid,callback){
    $("#" + frameid).unbind("load");
    $("#" + frameid).load(function(){ // 加载图片
      if(window.navigator.userAgent.indexOf("MSIE")>=1){
	var returnVal = this.contentWindow.document.documentElement.innerText;
      }else{
	var returnVal = this.contentDocument.documentElement.textContent;
      }
      if(returnVal != null && returnVal != ""){
	var returnObj = eval(returnVal);
	if(returnObj[0] == 0){
	  var imgids = returnObj[1][0];
	  //for(var i=0;i<imgids.length;i++){ // 上传无需for循环
	  var uid = imgids.split(":")[0];
	  var imgid = imgids.split(":")[1];
	  var url = P+"/user/"+ uid +"/image/" +imgid;
	  //App.ClipApp.Editor.insertImage("editor", {url: url});
	  //}
	  callback(url);
	}else{//上传图片失败
	  App.vent.trigger("app.clipapp.message:confirm","imageUp_fail");
	  callback(null);
	}
      }
    });
  };

  util.clearFileInput = function(file){
    var form=document.createElement('form');
    document.body.appendChild(form);
    //记住file在旧表单中的的位置
    var pos=file.nextSibling;
    form.appendChild(file);
    form.reset();
    pos.parentNode.insertBefore(file,pos);
    document.body.removeChild(form);
  };

  var MESSAGE = {
    recomm : "您的clip已经转发成功",

    register_success : "您的注册已完成。我们建议您添加常用的邮件地址，以便能通过发邮件来进行收藏。",
    pre_invite   : "您已通过发往",
    post_invite  : "邮件地址的邀请注册成功。我们建议您立即修改密码并设置自己的用户名。",
    pre_addemail : "您已添加",
    post_addemail: "邮件地址。为防止垃圾邮件给您带来困扰，我们需要您进行确认。请查收邮件，点击其中的激活链接。",
    pre_active   : "您已激活",
    post_active  : "邮件地址。您现在可以在登录时使用此邮件地址，并接收来自此邮件地址的收藏。",
    pre_delemail : "您真的要删除",
    post_delemail: "邮件地址吗？删除后，您将无法使用此邮件地址登录，也无法接收来自此邮件地址的收藏。",
    pre_deloauth : "您真的要删除",
    post_deloauth: "微博账号吗？删除后，您将无法使用此微博账号进行登录，也无法接收来自此微博账号的收藏。",
    pre_deloauth_twitter : "您真的要删除",
    post_deloauth_twitter: " twitter账号吗？删除后，您将无法使用此twitter账号进行登录，也无法接收来自此twitter账号的收藏。",
    oauth_fail   :   "认证失败，请重新认证",
    del_comment  : "您真的要删除这条评论吗？（此操作无法恢复）",

    reclip_null  : "该标签下暂时还没有数据",
    imageUp_fail : "您上传的文件不是图片文件",
    faceUp_success  : "您的头像已更新",
    passwd_success  : "您的密码已修改",
    setRule_success : "您已成功更新邮箱规则",
    rename_success  : "您的用户名已经修改",
    reclip_tag_success : "恭喜您，转载成功！",
    reclip_tag_fail    : "您已经转拥有这些载录了！",
    pre_reclip_tag   : "您实际转载了" ,
    post_reclip_tag  : "条载录，其余摘录已经拥有了"
  };

  util.getMessage = function(key){
    // console.log(key);
    // console.log(MESSAGE[key]);
    return MESSAGE[key] ? MESSAGE[key] : key;
  };

  var ERROR = {
    login_success : "您已成功登录",
    auth_success : "您的密码已更改",
    collect_success : "您已成功收藏",
    comment_success : "您的评论已发表",
    recomment_success : "您的转发已完成",

    user:{
      not_exist: "用户不存在"
    },
    auth: {
      not_exist: "用户不存在",
      not_match: "您的登录信息有误，请退出再重新登录",
      not_login: "您尚未登录"
    },
    recomm_name:{
      is_null: "请添加用户",
      not_exist: "您添加的用户不存在"
    },
    recomm_text:{
      is_null:"请您先设置推荐备注"
    },
    name:{
      is_null: "用户名尚未填写",
      invalidate: "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
      exist:"此用户名已经存在",
      not_exist: "用户名不存在"
    },
    newpass:{
      is_null: "密码尚未填写"
    },
    pass:{
      is_null: "密码尚未填写",
      not_match: "密码输入不一致"
    },
    conpass:{
      is_null:"密码尚未填写"
    },
    confirm:{
      password_diff: "密码输入不一致"
    },
    email:{
      is_Exist: "邮件地址已经存在",
      you_exist: "您已经添加过该邮件地址",
      other_exist:"您所添加的邮件地址已经在系统中了",
      invalidate: "邮件地址格式有误",
      is_null: "邮件地址尚未填写",
      no_uname: "在添加邮件之前请先设置用户名"
    },
    to:{
      invalidate: "收件人中含有不合法的邮件地址"
    },
    cc:{
      invalidate: "抄送人中含有不合法的邮件地址"
    },
    rule:{
      is_null: "您还没有添加邮件规则"
    },
    accept:{
      fail:"因为间隔时间太长，此注册链接已经失效。您可直接注册，再到设置界面添加您的邮箱地址。"
    },
    active:{
      fail: "因为间隔时间太长，此激活链接已经失效。您可在设置界面重新添加。"
    },
    clip:{
      has_this_clip: "您已经有该条摘录了",
      has_recliped: "您已经转载过该条载录了",
      not_exist: "摘录不存在",
      deleted: "此条摘录已经被删除！",
      no_public: "作者没有公开此条摘录！"
    },
    content:{
      is_null: "摘录不存在",
      not_array: "摘录必须是数组",
      is_empty: "摘录不能为空"
    },
    follow:{
      all: "您已经追了该用户的全部标签"
    },
    error:{
      "link 已作废": "此链接已过期",
      "link doesnt exist": "此链接无效",
      "link invalidate": "此链接格式有误"
    }
  };

  util.getErrorMessage = function(errorCode){
    if(typeof(errorCode)=="string"){
      var error = ERROR[errorCode];
      return error ? error : errorCode;
    } else if(typeof(errorCode)=="object"){
      var error = {};
      for (key in errorCode){
	// console.log("errorCode["+key+"] :: %j " + errorCode[key]);
	error[key] = ERROR[key] ? ERROR[key][errorCode[key]] : errorCode[key];;
      }
      return _.isEmpty(error) ? errorCode : error;
    }else{
      return errorCode;
    }
 };

  return util;
})();