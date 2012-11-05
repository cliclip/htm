/** 代码中需要更改域名和端口号的文件包括：
 * 1)loader.js,clipper-start.js bookmarklet.js书签相关
 * 2)此文件
*/
App.ClipApp.Url = (function(){
  var Url = {};
  var P = "/_3_";
  Url.page = 10;
  // Url.HOSTNAME = "http://cliclip.com";
  Url.HOSTNAME = "http://192.168.1.3:10000";
  if(location.protocol != "http:"){
    Url.base = Url.HOSTNAME + P;
    Url.hostname = Url.HOSTNAME;
    Url.base_local = "..";
  }else{
    Url.base = P;
    Url.hostname = "";
  }
  return Url;
})();