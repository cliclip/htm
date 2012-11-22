//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var collection = {};
  var page = App.ClipApp.Url.page;
  var start = 1, end = page;
  var base_url = "", url = "";
  var collection_length, new_page, loading = false;
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
    end = page;
    base_url = App.ClipApp.Url.base+"/"+uid+"/following";
    url=App.ClipApp.encodeURI(base_url+"/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(followinglist){
      if(!_.isEmpty(followinglist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length == page ? true :false;
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      $("#follow").show();
      $("#list").hide();
      App.followRegion.show(followinglistView);
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8"))
	  $(document.body).scrollTop(0);
      }
      //console.info(App.followRegion.currentView.$el[0].className);
      setTimeout(function(){//IE8兼容性问题marionate也作了更改
	if(flag) $(".empty_user").css("display","none");
      },0);
    });
  };

  FollowingList.close=function(){
    App.followRegion.close();
  };

  App.vent.bind("app.clipapp:nextpage", function(){
    if(loading)return;
    if(!App.followRegion.currentView)return;
    if(App.followRegion.currentView.$el[0].className=="following-item"&&new_page){
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

  return FollowingList;

})(App,Backbone,jQuery);