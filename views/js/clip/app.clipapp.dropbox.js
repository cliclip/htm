App.ClipApp.DropboxEdit = (function(App, Backbone, $){
  var DropboxEdit = {};

  var DropboxEditModel = App.Model.extend({});

  var DropboxView = App.ItemView.extend({
    tagName: "div",
    className: "dropboxEdit",
    template: "#dropboxEdit-view-template",
    events: {
      "click #info_add":"DropboxAdd",
      "click .oauth_del":"DropboxCut"
    },
    initialize:function(){
      this.bind("@delete", delDropbox);
    },
    DropboxAdd:function(e){
      window.location.href="/oauth/req/dropbox?forcelogin=true";
    },
    DropboxCut:function(e){
      e.preventDefault();
      var uid = e.currentTarget.id;
      var name = $.trim($("#"+uid).siblings().text());
      var view = this;
      var userName = App.ClipApp.UserEdit.faceRegion.currentView.model.get("name") || "";
      var isRandName = userName.match("@") ? true : false;
      if(isRandName){
	App.ClipApp.showConfirm("cannot_unbind", null, function(){
	  App.ClipApp.showSetName();
	});
      }else{
	App.ClipApp.showAlert("deloauth",name,function(){
	  view.trigger("@delete",uid);
	});
      }
    }
  });

  DropboxEdit.show = function(){
    var dropboxModel = new App.Model.UserBindModel();
    var dropboxRegion = new App.Region({el:"#dropbox"});
    dropboxModel.fetch({
      success:function(model, res){
	var list  = model.get("list");
	var result = [];
	if(list){
	  list.forEach(function(v){
	    if(v.provider == 'dropbox') result.push(v);
	  });
	}
	var _model =  new DropboxEditModel({info:result});
	var view = new DropboxView({model: _model});
	dropboxRegion.show(view);
      },
      error:function(model, error){}
    });
  };


  var delDropbox = function(uid){
    var model = new App.Model.UserBindModel({id:uid,provider:"dropbox",oauth_id:uid,account:uid+"@dropbox"});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	DropboxEdit.show();
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

  return DropboxEdit;

})(App, Backbone, jQuery);