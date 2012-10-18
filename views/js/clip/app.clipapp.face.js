// app.clipapp.face.js
App.ClipApp.Face = (function(App, Backbone, $){
  var Face = {};
  var user_id = null;
  var faceView = null;
  var P = App.ClipApp.Url.base;
  var UserModel = App.Model.extend({
    defaults:{
      name:"",
      id:"",
      follow:0,
      followby:0,
      face:"",
      relation:[]
    },
    url:function(){
      return App.ClipApp.encodeURI(P+"/user/"+ this.id + "/info");
    }
  });

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "userface-view",
    template: "#userface-view-template",
    events: {
      "click #user_zhui": "followAction",
      "click #user_stop": "stopAction",
      "click .following": "following",
      "click .follower": "follower",
      "mouseenter .user_head": "mouseEnter",
      "mouseleave .user_head": "mouseLeave",
      "focus #input_keyword" : "cleanDefault",
      "blur #input_keyword"  : "blurAction",
      "click #input_keyword" : "inputAction",
      "click .search_btn"    : "queryUser"
    },
    initialize: function(e){
      this.model.bind("change", this.render, this);
      this.bind("@show", this.show);
      this.bind("@change", this.change);
    },
    change: function(follow){
      var relation = this.model.get("relation");
      var followby = this.model.get("followby");
      if(_.isEmpty(relation) && !_.isEmpty(follow)){ // follow 成功 表示非空
	this.model.set("relation", follow);
	this.model.set("followby", followby > 0 ? followby + 1 : 1);
      }else if(!_.isEmpty(relation) && _.isEmpty(follow)){
	this.model.set("relation", []);
	this.model.set("followby", followby > 0 ? followby - 1 : 0);
      }
    },
    show: function(follow){
      var relation = this.model.get("relation");
      if(_.isEmpty(relation) && !_.isEmpty(follow)){ // follow 成功 表示非空
	this.model.set("relation", follow);
      }else if(!_.isEmpty(relation) && _.isEmpty(follow)){
	this.model.set("relation", []);
      }
    },
    mouseEnter: function(e){
      $(e.currentTarget).children(".user_i").show();
    },
    mouseLeave: function(e){
      $(e.currentTarget).children(".user_i").hide();
    },
    followAction: function(){
      App.vent.trigger("app.clipapp.bubb:follow",this.model.id,'*');
    },
    stopAction: function(){
      App.vent.trigger("app.clipapp.bubb:unfollow",this.model.id,'*');
    },
    following: function(){
      App.ClipApp.showFollowing(user_id);
    },
    follower: function(){
      App.ClipApp.showFollower(user_id);
    },
    cleanDefault: function(e){
      var def = null;
      if(App.ClipApp.isSelf(user_id)){
	def = _i18n('userface.mysearch');
      }else{
	def = _i18n('userface.search');
      }
      $(e.currentTarget).val($.trim($(e.currentTarget).val()) == def ? "" :$(e.currentTarget).val() );
    },
    blurAction:function(e){
      var def = null;
      if(App.ClipApp.isSelf(user_id)){
	def = _i18n('userface.mysearch');
      }else{
	def = _i18n('userface.search');
      }
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? def : $(e.currentTarget).val() );
    },
    inputAction: function(e){
      var view = this;
      var id = e.currentTarget.id;
      $(".text").unbind("keydown");
      $(".text").keydown(function(e){
	if(e.keyCode==13){ // 响应回车事件
	  view.queryUser();
	}
      });
    },
    queryUser: function(){
      var word = $.trim(this.$("#input_keyword").val());
      var def = null;
      if(App.ClipApp.isSelf(user_id)) def = _i18n('userface.mysearch');
      else def = _i18n('userface.search');
      if(word == def) word = null;
      App.ClipApp.userQuery(user_id, word);
    }
  });

  var getUser=function(uid,callback){
    var url = "";
    if(uid == App.ClipApp.getMyUid()){
      // url中带上随机数 防止ie的缓存导致不能向服务器发出请求
      url = App.ClipApp.encodeURI(P + "/my/info");
    }else{
      url = App.ClipApp.encodeURI(P + "/user/"+ uid + "/info");
    }
    var user=new UserModel();
    user.fetch({url: url});
    user.onChange(function(user){
      callback(user);
    });
  };

  Face.show = function(uid){
    user_id = uid;
    if(uid && uid !== undefined){
      if(App.ClipApp.Me.me.id == uid){
	faceView = new FaceView({model: App.ClipApp.Me.me});
	App.faceRegion.show(faceView);
      }else{
	getUser(uid, function(user){
	  faceView = new FaceView({model: user});
	  App.faceRegion.show(faceView);
	});
      }
    }else{
      faceView = null;
      App.faceRegion.close();
    }
  };

  Face.getUserId = function(){
    return user_id;
  };

  function change(follow){
    setTimeout(function(){
      if(faceView){ faceView.trigger("@change", follow); }
    }, 200);
  };

  App.vent.bind("app.clipapp.follow:success", function(follow){
    change(follow);
  });

  App.vent.bind("app.clipapp.unfollow:success", function(follow){
    change(follow);
  });

  App.vent.bind("app.clipapp.follow:get", function(follow){
    setTimeout(function(){
      if(faceView){ faceView.trigger("@show", follow); }
    }, 200);
  });

  // 当me改变之后face的modle有change事件会自动render
  App.vent.bind("app.clipapp.face:changed", function(){
    if(/my/.test(window.location.hash)){
      App.ClipApp.Face.show(App.ClipApp.getMyUid("id"));
    }
  });

  return Face;
})(App, Backbone, jQuery);