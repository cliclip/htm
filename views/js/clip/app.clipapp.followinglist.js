//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var start = 0;
  var end = App.ClipApp.Url.page;
  var FollowingModel=App.Model.extend({
      defaults:{
	user:[]
      }
  });
  var FollowingList=App.Collection.extend({
    model:FollowingModel
  });
  var FollowingView=App.ItemView.extend({
    tagName:"div",
    template:"#following-view-template"
  });
  var FollowingListView=App.CompositeView.extend({
    tagName:"div",
    className:"following-item",
    template:"#following-top-view-template",
    itemView:FollowingView,
    events:{
      "click #following" : "followingOpen",
      "click #follower" : "followerOpen"
    },
    followingOpen:function(e){
      var uid = App.ClipApp.Face.getUserId();
      App.vent.trigger("app.clipapp.followinglist:show", uid);
    },
    followerOpen:function(e){
      var uid = App.ClipApp.Face.getUserId();
      App.vent.trigger("app.clipapp.followerlist:show",uid);
    }
  });

  FollowingList.showUserFollowing=function(uid){
    var options = {},flag=false;
    var collection=new FollowingList();
    options.params = collection;
    options.start = start;
    options.end = end;
    options.params.url = App.ClipApp.Url.base+"/user/"+uid+"/following";
    options.url=options.params.url+"/"+start+".."+end;
    collection.fetch(options);
    collection.onReset(function(followinglist){
      if(!_.isEmpty(followinglist.toJSON())) flag=true;
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      App.listRegion.show(followinglistView);
      if(flag) $(".empty_user").css("display","none");
      App.vent.trigger("app.clipapp.util:scroll",followinglistView,options);
    });
  };
  FollowingList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followinglist:close",function(){
    FollowingList.close();
  });
  App.vent.bind("app.clipapp.followinglist:show",function(uid){
    FollowingList.showUserFollowing(uid);
    var my = App.util.getMyUid();
    if(my == uid){
      App.vent.trigger("app.clipapp.routing:myfollowinglist:show");
    }else{
      App.vent.trigger("app.clipapp.routing:userfollowinglist:show", uid);
    }
  });

  return FollowingList;
})(App,Backbone,jQuery);