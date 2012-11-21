App.ClipApp.WeiboEdit = (function(App, Backbone, $){
  var WeiboEdit = {};

  var WeiboEditModel = App.Model.extend({});

  var WeiboView = App.ItemView.extend({
    tagName: "div",
    className: "weiboEdit",
    template: "#weiboEdit-view-template",
    events: {
      "click #info_add":"WeiboAdd",
      "click .oauth_del":"WeiboCut"
    },
    initialize:function(){
      this.bind("@delete", delWeibo);
    },
    WeiboAdd:function(e){
      window.location.href= App.ClipApp.Url.hostname + "/oauth/req/weibo?forcelogin=true";
    },
    WeiboCut:function(e){
      e.preventDefault();
      var uid = e.currentTarget.id;
      var name = $.trim($("#name_"+uid).text());
      var view = this;
      App.ClipApp.showAlert("deloauth",name,function(){
	view.trigger("@delete",uid);
      });
    }
  });

  WeiboEdit.show = function(){
    var weiboModel = new App.Model.UserBindModel();
    var weiboRegion = new App.Region({el:"#weibo"});
    weiboModel.fetch({
      success:function(model, res){
	var list  = model.get("list");
	var result = [];
	if(list){
	  list.forEach(function(v){
	    if(v.provider == 'weibo') result.push(v);
	  });
	}
	var _model =  new WeiboEditModel({info:result});
	var view = new WeiboView({model: _model});
	weiboRegion.show(view);
      },
      error:function(model, error){}
    });
  };


  var delWeibo = function(uid){
    var model = new App.Model.UserBindModel({id:uid,provider:"weibo",oauth_id:uid,account:uid+"@weibo"});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	WeiboEdit.show();
      },
      error: function(model, res){
	if(res.unbind == "cannot_unbind"){
	  App.ClipApp.showConfirm("cannot_unbind", null, function(){});
	}else{
	  App.ClipApp.showAlert("del_oauth_fail");
	}
      }
    });
  };

  return WeiboEdit;

})(App, Backbone, jQuery);