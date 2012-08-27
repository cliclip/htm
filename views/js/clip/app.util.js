App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;

  util.name_pattern = /^[a-zA-Z0-9][a-zA-Z0-9\.]{3,18}[a-zA-Z0-9]$/;
  util.email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;

  util.getCookie = function(name){
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

  util.getImg_upUrl = function(uid){
    return P + '/user/'+uid+'/image';
  };

  util.getFace_upUrl = function(uid){
    return P+"/user/" + uid + "/upload_face";
  };

  util.unique_url = function(url){
    var now = new Date();
    return url + "?now=" + now.getTime();
  };

  // TODO 此处理适合在 api 的 getPreview 逻辑里完成
  // clip列表时取得img 的 url 为裁剪后的图片
  util.url = function(image_url){
    var pattern = /user\/\d\/image\/[a-z0-9]{32}/;
    var pattern1 = /http:\/\//;
    if(image_url && pattern.test(image_url)&&!pattern1.test(image_url)){
      return image_url + "/270";
    }else return image_url;
  };

  // TODO 此处理适合在 api 的 getUserInfo 逻辑里完成
  // if (!face) userInfo.face = default_face;
  // userInfo.icon = userInfo.face + '/42'
  util.face_url = function(imageid,size){
    var pattern = /^[0-9]{1,}:[a-z0-9]{32}_face/;
    if(imageid == ""){
      return "img/f.png";
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
    return App.Convert.ubbToHtml(content);
  };

  // 对comment的内容进行html过滤，防止脚本注入
  util.cleanComment = function(comment){
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
    var reg1 = /\[img\].*?\[\/img\]/gi;
    var reg = /\[\/?[^\]].*?\]/gi;  //\[\/?[^].*?\]/gi;
    // 去除img标签
    while(reg1.test(content)) content = content.replace(reg1,"");
    // 去除其他标签
    while(reg.test(content)) content = content.replace(reg,"");
    return App.Convert.ubbToHtml(content);
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

  util.isIE = function(){
    return isIE=$('html').hasClass("lt-ie9") || $('html').hasClass("lt-ie8") || $('html').hasClass("lt-ie7");
  };

  util.get_imgurl = function(frameid,callback){
    $("#" + frameid).unbind("load");
    $("#" + frameid).load(function(){ // 加载图片
      if(App.util.isIE()){
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
	  callback(null, url);
	}else{//上传图片失败
	  callback("imageUp_fail", null);
	}
      }
    });
  };

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

  return util;
})();