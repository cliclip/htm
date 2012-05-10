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
    url:function(){
      return App.util.unique_url(P+"/user/"+ this.id + "/info");
    }
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
      "click .follower": "follower",
      "mouseenter .user_head": "mouseEnter",
      "mouseleave .user_head": "mouseLeave"
    },
    mouseEnter: function(e){
      $(e.currentTarget).children(".user_i").show();
    },
    mouseLeave: function(e){
      $(e.currentTarget).children(".user_i").hide();
    },
    followAction: function(){
      App.vent.trigger("app.clipapp.followerlist:refresh");
      App.vent.trigger("app.clipapp:follow",this.model.id,'*');
      //App.vent.trigger("app.clipapp.face:show",this.model.id);
      //App.vent.trigger("app.clipapp.bubb:showUserTags",this.model.id);
      // 能否触发去修改bubbs中的tag和follow的事件而不是直接showUserTags
      App.vent.trigger("app.clipapp.bubb:refresh",this.model.id,['*']);
      //refresh 只刷新bubbs 而
    },
    stopAction: function(){
      App.vent.trigger("app.clipapp.followerlist:refresh");
      App.vent.trigger("app.clipapp.bubb:unfollow",'*',this.model.id);
      //App.vent.trigger("app.clipapp.face:show",this.model.id);
      //App.vent.trigger("app.clipapp.bubb:showUserTags",this.model.id);
      App.vent.trigger("app.clipapp.bubb:refresh",this.model.id,[]);
    },
    userList: function(e){
      App.vent.trigger("app.clipapp:usershow", user_id);
    },
    following: function(){
      App.vent.trigger("app.clipapp:showfollowing", user_id);
    },
    follower: function(){
      App.vent.trigger("app.clipapp:showfollower", user_id);
    }
  });

  var getUser=function(uid,callback){
    var url = "";
    if(uid == App.util.getMyUid()){
      // url中带上随机数 防止ie的缓存导致不能向服务器发出请求
      url = P + "/my/info";
    }else{
      url = P + "/user/"+ uid + "/info";
    }
    var user=new UserModel();
    user.fetch({url:App.util.unique_url(url)});
    user.onChange(function(user){
      callback(user);
    });
  };

  Face.showUser = function(uid){
    user_id = uid;
    if(uid){
      if(App.util.getMyUid() != uid){
	getUser(uid, function(user){
	  App.ClipApp.Bubb._getUserTags(uid,function(tag,follow){
	    user.set({relation:follow});
	    var faceView = new FaceView({model: user});
	    App.faceRegion.show(faceView);
	  });
	});
      }else{
	var faceView = new FaceView({model: App.ClipApp.Me.me});
	App.faceRegion.show(faceView);
      }
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