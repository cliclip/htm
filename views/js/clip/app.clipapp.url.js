App.ClipApp.Url = (function(){
  var Url = {};
  Url.page = 10;
  // Url.url = Url.base;
  if(window.location.hostname!="192.168.1.3"&&window.location.hostname!="cliclip.com"){
    Url.base = "http://192.168.1.3:8000/_2_";
    //Url.base = "http://cliclip.com/_2_";
    Url.hostname = "http://192.168.1.3:8000";
  }else{
    Url.base = "/_2_";
    Url.hostname = "";
  }
  return Url;
})();