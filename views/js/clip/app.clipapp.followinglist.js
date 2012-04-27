//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var options = {};
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
    var flag=false;
    var collection=new FollowingList();
    options.collection=collection;
    //if(!options.start &&! options.end){
      options.start = 1;
      options.end = App.ClipApp.Url.page;
    //}
    options.add = false;
    options.base_url = App.ClipApp.Url.base+"/user/"+uid+"/following";
    options.url=options.base_url+"/"+options.start+".."+options.end;
    options.collection.fetch(options);
    options.collection.onReset(function(followinglist){
      if(!_.isEmpty(followinglist.toJSON())) flag=true;
      options.collection_length = options.collection.length;
      options.fetch_flag = options.collection.length==App.ClipApp.Url.page ? true :false;
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      $("#list").css({height:"auto"});
      App.listRegion.show(followinglistView);
      //console.info(App.listRegion.currentView.$el[0].className);
      if(flag) $(".empty_user").css("display","none");
      App.vent.trigger("app.clipapp:showpage");
      //App.vent.trigger("app.clipapp.page:next",options);
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

  App.vent.bind("app.clipapp:nextpage",function(){
    if(App.listRegion.currentView.$el[0].className=="following-view"&&options.fetch_flag){
    //if(options.fetch_flag){
      options.start += App.ClipApp.Url.page;
      options.end += App.ClipApp.Url.page;
      options.url = options.base_url + "/" +options.start + ".." + options.end;
      options.add = true;
      options.error = function(){ options.fetch_flag = false; };
      options.success = function(){
	if(options.collection.length-options.collection_length>=App.ClipApp.Url.page){
	  options.collection_length = options.collection.length;
	}else{
	  options.fetch_flag = false;
	}
      };
      options.collection.fetch(options);
    }
  });

  return FollowingList;
})(App,Backbone,jQuery);