//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var start = 0;
  var end = App.ClipApp.Url.page-1;
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

    },
    followerOpen:function(e){
     
    }
  });

  FollowingList.showUserFollowing=function(uid){
    var options = {url:App.ClipApp.Url.base+"/user/"+uid+"/following"};
    collection=new FollowingList();
    options.collection = collection;
    collection.url=App.ClipApp.Url.base+"/user/"+uid+"/following/"+start+".."+end;
    collection.fetch();
    collection.onReset(function(followinglist){
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      App.listRegion.show(followinglistView);
      App.vent.trigger("app.clipapp.followerlist:scroll",followinglistView,options);
    });
  };
  FollowingList.close=function(){
    App.listRegion.close();
  };

  return FollowingList;
})(App,Backbone,jQuery);