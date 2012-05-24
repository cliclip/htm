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
      socket = new easyXDM.Socket({
	remote: 'http://clickdang.com/oauth/req/weibo?forcelogin=true&r='+Math.random()*9999999,
	container: document.body,
	swf: 'http://clickdang.com/img/easyxdm.swf',
	swfNoThrottle: true,
	onLoad: function(e){ // hack, style set
	  var iframe = e.target;
          var height = document.body.clientHeight;
          var width = document.body.clientWidth;
          iframe.setAttribute("scrolling", "no");
          iframe.setAttribute("frameBorder", "0");
          iframe.setAttribute("allowTransparency", "true");
          iframe.setAttribute("style", "border:0px; z-index:99999999;width:"+width+"px; height:"+height+"px; position:absolute; _position:absolute; left:0px; top:0px; _left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth); _top: expression(documentElement.scrollTop+documentElement.clientHeight-this.offsetHeight);");
      },
	onMessage: function(message, origin){
	  //console.log(arguments);
	  var r = JSON.parse(message);
	  switch(r[0]){
	    case 'oauth' : // for ui to set model after change
	      setTimeout(function(){
		//console.info(r[1]);
		App.vent.trigger("app.clipapp.userbind:bind",r[1]);
		closeUI();
		cleanSelection();
	      }, 1000);
	      break;
          }
	}
      });
      socket.postMessage(JSON.stringify(["ping"]));
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

  function closeUI(){
    socket.destroy();
  }

  function cleanSelection(){
    if (window.getSelection) {  // all browsers, except ie < 9
      var sel = window.getSelection ();
      sel.removeAllRanges();
    } else if (document.selection.createRange) { // ie
      document.selection.createRange();
      document.selection.empty();
    }
  }

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