App.ClipApp.Notice=(function(App,Backbone,$){
  var Notice= {};
  var P = App.ClipApp.Url.base;
  var page = App.ClipApp.Url.page;
  var start = 1, end = page;
  var collection_length, new_page, loading = false;
  var collection = {};

  var NoticeModel = App.Model.extend({});
  var DelModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/"+this.get("uid")+"/notice/"+this.get("id"));
    }
  });
  var NoticeList= App.Collection.extend({
    model:NoticeModel
  });

  var NoticeView =  App.ItemView.extend({
    tagName : "div",
    className : "notice-view",
    template:"#notice-view-template",
    events:{
      "mouseenter .comment"  :"showDel",
      "mouseleave .comment"  :"hideDel",
      "click .close_w"       :"del_message"
    },
    initialize : function(){
      this.bind("@delNotice", delNotice);
    },
    showDel : function(e){
      $(e.currentTarget).children(".close_w").toggle();
    },
    hideDel : function(e){
      $(e.currentTarget).children(".close_w").toggle();
    },
    del_message:function(e){
      e.preventDefault();
      var view = this;
      var cid = this.model.cid;
      var id = e.currentTarget.id;
      App.ClipApp.showAlert("del_notice", null, function(){
	  view.trigger("@delNotice",cid, id);
	});
      }
    });

  var delNotice = function(cid, timestamp){
    var uid = App.util.getMyUid();
    var tmpmodel =  new DelModel({uid:uid, id:timestamp})
    tmpmodel.destroy({
      success:function(model, res){
	collection.remove(collection.getByCid(cid));
	if(_.isEmpty(collection.toJSON())){
	  setTimeout(function(){
	    $(".empty").css("display","block");
	  },0);
	}
      },
      error:function(model, res){}
    });
  };

  var NoticeListView=App.CompositeView.extend({
    tagName:"div",
    className:"notice-item",
    template:"#notice-top-view-template",
    itemView:NoticeView,
    events:{

    }
  });

  Notice.show = function(uid){
    var flag = false;
    collection = new NoticeList();
    start = 1;
    end = page;
    var url =  App.ClipApp.encodeURI(P+"/"+uid+"/notice/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(noticeList){
      if(!_.isEmpty(noticeList.toJSON())) flag = true;
      collection_length = collection.length;
      new_page = collection.length == page ? true :false;
      var noticeListView = new NoticeListView({collection:noticeList});
      $("#follow").hide();
      $("#list").hide();
      $("#notice").show();
      App.noticeRegion.show(noticeListView);
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8"))
	  $(document.body).scrollTop(0);
      }
      setTimeout(function(){
	if(flag) $(".empty").css("display","none");
      },0);
    });
  };

  App.vent.bind("app.clipapp:nextpage", function(){
    if(loading)return;
    if(!App.noticeRegion.currentView)return;
    if(App.noticeRegion.currentView.$el[0].className=="notice-item"&&new_page){
      loading = true;
      start += page;
      end += page;
      var uid = App.util.getMyUid();
      var url =  App.ClipApp.encodeURI(P+"/"+uid+"/notice/"+start+".."+end);
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

  return Notice;
})(App,Backbone,jQuery);
