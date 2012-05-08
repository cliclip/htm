//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var precliplength=0;
  var collection = {};
  var start = 1;
  var end = App.ClipApp.Url.page;
  var url = "";
  var base_url = "";
  var new_page;
  var collection_length;
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
    collection=new FollowerList({id:uid});
    start = 1;
    end = App.ClipApp.Url.page;
    base_url =App.ClipApp.Url.base+"/user/"+uid+"/follow";
    url=base_url+"/"+start+".."+end;
    collection.fetch({url:url});
    collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length==App.ClipApp.Url.page ? true :false;
      var followerlistView = new FollowerListView({collection:followerlist});
      $("#list").css({height:"auto"});
      App.listRegion.show(followerlistView);
      //console.info(App.listRegion.currentView.$el[0].className);
      if(flag) $(".empty_user").css("display","none");
      App.vent.trigger("app.clipapp:showpage");
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
    if(!App.listRegion.currentView)return;
    if(App.listRegion.currentView.$el[0].className=="follow-item"&&new_page){
      start += App.ClipApp.Url.page;
      end += App.ClipApp.Url.page;
      url = base_url + "/" + start + ".." + end;
      collection.fetch({
	url:url,
	add:true,
	error :function(){ new_page = false; },
	success :function(){
	  if(collection.length-collection_length>=App.ClipApp.Url.page){
	    collection_length = collection.length;
	  }else{
	    new_page = false;
	  }
	}
      });
    }
  });

  return FollowerList;
})(App,Backbone,jQuery);