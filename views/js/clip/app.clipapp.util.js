App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;
  util.getMyUid = function(){
    var cookie = document.cookie;
    return cookie ? cookie.split("=")[1].split(":")[0] : null;
  };

  // main_tag 部分从这取,
  util.getBubbs = function(){
    return ["好看", "好听", "好吃", "好玩", "精辟", "酷"];
  };

  // 判断当前的用户和传过来的参数是否是同一人
  util.self = function(uid){
    return util.getMyUid() == uid;
  };

  util.getImg_upUrl = function(){
    return P + '/user/'+util.getMyUid()+'/image';
  };

  util.getFace_upUrl = function(){
    return P+"/user/" + util.getMyUid() + "/upload_face";
  };

  //clip列表时取得img 的 url 为裁剪后的图片
  util.url = function(image_url){
    var pattern = /user\/\d\/image\/[a-z0-9]{32}/;
    if(image_url && pattern.test(image_url)){
      return image_url + "/300";
    }else return image_url;
  };

  util.face_url = function(imageid,size){
    var pattern = /^[0-9]:[a-z0-9]{32}/;
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

  /*
  // 拿到的html参数是字符串
  util.HtmlToContent = function(html){
    // var src = /<img\s* (src=\"?)([\w\-:\/\.]+)?\"?\s*.*\/?>/;
    // var src = /<[img|IMG].*?src=[\'|\"](.*?(?:[\.gif|\.jpg]))[\'|\"].*?[\/]?>/;
    var src = /<[img|IMG].*?src=[\'|\"]([\w\-:\/\.]+)?\"?\s*.*\/?>/;
    var rg = /<img[^>]+\/>|<img[^>]+>/;
    var link = /http:\/\//;
    var pre = /<pre.*?>/;
    var content = [];
    // 此处的html只包含简单的p标签和span标签 [可是还存在像;nbsp这类内容]
    // <b></b>也没有处理过滤
    while(html != ""){
      html = html.replace(/<[\s|\/]*p.*?>/ig,"");
      html = html.replace(/<[\s|\/]*span.*?>/ig,"");
      // html = html.replace(/<[\s|\/]*b.*?>/ig,"");
      if(pre.test(html)){
	// 取得pre标签结束的位置 [TODO]
	var i = html.indexOf('</pre>') == -1 ? html.indexOf('</ pre>') : html.indexOf('</pre>');
	var ss = html.replace(pre,"").substring(0,i);
	content.push({code: ss});
	html = html.replace(ss, "").replace(/<\/pre>/,"");
      }else if(rg.test(html)){
	var i = html.indexOf('<img');
	if(i == 0){
	  var match = html.match(src);
	  if(match.length >= 2){
	    if(link.test(match[1])){
	      content.push({image: match[1]});
	    }else{// 本地上传图片
	      var ids = match[1].split('/');
	      var imgid = ids[3]+":"+ids[5];
	      content.push({image:imgid});
	    }
	  }
	  html = html.replace(rg,"");
	}else{
	  var text = html.substring(0,i);
	  text = text.replace(/(^\s*)|(\s*$)/g,"");// .replace(/<br*?>/,"");
	  // 先保留<br />标签
	  content.push({text:text});
	  html = html.substring(i,html.length);
	}
      }else{
	var text = html.replace(/(^\s*)|(\s*$)/g,"").replace(/<br*?>/,"");
	if(text != "")
	  content.push({text:text});
	html = html.replace(/(^\s*)|(\s*$)/g,"").replace(/<br*?>/,"");
	html = html.replace(text, "");
      }
    }
    return content;
  };*/

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
    var reg = /\[\/?[^].*?\]/gi;
    // 去除img标签
    while(reg1.test(content)) content = content.replace(reg1,"");
    // 去除其他标签
    while(reg.test(content)) content = content.replace(reg,"");
    return content;
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

  App.vent.bind("app.clipapp.page:next",function(options){
    var lo = options;
    var init_flag = true;
    lo.collection_length = 0;
    lo.scroll_flag = lo.collection.length>=App.ClipApp.Url.page ? true :false;
    var paddingTop = 0 + "px";
    $(window).unbind("scroll");
    util.remove_fixed(paddingTop);
    $(window).scroll(function() {
      var st = $(window).scrollTop();
      var mt = $(".clearfix").offset().top + $(".user_head").height();
      //if($("#list").height()<=$(".left").height())return;
      if(st > mt ){
	util.fixed(paddingTop);
      } else {
	util.remove_fixed(paddingTop);
      }
      // loader while scroll down to the page end
      var wh = window.innerHeight;
      var lt = $(".loader").offset().top;
		       //st + wh > lt
      if(document.body.scrollHeight-st<500 && lo.scroll_flag){
	util.request_data(lo);
      }
    });
  });

  util.fixed = function(paddingTop){
    $(".user_detail").addClass("fixed").css({"margin-top": "0px", "top": paddingTop});
    $("#bubb").addClass("fixed").css({"margin-top": $(".user_detail").height()+"px", "top": paddingTop});
    $(".return_top").show();
  };

  util.remove_fixed = function(paddingTop){
    $(".user_detail").removeClass("fixed").css("margin-top", paddingTop);
    $("#bubb").removeClass("fixed").css("margin-top", paddingTop);
    $(".return_top").hide();
  };

  util.request_data = function(lo){
    lo.start += App.ClipApp.Url.page;
    lo.end += App.ClipApp.Url.page;
    lo.url = lo.base_url + "/" +lo.start + ".." + lo.end;
    lo.add = true;
    lo.collection.fetch(lo);
    lo.scroll_flag = false;
    setTimeout(function(){
      lo.scroll_flag = true;
      if(lo.collection.length-lo.collection_length<App.ClipApp.Url.page){
	lo.scroll_flag = false;
	//$(".loader").text("reach to the end.");
      }else{
	lo.collection_length =  lo.collection.length;
      }
    },200);
  };

  //解决关于本地预览图片的浏览器兼容问题
  util.get_img_src = function(source){
    //chrome
    if (window.webkitURL && window.webkitURL.createObjectURL) {
      return window.webkitURL.createObjectURL(source);
    }else if(window.URL.createObjectURL) {
      return window.URL.createObjectURL(source);
    }else{
      alert("the problem of compatible");
      return window.URL.createObjectURL(source);
    }
  };

  util.get_imgid = function(frameid,callback){
    $("#" + frameid).unbind("load");
    $("#" + frameid).load(function(){ // 加载图片
      var returnVal = this.contentDocument.documentElement.textContent;
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
    pre_addemail:"您所要添加的邮箱",
    post_addemail:"需要先进行激活才可以加入到系统中,激活链接以及发送到您的邮箱",

    register_success : "注册成功,您可以先进行邮件地址的添加,以方便数据的存储以及找回密码",
    pre_invite:"您已经使用",
    post_invite:"成功注册，现在请先进行用户名的添加以及密码的修改",

    "pre_active":"邮件地址",
    "post_active":"已经激活成功，您可以方便的使用该邮件地址进行数据的存储了",

    pre_delemail: "确认删除",
    post_delemail: "的绑定",
    del_comment: "确认要删除该条评论",


    reclip_null:"该tag下还没有数据",
    imageUp_fail:"您上传的图片格式无效",
    faceUp_success:"头像设置成功",
    passwd_success:"密码修改成功",
    rename_success:"恭喜您,命名成功"
  };

  util.getMessage = function(key){
    console.log(key);
    console.log(MESSAGE[key]);
    return MESSAGE[key] ? MESSAGE[key] : key;
  };


  var ERROR = {
    login_success : "登录成功",
    auth_success : "更改密码成功",
    collect_success : "收藏成功",
    comment_success : "评论成功",
    recomment_success : "转发成功",

    user:{
      not_exist: "用户不存在"
    },
    auth: {
      not_exist: "用户不存在",
      not_match: "句柄不合法",
      not_login: "用户为登录"
    },
    name:{
      is_null: "用户名为空",
      invalidate: "用户名不符合校验规则（只能是英文、数字和点的组合，长度是5-20）",
      exist: "用户名已存在",
      not_exist: "用户名不存在"
    },
    pass:{
      is_null: "密码为空",
      not_match: "密码不匹配"
    },
    confirm:{
      is_null: "确认密码为空",
      password_diff: "密码输入不一致"
    },
    email:{
      is_Exist: "邮件地址已经存在",
      email_exists: "邮件已存在",
      invalidate: "邮箱不合法",
      is_null: "邮件地址不能为空",
      no_uname: "你还没有设置用户名"
    },
    accept:{
      fial:"您的注册链接已经失效,您可以先进行注册,然后添加邮箱地址到你的帐号,进行数据存储"
    },
    active:{
      fail: "您的激活链接已经失效,需要重新进行邮件地址的添加,并且要在16小时内进行激活操作。"
    },
    recommend:{
      not_exist: "推荐不存在"
    },
    clip:{
      not_exist: "clip不存在"
    },
    content:{
      is_null: "摘录不存在",
      not_array: "摘录必须是数组",
      is_empty: "摘录不能为空"
    },
    follow:{
      all: "你追了该用户的全部"
    },
    error:{
      "link 已作废": "连接已作废",
      "link doesnt exist": "连接不存在",
      "link invalidate": "连接不合法"
    }
  };

  util.getErrorMessage = function(errorCode){
    var error = "";
    if(typeof(errorCode)=="string"){
      error = ERROR[errorCode];
      return error ? error : errorCode;
    } else if(typeof(errorCode)=="object"){
      for (key in errorCode){
	if(ERROR[key]){
	  error = ERROR[key][errorCode[key]];
	  if(errorCode && error){
	    errorCode[key] = error;
	  }
	}
      }
      return errorCode; // 构造一个对象值
    }else{
      return errorCode;
    }
 };

  return util;
})();