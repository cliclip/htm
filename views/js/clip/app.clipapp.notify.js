App.ClipApp.Notify=(function(App,Backbone,$){
  var Notify = {}, Loop = null;
  var P = App.ClipApp.Url.base;
  var NotifyModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/"+this.get("uid")+"/notice/count");
    }
  });
  var NotifyView =  App.ItemView.extend({
    tagName : "div",
    className : "notify-view",
    template:"#notify-view-template",
    events:{
      "click .close_w"     :"cancel"
    },
    initialize: function(){
      this.bind("@closeView",close);
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@closeView");
    }
  });
  Notify.show = function(uid){
    if(uid){
      fetch(uid);
      // Loop = setInterval(fetch,5000);
    }
  };

  var fetch = function(uid){
    var uid = App.ClipApp.getMyUid();
    var notify = new NotifyModel({uid:uid, count:0});
    notify.fetch({});
    notify.onChange(function(notifyModel){
      var notifyView = new NotifyView({model:notifyModel});
      var count = notifyModel.get("count");
      if(count != 0) App.notifyRegion.show(notifyView);
    });
  };

  Notify.close = function(){
    App.notifyRegion.close();
    clearInterval(Loop);
  };

  var close = function(){
    Notify.close();
  };

  return Notify;
})(App,Backbone,jQuery);
