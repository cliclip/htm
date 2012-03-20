// app.clipapp.face.js

App.ClipApp.Face = (function(App, Backbone, $){
  var Face = {};
  var user_id = null;

  var P = App.ClipApp.Url.base;
  var UserModel = App.Model.extend({
    url: function(){
      return P+"/user/"+this.id+"/info";
    }
  });
  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "userface-view",
    template: "#userface-view-template"
  });
  var getUser=function(uid,callback){
    user_id = uid;
    var user=new UserModel({
      id:uid
    });
    user.fetch();
    user.onChange(function(userModel){
      if(!userModel.get("face")){
	userModel.set("face", "");
      }
      userModel.set("following", 10);
      userModel.set("follower", 10);
      callback(userModel);
    });
  };

  Face.showUser = function(uid){
    if(uid){
      getUser(uid, function(user){
	App.vent.trigger("app.clipapp.face:show", user);
      });
    }else{
      App.faceRegion.close();
    }
  };

  Face.getUserId = function(){
    return user_id;
  };

  App.vent.bind("app.clipapp.face:show", function(user){
    var faceView = new FaceView({model: user});
    App.faceRegion.show(faceView);
  });

  return Face;
})(App, Backbone, jQuery);