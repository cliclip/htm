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
    template:"#following-view-template",
    onRender:function(){//动态设置宽度
      var tags_num=this.model.get("tag").length;
      var widths = tags_num*58+"px";
      this.$(".items").css({width:widths});
    },
    events:{
      "mouseover .box"      :  "MouseOver"
    },
    MouseOver:function(e){
      var XPath = this.$(".box").offset().left;
      var MouseX = e.pageX;
      var left =MouseX-XPath;
      var tags_num=this.model.get("tag").length;
      var widths = tags_num*58;
      var position = "-"+(left/545)*(widths-545)+"px";
      this.$(".items").css({left:position});
    }

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
      App.ClipApp.showFollowing(App.ClipApp.getFaceUid());
    },
    followerOpen:function(e){
      App.ClipApp.showFollower(App.ClipApp.getFaceUid());
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
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
      }
      //console.info(App.listRegion.currentView.$el[0].className);
      setTimeout(function(){//IE8兼容性问题marionate也作了更改
	if(flag) $(".empty_user").css("display","none");
      },0);
    });
  };
			     
  FollowingList.close=function(){
    App.listRegion.close();
  };

  App.vent.bind("app.clipapp:nextpage", function(){
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