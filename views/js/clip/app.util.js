App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;
  var _P = App.ClipApp.Url.basedir;
  var NOOP = function(){};
  util.name_pattern = /^[a-zA-Z0-9][a-zA-Z0-9\.]{3,18}[a-zA-Z0-9]$/;
  util.email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;

  util.getCookie = function(name){
    if(App.Local){
      return App.Local[name];
    }
    var start = document.cookie.indexOf( name+"=" );
    var len = start + name.length + 1;
    if ((!start) && (name != document.cookie.substring(0, name.length))){
      return null;
    }
    if ( start == -1 )
      return null;
    var end = document.cookie.indexOf( ';', len );
    if ( end == -1 )
      end = document.cookie.length;
    return unescape(document.cookie.substring( len, end ));
  };
  // url后面加上_token的原因是本地文件跨域访问时无法传递token参数，
  // 且上传图片时不走app-base.js的sync方法，所以需要手动加入参数
  util.getImg_upUrl = function(uid){
    return P + "/"+uid+"/image?_token=" + App.util.getCookie("token");
  };

  util.getFace_upUrl = function(uid){
    return P + "/" + uid + "/face?_token=" + App.util.getCookie("token");
  };

  util.unique_url = function(url){
    var now = new Date();
    return url + "?now=" + now.getTime();
  };

  util.img_url = function(url,size){
    if(url && !/tmp_/.test(url) && /http:\/\/((www\.)?cliclip|192\.168\.1\.(\d+))|\.\./.test(url) && !/_270/.test(url)){
      var idx = url.lastIndexOf(".");
      return url.slice(0,idx) + "_270" + url.slice(idx);
    }else return url;
  };
  // TODO 此处理适合在 api 的 getUserInfo 逻辑里完成
  // if (!face) userInfo.face = default_face;
  // userInfo.icon = userInfo.face + '/42'
  // imageid: [uid]:face_[time].jpg|gif
  util.face_url = function(imageid,size){
    var pattern = /^[0-9]{1,}:face*/;
    if(imageid == ""){
      return "img/f.png";
    }else if(imageid&& pattern.test(imageid)){
      var ids = imageid.split(":");
      var opt0 = ids[1].split("_");
      var opt = opt0[1].split(".");
      var face_name = size ? "face_" + size+ "." + opt[1] : "face." + opt[1];
      var url =  "/" + ids[0]+ "/" + face_name + "?now=" + opt[0];
      return util.isLocal()&&_getMyUid()==ids[0]  ? _P + url : url;
    }else return imageid;
  };

  // 对comment的内容进行html过滤，防止脚本注入
  util.cleanInput = function(comment){
    comment = App.Convert.cleanHtml(comment);
    comment = comment.replace(/<\/?div[^>]*>/ig, "");
    comment = comment.replace(/<\/?div[^>]*>/ig, "");
    return comment;
  };

  // TODO 合并到某个代码里？可以直接不要了
  /*util.commentToHtml = function(comment){
    comment = comment.replace(/\n{2,}/ig, "<\/p><p>");
    comment = comment.replace(/\n/ig, "<\/br>");
    return comment;
  };*/

  // contentToPreview
  util.getPreview = function(content, length){
    var data = {};
    var reg = /<\s*img[^>]*src=['"](.*?)['"][^>]*>/ig;
    var img = content.match(reg);
    if(img) data.image = {src : img[0].replace(reg,"$1")};
    var text = getContentText(content);
    data.text = trim(text, length);
    return data;
  };

  function getContentText (content){
    var reg1 = /<\s*img[^>]*src=['"](.*?)['"][^>]*>/ig;
    var reg = /<\/?[^>].*?>/gi;
    // 去除img标签
    while(reg1.test(content)) content = content.replace(reg1,"");
    // 去除其他标签
    while(reg.test(content)) content = content.replace(reg,"");
    return content;
  };

  function trim(content, length){
    var r = undefined;
    if (!content) return r;
    if (_.isString(content) && content.length){
      // 先对content内容进行空格去除，在做截断
      content = content.replace(/\s+/g," ");
      content = content.replace(/&nbsp;+/g, "");
      if(content.length < length){
	r = content;
      } else {
	r = content.substring(0, length).replace(/<$/, "") + "...";
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
    if(!time) return null;
    var ftime = new Date(time);
    if(ftime == "NaN"){
      time_Date=time.split('T')[0];
      var year=time_Date.split('-')[0];
      var month=time_Date.split('-')[1];
      var date=time_Date.split('-')[2];
      var time_time=time.split('T')[1];
      var hrs=time_time.split(':')[0];
      var min=time_time.split(':')[1];
      var sec=time_time.split(':')[2].split('.')[0];
      var ms=time_time.split(':')[2].split('.')[1].replace('Z','');
      time=Date.UTC(year,month-1,date,hrs,min,sec,ms);//UTC中的month是0-11
      ftime = new Date(time);
    }
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
      returnVal = _i18n('util.time.half_year');
    }else if(dtime>=60*60*24*30*6*12){//year
      returnVal = Math.round(dtime/(60*60*24*30*6*12)) + _i18n('util.time.year');
    }
    return returnVal;
  };

  // 之前的判断对ie9判断错误
  util.isIE = function(){
    return isIE= $('html').hasClass("gt-ie8") || $('html').hasClass("lt-ie9") || $('html').hasClass("lt-ie8") || $('html').hasClass("lt-ie7");
  };

  util.get_imgurl = function(returnVal,callback){
    if(returnVal != null && returnVal != ""){
      var returnObj = eval(returnVal);
      if(returnObj[0] == 0){
	var imgids = returnObj[1][0];
	//for(var i=0;i<imgids.length;i++){ // 上传无需for循环
	var uid = imgids.split(":")[0];
	var imgid = imgids.split(":")[1];
	var url = P + "/" +uid + "/image/" + imgid;
	callback(null, url);
      }else{//上传图片失败
	callback("imageUp_fail", null);
      }
    }
  };

  /**
   * 向api提交数据时要去除图片src中的前缀部分
   */
  util.cleanConImgUrl = function(content){
    return content;

/*
    var str0 = "\\" + P + "\\/(\\d+)\\/(\\d+)\\/";
    var str1 = "src=\\'",str2 = 'src=\\"';
    var str3 = "\\" + P + "\\/(\\d+)\\/tmp_";
    var str4 = "http://(192\\.168\\.1\\.(\\d+)|(www\\.)?cliclip\\.com)(:(\\d{1,5}))?";
    var reg0 = new RegExp(str0,"g");
    var reg1 = new RegExp(str1 + str4,"g");
    var reg2 = new RegExp(str2 + str4,"g");
    var reg3 = new RegExp(str3,"g");
    var con = content.replace(reg0,"");//去掉文件类型图片src中的版本号和uid,cid
    con = con.replace(reg3,'tmp_');//去掉临时图片src中的版本号和uid
    con = con.replace(reg1,'src=\'');//去掉域名和端口号
    con = con.replace(reg2,'src=\"');//去掉域名和端口号
    return con;
    var str = "http://(192\\.168\\.1\\.(\\d+)|(www\\.)?cliclip\\.com)(:(\\d{1,5}))?";
    var str0 = "\\" + P + "\\/(\\d+)\\/image/tmp_";
    var str1 = "\\/(\\d+)\\/(\\d+)\\/";
    var str2 = "src=\\'",str3 = 'src=\\"';
    var reg0 = new RegExp(str2 + str + str0,"g");//临时图片
    var reg1 = new RegExp(str3 + str + str0,"g");//临时图片
    var reg2 = new RegExp(str2 + str + str1,"g");//图片文件
    var reg3 = new RegExp(str3 + str + str1,"g");//图片文件
    var con = content.replace(reg0,"src='");
    con = con.replace(reg1,'src="');
    con = con.replace(reg2,"src='");
    con = con.replace(reg3,'src="');

    return con;
*/
  };

  util.expandConImgUrl = function(content,user,id){
    var cid = id,uid = user,pre;
    if(/:/.test(id)){
      uid = id.split(":")[0];
      cid = id.split(":")[1];
    }
    if(_getMyUid() == uid && App.util.isLocal()){
      pre =  _P + "/" + uid + "/clip_" + cid + "_";
    }else{
      pre = App.ClipApp.Url.hostname + "/" + uid+ "/" + cid + "/";
    }
    var reg = /<img\ssrc=(\'|\")(\d+)\.(\w+)(\'|\")/g;
    var reg1 = /\"tmp_/g;
    var reg2 = /\'tmp_/g;
    content = content.replace(reg1, "\"" + P +"/" + uid + "/image/tmp_");
    content = content.replace(reg2, "'" + P + "/" + uid + "/image/tmp_");
    var imgs = content.match(reg);
    if(!imgs)return content;
    for(var i = 0; i<imgs.length; i++){
      var opt = imgs[i].split("='");
      content = content.replace(imgs[i], opt[0] + "='" + pre + opt[1]);
    }
    return content;
  };

  util.expandPreImgUrl = function(content,clipid){
    if(!content.image) return content;
    var src = content.image.src,uid,cid;
    uid = clipid.split(":")[0];
    cid = clipid.split(":")[1];
    if(/^tmp_/.test(content.image.src)){
      content.image.src = P + "/" + uid + "/image/" + src;
    } else if(/^(\d+)\.(\w+)$/.test(src)){
      if(_getMyUid() == uid && util.isLocal()){
	content.image.src = _P + "/" + uid + "/clip_" + cid + "_" + src;
      }else {
	content.image.src = App.ClipApp.Url.hostname + "/" + uid + "/" + cid + "/" + src;
      }
    }
    return content;
  };

  util.img_load = function(img){
    img.onload = null;
    if(img.readyState=="complete"||img.readyState=="loaded"||img.complete){
      setTimeout(function(){
	$(".fake_"+img.id).hide();
	$("."+img.id).show();
	$("#list").masonry("reload");
      },0);
    }
  };

  util.img_error = function(img){
    img.title = img.src;
    var src = img.src.match(/\/(\d+)\/clip_(\d+)_(\d+)(_(\d+))*\.(\w+)/);
    if(src&&/file:\/\//.test(img.src)){
      if(/_(270|128|64)/.test(src[0])){//若本地不存在相应尺寸的图片，则取原图
	img.src = img.src.replace(/_(270|128|64)/,"");
      }else {
	img.src = P + src[0];
      }
    }else{
      // img.height = 184;
      // img.src='img/img_error.jpg';
    }
    if(img.id){
      $(".fake_" + img.id).hide();
      $("." + img.id).show();
    }
    img.onload = function(){
      $("#list").masonry("reload");
    };
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
  util.showName = function(name){
    if(name && name.match("@")){
      var provider = name.split("@")[1];
      if(provider == "weibo"){
	return name.split("@")[0]+" <img width ='17px' src =' http://ww3.sinaimg.cn/large/69ae757egw1divzpcj539j.jpg'>";
      }else if(provider == "twitter"){
	return name.split("@")[0]+"<img width ='17px' src ='img/sign-in-with-twitter-l.png' >";
      }else if(provider == "dropbox"){
	return name.split("@")[0]+"<img width ='17px' src ='img/sign-in-with-twitter-l.png' >";
      }else if(provider == "gmail.com"){
	return name.split("@")[0]+"<img width ='17px' src ='img/sign-in-with-twitter-l.png' >";
      }else if(provider == "126.com"){
	return name.split("@")[0]+"<img width ='17px' src ='img/sign-in-with-twitter-l.png' >";
      }else if(provider == "163.com"){
	return name.split("@")[0]+"<img width ='17px' src ='img/sign-in-with-twitter-l.png' >";
      }
    }else{
      return name;
    }
  };

  util.showPrefixName = function(name){
    return name && name.match("@") ? name.split('@')[0] : name;
  };

  // 获取当前用户的uid
  util.getMyUid = _getMyUid;
  function _getMyUid(){
    var token = App.util.getCookie("token");
    var uid_token = token ? token.match(/[0-9]+/)[0]:null;
    return  uid_token;
  }

  // 获取url中含有的uid
  function getUrlUid(url){
    var uid_clip = url.match(/clip\/[0-9]+:[0-9]+/) ? url.match('clip\/[0-9]+')[0].split('/')[1] : null;
    var uid = url.match(/user\/[0-9]+/) ? url.match(/user\/[0-9]+/)[0].split('/')[1]: null;
    return uid_clip || uid;
  }

  // 判断app-base.js中collection sync方法是否通过rpc向服务器发送请求
  util.collectionByRpc = function(url, options){
    if( !util.isLocal() ){ return true;}
    var url_uid = getUrlUid(url);
    var my_uid = _getMyUid();
    if(!my_uid) return true;
    if(/user\/([0-9]+)\/query/.test(url)&& url_uid != my_uid)return true;
    if(/follow/.test(url)) return true;
    if(/query/.test(url) && !url_uid) return true;
    return /interest|comment/.test(url)||(/query/.test(url) && options.data.text);
  };

  // 判断app-base.js中model sync方法是否通过rpc向服务器发送请求
  util.modelByRpc = function(method, url, options){
    if( !util.isLocal() ){ return true; }
    var url_uid = getUrlUid(url);
    var my_uid = _getMyUid();
    if( /user\/(\d+)\?/.test(url)&&my_uid == url_uid )return false;
    if( method != "GET" ) return true;
    if( !my_uid ) return true;
    if(/meta|clip/.test(url)&& my_uid == url_uid)return false;
    return true;
  };

  // 判断当前协议是否为"file:" 即：是否访问本地文件
  util.isLocal = function(){
    return location.protocol == "http:" ? false : true;
  };

  util.setImgHeight = function(image){
    return image.width>270 ? Math.round(image.height*270/image.width) : image.height;
  };
/*
  util.cacheSync = function(name,filed,data){
    if(!util.isLocal()) return;
    var myUid = _getMyUid();
    var key = "/" + myUid + name;
    if(data){
      window.cache[key][filed] = data ;
    }else{
      data = filed;
      window.cache[key] = data ;
    }
  };
*/
  return util;
})();