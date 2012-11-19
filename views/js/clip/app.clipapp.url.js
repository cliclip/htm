/** 代码中需要更改域名和端口号的文件包括：
 * 1)loader.js,clipper-start.js bookmarklet.js书签相关
 * 2)此文件
*/
App.ClipApp.Url = (function(){
  var PORT = location.port ? ":" + location.port : "";
  var HOST = (location.protocol === "http:")
      ? location.protocol+"//"+location.hostname+PORT
      : "http://cliclip.com:8001";
  var VER = "/_3_";
  var PAGE = 10;
  var BASE_DIR = "..";
  return {
    hostname : HOST,
    base : HOST+VER,
    page : PAGE,
    ver : VER,
    basedir : BASE_DIR
  };

})();
