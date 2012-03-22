// app.clipapp.face.js

App.ClipApp.Face = (function(App, Backbone, $){
  var Face = {};
  var user_id = null;

  var P = App.ClipApp.Url.base;
  var UserModel = App.Model.extend({
    defaults:{
      name:"",
      id:"",
      following:"",
      follower:"",
      face:""
    },
    url: P+"/user/"+ this.id + "/info"
  });
  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "userface-view",
    template: "#userface-view-template"
  });
  var getUser=function(uid,callback){
    user_id = uid;
    var user=new UserModel();
    user.fetch({url:P+"/user/"+ uid + "/info"});
    console.info(user);
    user.onChange(function(user){
      callback(user);
    });
  };

  Face.showUser = function(uid){
    if(uid){
      getUser(uid, function(user){
	//console.info(user);
	var faceView = new FaceView({model: user});
	App.faceRegion.show(faceView);
      });
    }else{
      App.faceRegion.close();
    }
  };

  Face.getUserId = function(){
    return user_id;
  };

  App.vent.bind("app.clipapp.face:show", function(uid){
    Face.showUser(uid);
  });

  return Face;
})(App, Backbone, jQuery);