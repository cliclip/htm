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
    template: "#userface-view-template",
    events: {
      "click .stop": "followAction",
      "click .zhui": "stopAction",
      "click .user_list": "userList",
      "click .following": "following",
      "click .follower": "follower"
    },
    followAction: function(){
      App.vent.trigger("app.clipapp:follow",this.model.id,'*');
      App.vent.trigger("app.clipapp.face:show",this.model.id);
      App.ClipApp.Bubb.showUserTags(this.model.id);
    },
    stopAction: function(){
      App.vent.trigger("app.clipapp.bubb:unfollow",this.model.id,'*');
      App.vent.trigger("app.clipapp.face:show",this.model.id);
      App.ClipApp.Bubb.showUserTags(this.model.id);
    },
    userList: function(){
      var uid =	user_id;
      if(uid == App.util.getMyUid()){
	App.vent.trigger("app.clipapp.routing:mycliplist:show");
	App.ClipApp.ClipList.showUserClips("my");
      }else{
	App.vent.trigger("app.clipapp.routing:usercliplist:show", uid);
	App.ClipApp.ClipList.showUserClips(uid);
      }
    },
    following: function(){
      App.vent.trigger("app.clipapp.followinglist:show", user_id);
    },
    follower: function(){
      App.vent.trigger("app.clipapp.followerlist:show", user_id);
    }
  });

  var getUser=function(uid,callback){
    var url = "";
    if(uid == App.util.getMyUid()){
      url = P + "/my/info";
      App.vent.trigger("app.clipapp.routing:mycliplist:show");
    }else{
      url = P + "/user/"+ uid + "/info";
      App.vent.trigger("app.clipapp.routing:usercliplist:show", uid);
    }
    var user=new UserModel();
    user.fetch({url:url});
    user.onChange(function(user){
      callback(user);
    });
  };

  Face.showUser = function(uid){
    user_id = uid;
    if(uid){
      getUser(uid, function(user){
	App.ClipApp.Bubb._getUserTags(uid,function(tag,follow){
	  user.set({relation:follow});
	  var faceView = new FaceView({model: user});
	  App.faceRegion.show(faceView);
	});
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

  App.vent.bind("app.clipapp.face:reset", function(uid){
    Face.showUser(uid);
  });

  return Face;
})(App, Backbone, jQuery);