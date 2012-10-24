/* 代码中需要更改域名和端口号的文件包括：
 * 1)loader.js,clipper-start.js bookmarklet.js书签相关
 * 2)app-start.js (必须修改)
 * 3)此文件
*/
App.ClipApp.Url = (function(){
  var Url = {};
  Url.page = 10;
  var P = "/_2_";
  Url.HOSTNAM = "http://192.168.1.3:8000";
  //Url.HOSTNAM = "http://cliclip.com";
  if(location.protocol != "http:"){
    Url.base = Url.HOSTNAME + P;
    Url.hostname = Url.HOSTNAME;
  }else{
    Url.base = P;
    Url.hostname = "";
  }
  return Url;
})();