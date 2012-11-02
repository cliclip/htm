
//- application kick start

$(function(){

  App.addRegions({
    mineRegion: "#mine",
    notifyRegion :"#notify",
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

  // easyXDM.Rpc
  var hostname = App.ClipApp.Url.HOSTNAME;
  var rpc = new easyXDM.Rpc({
    remote: hostname + "/cors/",
    swf: hostname + '/img/easyxdm.swf'
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
      return window.location.protocol != "http:";
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
