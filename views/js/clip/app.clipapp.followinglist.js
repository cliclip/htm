//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var start=0,end=3;
  var FollowingModel=App.Model.extend({
  defaults:{
      user:"",
      tag:[],
      face:"../img/a.jpg"
    }
  });
  var FollowingList=App.Collection.extend({
    model:FollowingModel
  });
  var FollowingView=App.ItemView.extend({
    tagName:"div",
    template:"#following-view-template"
  });
  var FollowingListView=App.CollectionView.extend({
    tagName:"div",
    className:"following-item",
    itemView:FollowingView
  });

  FollowingList.showUserFollowing=function(uid){
    collection=new FollowingList();
    collection.url=App.ClipApp.Url.base+"/user/"+uid+"/following/"+start+".."+end;
    //collection.url="/test/following.json";
    collection.fetch();
    collection.onReset(function(followinglist){
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      App.listRegion.show(followinglistView);
    });
  };
  FollowingList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followinglist:close",function(){
    FollowingList.close();
  });

  return FollowingList;
})(App,Backbone,jQuery);