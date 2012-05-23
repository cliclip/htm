$(function() {
  var r ;
  var socket = new easyXDM.Socket({
    swf: 'http://192.168.1.3:5000/img/easyxdm.swf',
    swfNoThrottle: true,
    onMessage: function(message, origin){
      r = JSON.parse(message);
      switch(r[0]){
	case 'init' : // for caller to set content // TODO
          // 先通过cleanHtml toUbb toHtml的转换在显示在editor上
	  r[1] = App.ClipApp.Convert.filter(r[1]);
          if(App.util.getMyUid()){
            App.ClipApp.ClipAdd.show();
            App.ClipApp.Editor.setContent("editor", r[1]);
          }else{
            App.ClipApp.Login.show(function(){
	      App.ClipApp.ClipAdd.show();
	      App.ClipApp.Editor.setContent("editor", r[1]);
	    });
	  }
          break;
        }
      }
    });

    App.vent.bind("app.clipapp.clipper:ok",function(){
      App.ClipApp.ClipAdd.close();
      socket.postMessage(JSON.stringify(["ok",r[1]]));
    });

    App.vent.bind("app.clipapp.clipper:cancel", function(){
      socket.postMessage(JSON.stringify(["cancel"]));
    });

    App.vent.bind("app.clipapp.clipper:save", function(){
      setTimeout(function(){
	socket.postMessage(JSON.stringify(["close"]));
      }, 500);
    });

    App.vent.bind("app.clipapp.clipper:empty", function(){
      App.ClipApp.ClipAdd.close();
      socket.postMessage(JSON.stringify(["close"]));
    });

    App.vent.bind("app.clipapp.clipper:login", function(){
      socket.postMessage(JSON.stringify(["close"]));
    });

    App.vent.bind("app.clipapp.clipper:log", function(data){
      socket.postMessage(JSON.stringify(["log", data]));
    });
    App.vent.bind("app.clipapp.clipper:register", function(){
      socket.postMessage(JSON.stringify(["close"]));
    });

    // setTimeout(function(){ socket.postMessage(["empty"]); },20000);
});