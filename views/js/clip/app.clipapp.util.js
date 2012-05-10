App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;
  util.getMyUid = function(){
    var cookie = document.cookie ? document.cookie.split("=")[1]:null;
    return cookie ? cookie.split(":")[0] : null;
  };

  // main_tag 部分从这取,
  util.getBubbs = function(){
    return ["好看", "好听", "好吃", "好玩", "精辟", "酷"];
  };

  util.getObjTags = function(){
    return ["音乐", "小说", "电影", "港台", "cool", "funny", "牛叉", "技术", "好用"];
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
    if(clss == "big") top = 100;
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
    var pattern = /^[0-9]:[a-z0-9]{32}/;
   // return "file:///D:/Images/图片/孙燕姿/p_large_8ASw_431000028afc2d11[1].jpg";
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

  util.contentToHtml = function(content){
   return App.ClipApp.Filter.ubbToHtml(content);
  };

  util.getPreview = function(content, length){
    var data = {};
    var reg = /\[img\].*?\[\/img\]/;
    var img = content.match(reg);
    if(img) data.image = img[0].replace('[img]',"").replace('[/img]',"");
    var text = _getContentText(content);
    data.text = _trim(text, length);
    return data;
  };

  function _getContentText (content){
    // 取得ubb中常用的标签之后留下的内容
    // 去掉所有的ubb标签中的内容，只留下文本内容
    var reg1 = /\[img\].*\[\/img\]?/;
    var reg = /\[\/?[^\]].*?\]/gi;  //\[\/?[^].*?\]/gi;
    // 去除img标签
    while(reg1.test(content)) content = content.replace(reg1,"");
    // 去除其他标签
    while(reg.test(content)) content = content.replace(reg,"");
    return App.ClipApp.Filter.ubbToHtml(content);
  };

  function _trim(content, length){
    var r = undefined;
    if (!content) return r;
    if (_.isString(content) && content.length){
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
    if (!sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      return false;
    }else{
      return true;
    }
  };

  util.generatePastTime = function(time){
    if(!time) return null;
    var ftime = new Date(time);
    var ttime = new Date();
    return subTimes(ftime,ttime);
  };

  subTimes = function(Ftime,Ttime){
    var dtime = (Ttime.getTime() - Ftime.getTime())/1000;
    var returnVal = "";
    if(dtime<60){//second
      returnVal = dtime + "秒前";
    }else if(dtime>=60 && dtime<60*60){//minute
      returnVal = Math.round(dtime/60) + "分钟前";
    }else if(dtime>=60*60 && dtime<60*60*24){//hour
      returnVal = Math.round(dtime/(60*60)) + "小时前";
    }else if(dtime>=60*60*24 && dtime<60*60*24*7){//day
      returnVal = Math.round(dtime/(60*60*24)) + "天";
    }else if(dtime>=60*60*24*7 && dtime<60*60*24*30){//week
      returnVal = Math.round(dtime/(60*60*24*7)) + "周";
    }else if(dtime>=60*60*24*30 && dtime<60*60*24*30*6){//month
      returnVal = Math.round(dtime/(60*60*24*7*4)) + "月";
    }else if(dtime>=60*60*24*30*6 && dtime<60*60*24*30*6*12){//half year
      returnVal = "半年";
    }else if(dtime>=60*60*24*30*6*12){//year
      returnVal = Math.round(dtime/(60*60*24*30*6*12)) + "年";
    }
    return returnVal;
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
  //解决关于本地预览图片的浏览器兼容问题
  util.get_img_src = function(sender){
    //chrome
    if (window.webkitURL && window.webkitURL.createObjectURL) {
      return window.webkitURL.createObjectURL(sender.files[0]);
    }else if(window.URL && window.URL.createObjectURL) {
      //firefox
      return window.URL.createObjectURL(sender.files[0]);
    }else if (window.navigator.userAgent.indexOf("MSIE")>=1){
      sender.select();
      sender.blur();
      return document.selection.createRange().text;
    }else{
      alert("the problem of compatible..........");
      return window.URL.createObjectURL(source);
    }
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
	}
      }
    });
  };

  var MESSAGE = {
    register_success : "您的注册已完成。我们建议您添加常用的邮件地址，以便能通过发邮件来进行收藏。",
    pre_invite   : "您已通过发往",
    post_invite  : "邮件地址的邀请注册成功。我们建议您立即修改密码并设置自己的用户名。",
    pre_addemail : "您已添加",
    post_addemail: "邮件地址。为防止垃圾邮件给您带来困扰，我们需要您进行确认。请查收邮件，点击其中的激活链接。",
    pre_active   : "您已激活",
    post_active  : "邮件地址。您现在可以在登录时使用此邮件地址，并接收来自此邮件地址的收藏。",
    pre_delemail : "您真的要删除",
    post_delemail: "邮件地址吗？删除后，您将无法使用此邮件地址登录，也无法接收来自此邮件地址的收藏。",

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
      not_match: "密码输入不一致"
    },
    conpass:{
      is_null: "密码尚未填写"
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
      has_recliped: "您已经拥有这条载录了",
      not_exist: "clip不存在"
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
	if(ERROR[key]){
	  error[key] = ERROR[key][errorCode[key]];
	}
      }
      return _.isEmpty(error) ? errorCode : error;
    }else{
      return errorCode;
    }
 };

  return util;
})();