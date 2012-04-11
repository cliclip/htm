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
      App.vent.trigger("app.clipapp.followinglist:show",App.ClipApp.Face.getUserId());
    },
    followerOpen:function(e){
      App.vent.trigger("app.clipapp.followerlist:show",App.ClipApp.Face.getUserId());
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
      if(flag) $(".user_list_info").css("display","none");
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
  });

  return FollowingList;
})(App,Backbone,jQuery);