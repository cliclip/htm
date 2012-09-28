//- application kick start

$(function(){

  App.addRegions({
    mineRegion: "#mine",
    mysetRegion: "#myset",
    faceRegion: "#face",
    bubbRegion: "#bubb",
    listRegion: "#list",
    viewRegion: "#view",
    popRegion: "#pop",
    feedRegion: ".feed",
    feedbackRegion: "#feedback",
    setpopRegion:"#setpop",
    searchRegion:".search",
    followRegion:"#follow"
  });

  //easyXDM.Rpc
  var rpc = new easyXDM.Rpc({
    remote: "http://192.168.1.3:8000/cors/",
    //remote: "http://192.168.1.3:8000/upload.html",
    swf: 'http://192.168.1.3:8000/img/easyxdm.swf'
    //swfNoThrottle: true,
  },{
    local: {
      upload: function(returnVal){
	App.vent.trigger("app.clipapp:upload", returnVal);
      }
    },
    remote:{
      request:{}
    }
  });

  App.rpc = rpc;
  
  App.bind("initialize:before", function(){
    Modernizr.addTest('filereader', function () {
      return !!(window.File && window.FileList && window.FileReader);
    });
    Modernizr.addTest('jsonp', function () {
      return window.location.hostname!="192.168.1.3"&&window.location.hostname!="cliclip.com";
    });
    Modernizr.addTest('cssfilters', function() {
      var el = document.createElement('div');
      el.style.cssText = Modernizr._prefixes.join('filter' + ':blur(2px); ');
      // return  !!el.style.length && ((document.documentMode === undefined || document.documentMode > 9));
      return !!el.style.length && ((document.documentMode === undefined || document.documentMode > 6));
    });
  });

  App.bind("initialize:after", function(){
    if(Backbone.history) Backbone.history.start();
  });

  App.start();

});
