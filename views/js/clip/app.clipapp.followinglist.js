//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var collection = {};
  var start = 1;
  var end = App.ClipApp.Url.page;
  var url = "";
  var base_url = "";
  var new_page;
  var collection_length;
  var loading = false;
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
      App.vent.trigger("app.clipapp:showfollowing", uid);
    },
    followerOpen:function(e){
      var uid = App.ClipApp.Face.getUserId();
      App.vent.trigger("app.clipapp:showfollower", uid);
    }
  });

  FollowingList.showUserFollowing=function(uid){
    var flag=false;
    collection=new FollowingList();
    start = 1;
    end = App.ClipApp.Url.page;
    base_url = App.ClipApp.Url.base+"/user/"+uid+"/following";
    url=App.util.unique_url(base_url+"/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(followinglist){
      if(!_.isEmpty(followinglist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length==App.ClipApp.Url.page ? true :false;
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      $("#list").css({height:"auto"});
      App.listRegion.show(followinglistView);
      if( $(window).scrollTop()>100){
	window.location.href="javascript:scroll(0,100)";
      }
      //console.info(App.listRegion.currentView.$el[0].className);
      if(flag) $(".empty_user").css("display","none");
      App.vent.trigger("app.clipapp:showpage");
    });
  };
  FollowingList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followinglist:close",function(){
    FollowingList.close();
  });

  App.vent.bind("app.clipapp:nextpage",function(){
    if(loading)return;
    if(!App.listRegion.currentView)return;
    if(App.listRegion.currentView.$el[0].className=="following-item"&&new_page){
      loading = true;
      start += App.ClipApp.Url.page;
      end += App.ClipApp.Url.page;
      url = App.util.unique_url(base_url + "/" + start + ".." + end);
      collection.fetch({
	url:url,
	add:true,
	error :function(){
	  new_page = false;
	  loading = false;
	},
	success :function(){
	  if(collection.length-collection_length>=App.ClipApp.Url.page){
	    collection_length = collection.length;
	  }else{
	    new_page = false;
	  }
	  setTimeout(function(){
	    loading = false;
	  },500);
	}
      });
    }
  });
  return FollowingList;

})(App,Backbone,jQuery);