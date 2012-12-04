App.ClipApp.TwitterEdit = (function(App, Backbone, $){
  var TwitterEdit = {};
  var TwitterEditModel = App.Model.extend({});

  var TwitterView = App.ItemView.extend({
    tagName: "div",
    className: "twitterEdit",
    template: "#twitterEdit-view-template",
    events: {
      "click #info_add":"TwitterAdd",
      "click .oauth_del":"TwitterCut"
    },
    initialize: function(){
      this.bind("@delete", delTwitter);
    },
    TwitterAdd:function(e){
      window.location.href=App.ClipApp.Url.hostname +"/oauth/req/twitter?force_login=true";
    },
    TwitterCut:function(e){
      e.preventDefault();
      var uid = e.currentTarget.id;
      var name = $.trim($("#name_"+uid).text());
      var view = this;
      var userName = App.ClipApp.UserEdit.faceRegion.currentView.model.get("name") || "";
      var isRandName = userName.match("@") ? true : false;
      if(isRandName){
	App.ClipApp.showConfirm("cannot_unbind", null, function(){});
	App.ClipApp.showSetName();
      }else{
	App.ClipApp.showAlert("deloauth",name,function(){
	  view.trigger("@delete",uid);
	});
      }
    }
  });

  TwitterEdit.show = function(){
    var twitterModel = new App.Model.UserBindModel({provider:"twitter"});
    var twitterRegion = new App.Region({el:"#twitter"});
    twitterModel.fetch({
      success:function(model, res){
	var list  = model.get("list");
	var result = [];
	if(list){
	  list.forEach(function(v){
	    if(v.provider == 'twitter') result.push(v);
	  });
	}
	var _model =  new TwitterEditModel({info:result});
	var view = new TwitterView({model: _model});
	twitterRegion.show(view);
      },
      error:function(model, error){}
    });
  };

  var delTwitter = function(uid){
    var model = new App.Model.UserBindModel({id:uid,provider:"twitter",oauth_id:uid,account:uid+"@twitter"});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	TwitterEdit.show();
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

  return TwitterEdit;

})(App, Backbone, jQuery);