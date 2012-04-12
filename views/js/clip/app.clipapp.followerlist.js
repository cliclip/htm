//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var start = 0;
  var end = App.ClipApp.Url.page;
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
      App.vent.trigger("app.clipapp.followinglist:show",App.ClipApp.Face.getUserId());
    },
    followerOpen:function(evt){
      App.vent.trigger("app.clipapp.followerlist:show",App.ClipApp.Face.getUserId());
    }
  });

  FollowerList.showUserFollower=function(uid){
    var options = {},flag=false;
    var collection=new FollowerList({id:uid});
    options.params = collection;
    options.start = start;
    options.end = end;
    options.params.url =App.ClipApp.Url.base+"/user/"+uid+"/follow";
    options.url=options.params.url+"/"+start+".."+end;
    collection.fetch(options);
    collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      var followerlistView=new FollowerListView({
	collection:followerlist
      });
      App.listRegion.show(followerlistView);
      if(flag) $(".empty_user").css("display","none");
      App.vent.trigger("app.clipapp.util:scroll",followerlistView,options);
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
  });

  // TEST
//App.bind("initialize:after", function(){ FollowerList.showUserFollower("4"); });

  return FollowerList;
})(App,Backbone,jQuery);