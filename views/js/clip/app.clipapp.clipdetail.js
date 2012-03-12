App.ClipApp.ClipDetail = (function(App, Backbone, $){
  var ClipDetail = {};
  var P = App.ClipApp.Url.base;

  var DetailModel = App.Model.extend({
    url: function(){
      return P+"/clip/"+this.id;
    }
  });

  var DetailView = App.ItemView.extend({
    tagName: "div",
    className: "Detail-view",
    template: "#detail-view-template",
    events: {
      "click .operate" : "Operate"
    },
    Operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).val();
      var user = this.model.get("user");
      var cid = user+":"+this.model.id;
      switch(opt){
	case '收':
	  App.vent.trigger("app.clipapp:reclip", cid);break;
	case '转':
	  App.vent.trigger("app.clipapp:recommed", cid);break;
	case '评':
	  App.vent.trigger("app.clipapp:comment", cid);break;
	case '注':
	  App.vent.trigger("app.clipapp:remark", cid);break;
	case '改':
	  App.vent.trigger("app.clipapp:clipedit", cid);break;
	case '删':
	  App.vent.trigger("app.clipapp:remove", cid);break;
      }
    }
  });

  // 显示clip的detail内容 [clipDetiail 以及 Comment]
  var showDetail = function(detailModel){
    var detailView = new DetailView({
      model: detailModel
    });
    App.viewRegion.show(detailView);
  };

  ClipDetail.show = function(cid){
    document.cookie = "token=2:551ccf95e69955875a77121236e59c7c";
    var clip = new DetailModel({id: cid});
    clip.fetch(); // 获得clip详情 detail需要进行url地址的bookmark
    clip.onChange(function(detailModel){
      var self = document.cookie.split("=")[1].split(":")[0];
      // var self = "2";
      var user = detailModel.get("user");
      if(user == self){
	detailModel.set("manage",["注","改","删"]);
      }else{
	detailModel.set("manage",["收","转","评"]);
      }
      detailModel.set("users",[]);
      showDetail(detailModel);
      // commentList和addComment对话框 的显示都要依靠clipdetail
      App.vent.trigger("clip:getComment", cid);
      App.vent.trigger("clip:addComment", cid);
    });
  };

  return ClipDetail;
})(App, Backbone, jQuery);