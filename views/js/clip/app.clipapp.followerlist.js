//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var start = 0;
  var end = App.ClipApp.Url.page-1;
  var precliplength=0,flag=true;;
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
  var FollowerListView=App.CompositeView.extend({
    tagName:"div",
    className:"follow-item",
    template: "#follow-view-template",
    itemView:FollowerView,
    events : {
      "click #following" : "followingOpen"
    },
    followingOpen:function(evt){
      App.vent.trigger("app.clipapp.followinglist:show",App.ClipApp.Face.getUserId());
    }
  });

  FollowerList.showUserFollower=function(uid){
    var options = {url:App.ClipApp.Url.base+"/user/"+uid+"/follow"};
    collection=new FollowerList();
    options.collection = collection;
    collection.url=App.ClipApp.Url.base+"/user/"+uid+"/follow/"+start+".."+end;
    collection.fetch();
    collection.onReset(function(followerlist){
      followerlist.each(function(follower){
	follower.set({id:uid});
      });
      var followerlistView=new FollowerListView({
	collection:followerlist
      });
      App.listRegion.show(followerlistView);
      App.vent.trigger("app.clipapp.followerlist:scroll",followerlistView,options);
    });
  };

  App.vent.bind("app.clipapp.followerlist:scroll",function(view,options){
    $(document).scroll(function(evt){
      var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
      if(view.$el[0].scrollHeight > 0 &&$(window).height()+scrollTop-view.$el[0].scrollHeight>=100 ){
	if(options.collection.length-precliplength<end-start){
	    flag=false;
	}
	if(flag){
	  start += App.ClipApp.Url.page;
	  end += App.ClipApp.Url.page;
	  options.collection.url = options.url + "/" +start + ".." + end;
	  options.collection.fetch({add:true});
	  precliplength=options.collection.length;
	}
      }
    });
  });

  FollowerList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followerlist:close",function(){
    FollowerList.close();
  });
  App.vent.bind("app.clipapp.followerlist:show",function(uid){
    FollowerList.showUserFollower(uid);
  });
  // TEST
//App.bind("initialize:after", function(){ FollowerList.showUserFollower("4"); });

  return FollowerList;
})(App,Backbone,jQuery);