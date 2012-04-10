App.util = (function(){
  var util = {};
  var paramslength=0,flag=true;
  util.getMyUid = function(){
    var cookie = document.cookie;
    return cookie ? cookie.split("=")[1].split(":")[0] : null;
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
      html = html.replace(/<[\s|\/]*b.*?>/ig,"");
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
	  text = text.replace(/(^\s*)|(\s*$)/g,"").replace(/<br*?>/,"");
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
    // console.log(content);
    var html = "";
    for(var i=0; i<content.length; i++){
      for(key in content[i]){
	switch(key){
	  case 'text':
	    html += '<p>' + content[i][key] + '</p>';break;
	  case 'image':
	    html += '<p><img src=' + util.url(content[i][key]) + '></img></p>';
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
    var ftime = new Date(time);
    var ttime = new Date();
        //console.info(ftime);
        console.info(ttime);
    return subTimes(ftime,ttime) + "前";
  };

  subTimes = function(Ftime,Ttime){
    var dtime = (Ttime.getTime() - Ftime.getTime())/1000;
    var returnVal = "";
    if(dtime<60){//second
      returnVal = dtime + "秒";
    }else if(dtime>=60 && dtime<60*60){//minute
      returnVal = Math.round(dtime/60) + "分";
    }else if(dtime>=60*60 && dtime<60*60*24){//hour
      returnVal = Math.round(dtime/(60*60)) + "小时";
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

  App.vent.bind("app.clipapp.util:scroll", function(view, options){
    var paddingTop = 0;
    $(window).scroll(function() {
      var st = $(window).scrollTop();
      var wh = window.innerHeight;
      // fix left while scroll
      var mt = $(".layout").offset().top;
      if(st > mt){
	$(".left").addClass("fixed").css({"margin-top": "0px", "top": paddingTop+"px"});
	$(".return_top").fadeIn();
	// show go-top while scroll
      } else {
	$(".left").removeClass("fixed").css("margin-top", paddingTop+"px");
	$(".return_top").fadeOut();
      }
      // loader while scroll down to the page end
      var lt = $(".loader").offset().top;
      var scrollTop=document.body.scrollTop+document.documentElement.scrollTop;
      //if(view.$el[0].scrollHeight>0&&(view.$el[0].scrollHeight-scrollTop)<500){
      if(st + wh > lt){
	if(flag){
	  options.start += App.ClipApp.Url.page;
	  options.end += App.ClipApp.Url.page;
	  options.url = options.params.url + "/" +options.start + ".." + options.end;
	  options.add = true;
	  options.params.fetch(options);
	  flag = false;
	  setTimeout(function(){
	    flag = true;
	    if(options.params.length-paramslength<App.ClipApp.Url.page){
	      flag = false;
	      $(".loader").text("reach to the end.");
	    }else{
	      paramslength = options.params.length;
	    }
	  },200);
	}
      }
    });
  });

  var getMessage = {};

  getMessage["login_success"] = "登录成功";
  getMessage["register_success"] = "注册成功";
  getMessage["auth_success"] = "更改密码成功";
  getMessage["password_diff"] = "密码输入不一致";
  getMessage["collect_success"] = "收藏成功";
  getMessage["comment_success"] = "评论成功";
  getMessage["recomment_success"] = "转发成功";

  getMessage["auth"] = getMessage["auth"] || {};
  getMessage["auth"]["not_exist"] = "用户不存在";
  getMessage["auth"]["not_match"] = "句柄不合法";
  getMessage["auth"]["not_login"] = "用户未登录";

  getMessage["name"] = getMessage["name"] || {};
  getMessage["name"]["is_null"] = "用户名为空";
  getMessage["name"]["invalidate"] = "用户名不符合校验规则（只能是英文、数字和点的组合，长度是5-20）";
  getMessage["name"]["exist"] = "用户名已存在";
  getMessage["name"]["not_exist"] = "用户不存在";

  getMessage["pass"] = getMessage["pass"] || {};
  getMessage["pass"]["is_null"] = "密码为空";
  getMessage["pass"]["not_match"] = "密码不匹配";

  getMessage["oldpass"] = getMessage["oldpass"] || {};
  getMessage["oldpass"]["is_null"] = "原密码为空";
  getMessage["oldpass"]["not_match"] = "原密码不匹配";

  getMessage["email"] = getMessage["email"] || {};
  getMessage["email"]["invalidate"] = "邮箱不合法";

  getMessage["recomment_success"]= "转发成功";
  getMessage["clip_not_exist"] = "clip不存在";

  util.getErrorMessage = function(errorCode){
    for (key in errorCode)
    errorCode[key] = getMessage[key][errorCode[key]] +"  ";
    console.info(errorCode);
     return errorCode;
 };


  return util;
})();