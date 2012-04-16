App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;
  util.getMyUid = function(){
    var cookie = document.cookie;
    return cookie ? cookie.split("=")[1].split(":")[0] : null;
  };

  // 判断当前的用户和传过来的参数是否是同一人
  util.auth = function(uid){
    return util.getMyUid() == uid;
  };

  util.getImg_upUrl = function(){
    return P + '/user/'+util.getMyUid()+'/image';
  };

  util.url = function(imageid){
    var pattern = /^\d+:[a-z0-9]{32}/;
    if(imageid && pattern.test(imageid)){
      var ids = imageid.split(":");
      return P + "/user/" + ids[0]+ "/image/" + ids[1];
    }else return imageid;
  };

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
  };

  util.ContentToHtml = function(content){
    var html = "";
    for(var i=0; i<content.length; i++){
      for(key in content[i]){
	switch(key){
	  case 'text':
	    html += '<p>' + content[i][key] + '</p>';break;
	  case 'image':
	    html +=
	    '<p><img src=' + util.url(content[i][key]) + ' style="max-width:475px;max-height:490px;">'
	    + '</img></p>';
	    break;
	  case 'code':
	    html += '<pre> ' + content[i][key] + '</pre>';break;
	}
      }
    }
    // console.log("html:: %j", html);
    return html;
  };

  util.isImage = function(id){
    var sender = document.getElementById(id);
    if (!sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      return false;
    }else{
      return true;
    }
  };

  util.face_url = function(imageid){
    var pattern = /^[0-9]:[a-z0-9]{32}/;
    if(imageid == ""){
      return "img/f.jpg";
    }else if(imageid&& pattern.test(imageid)){
      var ids = imageid.split(":");
      return P + "/user/" + ids[0]+ "/image/" + ids[1];
    }else return imageid;
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
  util.list_scroll = function(view, _options){
    var collection_length=0;
    var scroll_flag = true;
    var paddingTop = 0;
    var lo = _options;
    $(window).unbind("scroll");
    $(window).scroll(function() {
      var st = $(window).scrollTop();
      var wh = window.innerHeight;
      // fix left while scroll
      var mt = $(".clearfix").offset().top + 240;//$("#face").height();
      if($("#list").height()<=200)return;
      if(st > mt ){
	$(".user_detail").addClass("fixed").css({"margin-top": "0px", "top": paddingTop+"px"});
	$("#bubb").addClass("fixed").css({"margin-top": $(".user_detail").height()+"px", "top": paddingTop+"px"});
	$(".return_top").show();
	// show go-top while scroll
      } else {
	$(".user_detail").removeClass("fixed").css("margin-top", paddingTop+"px");
	$("#bubb").removeClass("fixed").css("margin-top", paddingTop+"px");
	$(".return_top").hide();
      }
      // loader while scroll down to the page end
      var lt = $(".loader").offset().top;
      var scrollTop=document.body.scrollTop+document.documentElement.scrollTop;
      if(st + wh > lt){
	if(scroll_flag){
	  lo.start += App.ClipApp.Url.page;
	  lo.end += App.ClipApp.Url.page;
	  lo.url = lo.base_url + "/" +lo.start + ".." + lo.end;
	  lo.add = true;
	  lo.collection.fetch(lo);
	  scroll_flag = false;
	  setTimeout(function(){
	    scroll_flag = true;
	    if(lo.collection.length-collection_length<App.ClipApp.Url.page){
	      scroll_flag = false;
	      //$(".loader").text("reach to the end.");
	    }else{
	      collection_length = lo.collection.length;
	    }
	  },200);
	}
      }
    });
  };
// App.vent.bind("app.clipapp.util:scroll", });
  var getMessage = {

    login_success : "登录成功",
    register_success : "注册成功",
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
      email_exists: "邮件已存在",
      invalidate: "邮箱不合法",
      is_null: "邮件地址不能为空",
      no_uname: "你还没有设置用户名"
    },
    active:{
      _isExists: "激活连接不存在",
      fail: "激活失败"
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
      error = getMessage[errorCode];
      if(error){
	return error;
      }else{
	return errorCode;
      }
    } else if(typeof(errorCode)=="object"){
      for (key in errorCode){
	if(getMessage[key]){
	  error = getMessage[key][errorCode[key]];
	  if(errorCode && error){
	    errorCode[key] = error;
	  }
	}
      }
      return errorCode;
    }else{
      return errorCode;
    }
 };

  return util;
})();