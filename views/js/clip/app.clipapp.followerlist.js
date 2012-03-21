//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var start=0,end=3;
  var FollowerModel=App.Model.extend({
  defaults:{
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
  var FollowerListView=App.CollectionView.extend({
    tagName:"div",
    className:"follower-item",
    itemView:FollowerView
  });

  FollowerList.showUserFollower=function(uid){
    collection=new FollowerList();
    collection.url=App.ClipApp.Url.base+"/user/"+uid+"/follow/"+start+".."+end;
    collection.fetch();
    collection.onReset(function(followerlist){
      followerlist.each(function(follower){
	follower.set({id:uid});
      });
      var followerlistView=new FollowerListView({
	collection:followerlist
      });
			 console.info(followerlistView);
      App.listRegion.show(followerlistView);
    });
  };
  FollowerList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followerlist:close",function(){
    FollowerList.close();
  });

  return FollowerList;
})(App,Backbone,jQuery);