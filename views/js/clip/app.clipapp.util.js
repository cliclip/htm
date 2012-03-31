App.util = (function(){
  var util = {};

  util.getMyUid = function(){
    return document.cookie.split("=")[1].split(":")[0];
  };

  util.url = function(imageid){
    var pattern = /^\d+:[a-z0-9]{32}/;
    if(imageid && pattern.test(imageid)){
      var ids = imageid.split(":");
      return P + "/user/" + ids[0]+ "/image/" + ids[1];
    }else return imageid;
  };

  util.HtmlToContent = function(html){
    var src = /<img\s* (src=\"?)([\w\-:\/\.]+)?\"?\s*.*\/?>/;
    var rg = /<img[^>]+\/>|<img[^>]+>/;
    var link = /http:\/\//;
    var content = [];
    for(var k =0; k< $(html).length; k++){
      var obj = $(html)[k];
      html = html.replace('/<p>/',"");
      obj = $(obj).html().replace(/<p>/,"").replace(/<\/p>/,"");
      // console.log("obj:: %j",obj);
      if(rg.test(obj) && obj.indexOf('<img') == 0){
	obj.match(src);
	var match = obj.match(src);
	if(match.length >= 2){
	  if(link.test(match[2])){
	    content.push({image: match[2]});
	  }else{
	    // 本地上传图片
	    var ids = match[2].split('/');
	    var imgid = ids[3]+":"+ids[5];
	    content.push({image:imgid});
	  }
	}
	html = html.replace(rg,"").replace(/<\/p>i/,"");
	// console.log("img :: %j", html);
      }else{
	var text = obj.replace(/(^\s*)|(\s*$)/g,"").replace(/<br>/,"");
	content.push({text:text});
	html = html.replace(obj, "").replace(/<\/p>i/,"");
	// console.log("no image :: %j",html);
      }
    }
    console.log("content:: %j", content);
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
	    html += '<p><img src=' + util.url(content[i][key]) + '></img></p>';
	    break;
	  case 'code':
	    html += '<pre> ' + content[i][key] + '</pre>';break;
	}
      }
    }
    console.log("html:: %j", html);
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
    // console.info(time);
    return time;
    // var ftime = new Date(time);
    // var ttime = new Date();
    // console.info(ftime+"   "+ttime);
    // return subTimes(ftime,ttime) + "前";
  };

  subTimes = function(Ftime,Ttime){
    var dtime = (Ttime.getTime() - Ftime.getTime())/1000;
    var returnVal = "";
    if(dtime<60){//second
      returnVal = dtime + App.client.UNIT.TIME_UNIT.SECOND;
    }else if(dtime>=60 && dtime<60*60){//minute
      returnVal = Math.round(dtime/60) + App.client.UNIT.TIME_UNIT.MINUTE;
    }else if(dtime>=60*60 && dtime<60*60*24){//hour
      returnVal = Math.round(dtime/(60*60)) + App.client.UNIT.TIME_UNIT.HOUR;
    }else if(dtime>=60*60*24 && dtime<60*60*24*7){//day
      returnVal = Math.round(dtime/(60*60*24)) + App.client.UNIT.TIME_UNIT.DAY;
    }else if(dtime>=60*60*24*7 && dtime<60*60*24*30){//week
      returnVal = Math.round(dtime/(60*60*24*7)) + App.client.UNIT.TIME_UNIT.WEEK;
    }else if(dtime>=60*60*24*30 && dtime<60*60*24*30*6){//month
      returnVal = Math.round(dtime/(60*60*24*7*4)) + App.client.UNIT.TIME_UNIT.MONTH;
    }else if(dtime>=60*60*24*30*6 && dtime<60*60*24*30*6*12){//half year
      returnVal = App.client.UNIT.TIME_UNIT.HALFYEAR;
    }else if(dtime>=60*60*24*30*6*12){//year
      returnVal = Math.round(dtime/(60*60*24*30*6*12)) + App.client.UNIT.TIME_UNIT.YEAR;
    }
    return returnVal;
  };
  return util;
})();