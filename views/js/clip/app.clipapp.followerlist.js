//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var precliplength=0;
  var options = {};
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
      App.vent.trigger("app.clipapp:showfollowing", uid);
    },
    followerOpen:function(evt){
      var uid = App.ClipApp.Face.getUserId();
      App.vent.trigger("app.clipapp.showfollower",uid);
    }
  });

  FollowerList.showUserFollower=function(uid){
    var flag=false;
    var collection=new FollowerList({id:uid});
    options.collection=collection;
    //if(!options.start &&! options.end){
      options.start = 1;
      options.end = App.ClipApp.Url.page;
    //}
    options.add = false;
    options.base_url =App.ClipApp.Url.base+"/user/"+uid+"/follow";
    options.url=options.base_url+"/"+options.start+".."+options.end;
    options.collection.fetch(options);
    options.collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      options.collection_length = options.collection.length;
      options.fetch_flag = options.collection.length==App.ClipApp.Url.page ? true :false;
      var followerlistView = new FollowerListView({collection:followerlist});
      $("#list").css({height:"auto"});
      App.listRegion.show(followerlistView);
      //console.info(App.listRegion.currentView.$el[0].className);
      if(flag) $(".empty_user").css("display","none");
      App.vent.trigger("app.clipapp:showpage");
      //App.util.list_scroll(options);
      //App.vent.trigger("app.clipapp.page:next",options);
    });
  };

  FollowerList.close=function(){
    App.listRegion.close();
  };
  App.vent.bind("app.clipapp.followerlist:close",function(){
    FollowerList.close();
  });
  
  // 作用不明
  App.vent.bind("app.clipapp.followerlist:refresh",function(){
    if(App.listRegion.currentView.className =='follow-item'){
      var uid= App.util.getMyUid();
      var id = App.ClipApp.Face.getUserId();
      if(uid)App.vent.trigger("app.clipapp.showfollower",uid);
      else App.vent.trigger("app.clipapp:login");
    }
  });

  App.vent.bind("app.clipapp:nextpage",function(){
    if(App.listRegion.currentView.$el[0].className=="follow-item"&&options.fetch_flag){
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

  return FollowerList;
})(App,Backbone,jQuery);