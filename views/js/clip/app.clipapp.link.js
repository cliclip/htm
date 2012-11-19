App.ClipApp.Link = (function(App, Backbone, $){
  var Link = {};
  var P = App.ClipApp.Url.base;
  var LinkModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/link/"+this.get('link'));
    }
  });

  Link.consume = function(link, value){
    var model = new LinkModel({link:link});
    model.save(value,{
      type: "GET",
      success:function(model,res){ // 不只是弹出提示框这么简单
	var act = res.act;
	var val = res.val;
	if(act == 'active'){
	  App.ClipApp.showConfirm({active:"email"}, val.email);
	  App.vent.trigger("app.clipapp.login:gotToken", val);
	}else if(act == 'invite'){
	  App.vent.trigger("app.clipapp.register:gotToken","invite",val);
	}else if(act == 'resetPass'){
	  var link = val.link;
	  document.cookie = "link="+link;
	  App.ClipApp.ResetPass.show();
	}else if(act == 'share'){
	  var clipid = val.clipid;
	  document.cookie = "share="+clipid;
	  var uid = clipid.split(":")[0];
	  var id = clipid.split(":")[1];
	  App.ClipApp.clipDetail(uid, id, link);
	}
      },
      error:function(model,error){ // 则显示该链接不能再点击
	App.ClipApp.showConfirm(error, null, function(){});
      }
    });
  };

  return Link;
})(App, Backbone, jQuery);