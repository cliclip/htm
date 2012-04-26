//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var precliplength=0;
  var FollowerModel=App.Model.extend({
    defaults:{
      uid:"",
      user:{},
      tag:""
    }
  });
  var FollowerList=App.Collection.extend({
    model:FollowerModel
  });
  var FollowerView=App.ItemView.extend({
    tagName:"div",
    template:"#follower-view-template"
  });
  var FollowerListView=App.CompositeView.extend({
    tagName:"div",
    className:"follow-item",
    template: "#follow-view-template",
    itemView:FollowerView,
    events : {
      "click #following" : "followingOpen",
      "click #follower" : "followerOpen"
    },
    followingOpen:function(evt){
      var uid = App.ClipApp.Face.getUserId();
      App.vent.trigger("app.clipapp.followinglist:show", uid);
    },
    followerOpen:function(evt){
      var uid = App.ClipApp.Face.getUserId();
      App.vent.trigger("app.clipapp.followerlist:show",uid);
    }
  });

  FollowerList.showUserFollower=function(uid){
    var options = {},flag=false;
    var collection=new FollowerList({id:uid});
    options.collection=collection;
    if(!options.start &&! options.end){
      options.start = 1;
      options.end = App.ClipApp.Url.page;
    }
    options.base_url =App.ClipApp.Url.base+"/user/"+uid+"/follow";
    options.url=options.base_url+"/"+options.start+".."+options.end;
    options.collection.fetch(options);
    options.collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      var followerlistView=new FollowerListView({
	collection:followerlist
      });
      $("#list").css({height:"0px"});
      App.listRegion.show(followerlistView);
      if(flag) $(".empty_user").css("display","none");
      //App.util.list_scroll(options);
      App.vent.trigger("app.clipapp.page:next",options);
    });
  };

  FollowerList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followerlist:close",function(){
    FollowerList.close();
  });
  App.vent.bind("app.clipapp.followerlist:show",function(uid){
    FollowerList.showUserFollower(uid);
    var my = App.util.getMyUid();
    if(uid == my){
      App.vent.trigger("app.clipapp.routing:myfollowerlist:show");
    }else{
      App.vent.trigger("app.clipapp.routing:userfollowerlist:show", uid);
    }
  });

  return FollowerList;
})(App,Backbone,jQuery);