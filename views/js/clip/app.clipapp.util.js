App.util = (function(){
  var util = {};

  util.getMyUid = function(){
    return document.cookie.split("=")[1].split(":")[0];
  };

  util.url = function(imageid){
    var pattern = /^[0-9]:[a-z0-9]{32}/;
    if(imageid && pattern.test(imageid)){
      var ids = imageid.split(":");
      return P + "/user/" + ids[0]+ "/image/" + ids[1];
    }else return imageid;
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