App.ClipApp.TwitterEdit = (function(App, Backbone, $){
  var TwitterEdit = {};
  var P = App.ClipApp.Url.base;

  var TwitterEditModel = App.Model.extend({});

  var TwitterView = App.ItemView.extend({
    tagName: "div",
    className: "twitterEdit",
    template: "#twitterEdit-view-template",
    events: {
      "click #info_add":"TwitterAdd",
      "click .oauth_del":"TwitterCut"
    },
    TwitterAdd:function(e){
      window.location.href="/oauth/req/twitter?force_login=true";
    },
    TwitterCut:function(e){
      e.preventDefault();
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      var uid = e.currentTarget.id;
      var name = $.trim($("#name_"+uid).text());
      App.vent.trigger("app.clipapp.message:alert", "deloauth", name);
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.weibo:@twitterdel",uid);
      });
    }
  });

  TwitterEdit.show = function(){
    var twitterModel = new App.Model.UserBindModel({provider:"twitter"});
    var twitterRegion = new App.Region({el:"#twitter"});
    twitterModel.fetch();
    twitterModel.onChange(function(model){
      var view = new TwitterView({model: model});
      twitterRegion.show(view);
    });
  };

  App.vent.bind("app.clipapp.userbind:ok",function(){
    WeiboEdit.show();
  });

  App.vent.bind("app.clipapp.weibo:@twitterdel",function(uid){
  var model = new App.Model.UserBindModel({id:uid,provider:"twitter",oauth_id:uid});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	TwitterEdit.show();
      },
      error: function(model, res){
	console.info(res);
      }
    });
  });

  return TwitterEdit;

})(App, Backbone, jQuery);