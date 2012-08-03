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
      return ["pretty","funny","musical","cool","tasty","wish"];
    }{
      return ["好看", "有趣","好听", "真赞", "好吃",  "想要"];
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
    // return util.getMyUid() == uid || App.ClipApp.Me.me.get("name") == uid;
    return util.getMyUid() == uid;
  };

  util.getImg_upUrl = function(){
    return P + '/user/'+util.getMyUid()+'/image';
  };

  util.getFace_upUrl = function(){
    return P+"/user/" + util.getMyUid() + "/upload_face";
  };
/*
  util.getPopTop = function(clss){
    var top = 0;
    var scroll = document.documentElement.scrollTop + document.body.scrollTop;
    if(clss == "big"){ return  15+"px"; }
    else { return 150+"px"; };
    // return scroll + top + "px";
  };
*/
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
    return App.ClipApp.Convert.ubbToHtml(content);
  };

  function trim(content, length){
    var r = undefined;
    if (!content) return r;
    if (_.isString(content) && content.length){
      // 先对content内容进行空格去除，在做截断
      content = content.replace(/\s+/g," "); // 去掉p标签
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
  util.current_page = function(str){
    if(str=="my"){
      $(".my").css({"z-index":2,"top":"-3px","height":"33px"});
      $(".at_me").css({"z-index":1,"top":"0px","height":"30px"});
      $(".expert").css({"z-index":0,"top":"0px","height":"30px"});
    }else if(str=="@me"){
      $(".my").css({"z-index":1,"top":"0px","height":"30px"});
      $(".at_me").css({"z-index":1,"top":"-3px","height":"33px"});
      $(".expert").css({"z-index":0,"top":"0px","height":"30px"});
    }else if(str=="interest"){//ie7 此处层次关系导致次数必须设成0,2,2，0,0,1和0,1,2 效果不正确
      $(".my").css({"z-index":0,"top":"0px","height":"30px"});
      $(".at_me").css({"z-index":2,"top":"0px","height":"30px"});
      $(".expert").css({"z-index":2,"top":"-3px","height":"33px"});
    }else {
      $(".my").css({"z-index":2,"top":"0px","height":"30px"});
      $(".at_me").css({"z-index":1,"top":"0px","height":"30px"});
      $(".expert").css({"z-index":0,"top":"0px","height":"30px"});
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
    img.onload = function(){
      $("#list").masonry("reload");
    };
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

  return util;
})();