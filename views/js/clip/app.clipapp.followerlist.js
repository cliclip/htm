//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var precliplength=0;
  var collection = {};
  var page = App.ClipApp.Url.page;
  var start = 1, end = page;
  var base_url = "", url = "";
  var collection_length, new_page, loading = false;
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
      App.ClipApp.showFollowing(App.ClipApp.getFaceUid());
    },
    followerOpen:function(evt){
      App.ClipApp.showFollower(App.ClipApp.getFaceUid());
    }
  });

  FollowerList.showUserFollower=function(uid){
    var flag=false;
    collection=new FollowerList({id:uid});
    start = 1;
    end = page;
    base_url = App.ClipApp.Url.base +"/"+uid+"/follow";
    url=App.ClipApp.encodeURI(base_url+"/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length == page ? true :false;
      var followerlistView = new FollowerListView({collection:followerlist});
      $("#follow").show();
      $("#list").hide();
      $("#notice").hide();
      App.followRegion.show(followerlistView);
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8")){
	  $(document.body).scrollTop(0);
	}
      }
      //console.info(App.followRegion.currentView.$el[0].className);
      setTimeout(function(){//IE8兼容性问题marionate也作了更改
   	if(flag) $(".empty_user").css("display","none");
      },0);
    });
  };

  FollowerList.close=function(){
    App.followRegion.close();
  };

  // 更新“谁追我”列表
  App.vent.bind("app.clipapp.unfollow:success", function(){ refresh(); });
  App.vent.bind("app.clipapp.follow:success", function(){ refresh(); });

  function refresh(){
    if(App.followRegion.currentView && App.followRegion.currentView.$el[0].className =='follow-item'){
      FollowerList.showUserFollower(App.ClipApp.getFaceUid());
    }
  };

  App.vent.bind("app.clipapp:nextpage", function(){
    if(loading)return;
    if(!App.followRegion.currentView)return;
    if(App.followRegion.currentView.$el[0].className=="follow-item"&&new_page){
      loading = true;
      start += page;
      end += page;
      url = App.ClipApp.encodeURI(base_url + "/" + start + ".." + end);
      collection.fetch({
	url:url,
	add:true,
	error :function(){
	  new_page = false;
	  loading = false;
	},
	success :function(){
	  if(collection.length-collection_length >= page){
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