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
  var loading = false;
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
    template:"#follower-view-template",
    onRender:function(){
      var user_num = this.model.get("user").length;
      var widths = user_num*58+"px";
      this.$(".items").css({width:widths});
    },
    events:{
      "mouseover .box"   :  "MouseOver"
    },
    MouseOver:function(e){
      var XPath = this.$(".box").offset().left;
      var MouseX = e.pageX;
      var left =MouseX-XPath;
      var user_num = this.model.get("user").length;
      var widths = user_num*53;
      var position = "-"+(left/545)*(widths-545)+"px";
      this.$(".items").css({left:position});
    }

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
      App.ClipApp.showFollowing(uid);
    },
    followerOpen:function(evt){
      var uid = App.ClipApp.Face.getUserId();
      App.ClipApp.showFollower(uid);
    }
  });

  FollowerList.showUserFollower=function(uid){
    var flag=false;
    collection=new FollowerList({id:uid});
    start = 1;
    end = App.ClipApp.Url.page;
    base_url =App.ClipApp.Url.base+"/user/"+uid+"/follow";
    url=App.util.unique_url(base_url+"/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length==App.ClipApp.Url.page ? true :false;
      var followerlistView = new FollowerListView({collection:followerlist});
      $("#list").css({height:"auto"});
      App.listRegion.show(followerlistView);
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
      }
      //console.info(App.listRegion.currentView.$el[0].className);
      setTimeout(function(){//IE8兼容性问题marionate也作了更改
   	if(flag) $(".empty_user").css("display","none");
      },0);
    });
  };

  FollowerList.close=function(){
    App.listRegion.close();
  };

  // 更新“谁追我”列表
  App.vent.bind("app.clipapp.unfollow:success", function(){ refresh(); });
  App.vent.bind("app.clipapp.follow:success", function(){ refresh(); });

  function refresh(){
    if(App.listRegion.currentView.className =='follow-item'){
      if(App.ClipApp.isLoggedIn()){
	var id = App.ClipApp.Face.getUserId();
	FollowerList.showUserFollower(id);
      }else App.ClipApp.showLogin();
    }
  };

  App.vent.bind("app.clipapp:nextpage", function(){
    if(loading)return;
    if(!App.listRegion.currentView)return;
    if(App.listRegion.currentView.$el[0].className=="follow-item"&&new_page){
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

  return FollowerList;
})(App,Backbone,jQuery);