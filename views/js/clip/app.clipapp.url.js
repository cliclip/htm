/** 代码中需要更改域名和端口号的文件包括：
 * 1)loader.js,clipper-start.js bookmarklet.js书签相关
 * 2)此文件
*/
App.ClipApp.Url = (function(){

  var HOST = (location.protocol === "http:")
      ? location.protocol+"//"+location.hostname+":"+location.port
      : "http://192.168.1.3:2000"; // "http://cliclip.com" for online
  var VER = "/_3_";
  var PAGE = 10;

  return {
    hostname : HOST,
    base : HOST+VER,
    page : PAGE
  };

})();