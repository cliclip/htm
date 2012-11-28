App.ClipApp.Share = (function(App, Backbone, $){
  var Share = {};
  var P = App.ClipApp.Url.base;

  var ShareModel = App.Model.extend({});
  var ShareView = App.DialogView.extend({
    tagName : "div",
    className : "share-view",
    template : "#share-view-template",
    events : {
      "click #copy"     : "copy",
      "click .masker"      : "masker",
      "click .close_w"  : "cancel",
      "click #cancel"   : "cancel"
    },
    initialize: function(){
      this.bind("@closeView", close);
    },
    copy: function(e){
      e.preventDefault(); //TODO
      var link = $.trim($("#shareLink_text").val());
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel: function(){
      this.trigger("@closeView");
    }
  });

  Share.close = function(){
    App.popRegion.close();
  };

  var close = Share.close;



  Share.show = function(cid, pub, preview){
    if(pub == true || pub == "true"){
      publicShare(cid, preview);
    }else{
      privateShare(cid);
    }
  };

  var publicShare =  function(cid, preview){
    var shareModel = new ShareModel({id: cid,"public": true});
    var shareTo = preview;
    var shareTo_title = shareTo.text ? shareTo.text : _i18n('snsShare.summary');
    var shareTo_img = shareTo.image ? shareTo.image.src : "" ;
    shareModel.set("shareTo",["tsina", "renren", "qzone","tqq","fb","twitter"]);
    shareModel.set("shareTo_title", shareTo_title);
    shareModel.set("shareTo_img", shareTo_img);
    shareModel.set("linkAddress", window.location.href);
    var shareView = new ShareView({model : shareModel});
    App.popRegion.show(shareView);
  };

  var privateShare = function(id){
    var uid = App.util.getMyUid();
    var cid = id.split(":")[1];
    var shareModel = new ShareModel({id: cid,"public": false});
    var linkModel = new App.Model();
      linkModel.save({},{
	url: App.ClipApp.encodeURI(P+"/"+uid+"/"+cid+'/sharelink'),
	type: "POST",
	success:function(model,res){
	  model.onChange(function(){
	    var host = window.location.host;
	    shareModel.set("linkAddress", host+"/#link/"+res);
	    var shareView = new ShareView({model : shareModel});
	    App.popRegion.show(shareView);
	  });
	},
	error:function(model,error){
	  App.ClipApp.showConfirm(error, null, function(){});
	}
      });

  };

  return Share;
})(App, Backbone, jQuery);