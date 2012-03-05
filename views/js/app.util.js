App.util = (function(){
  var util = {};
  util.url = function(uid,imageid){
    var pattern = /^[a-z0-9]{32}/;
    if(imageid&& pattern.test(imageid))
      return P + "user/" + uid+ "/image/" + imageid ;
    else return imageid;
  };
  return util;
})();