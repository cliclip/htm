App.ClipApp.WeiboEdit = (function(App, Backbone, $){
  var WeiboEdit = {};
  var P = App.ClipApp.Url.base;

  var WeiboEditModel = App.Model.extend({});

  var WeiboView = App.ItemView.extend({
    tagName: "div",
    className: "weiboEdit",
    template: "#weiboEdit-view-template",
    events: {
      "click #info_add":"WeiboAdd",
      "click .info_name":"WeiboCut"
    },
    WeiboAdd:function(e){
      window.location.href="/oauth/req/weibo?forcelogin=true";
    },
    WeiboCut:function(e){
      e.preventDefault();
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      var uid = e.currentTarget.id;
      var name = $.trim($("#name_"+uid).text());
      App.vent.trigger("app.clipapp.message:alert", "deloauth", name);
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.weibo:@weibodel",uid);
      });
    }
  });

  WeiboEdit.show = function(){
    var weiboModel = new App.Model.UserBindModel({provider:"weibo"});
    var weiboRegion = new App.Region({el:"#weibo"});
    weiboModel.fetch();
    weiboModel.onChange(function(model){
      var view = new WeiboView({model: model});
      weiboRegion.show(view);
    });
  };

  App.vent.bind("app.clipapp.userbind:ok",function(){
    WeiboEdit.show();
  });

  App.vent.bind("app.clipapp.weibo:@weibodel",function(uid){
  var model = new App.Model.UserBindModel({id:uid,provider:"weibo",oauth_id:uid});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	WeiboEdit.show();
      },
      error: function(model, res){
	console.info(res);
      }
    });
  });

  return WeiboEdit;

})(App, Backbone, jQuery);