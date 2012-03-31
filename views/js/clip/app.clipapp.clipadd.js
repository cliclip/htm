App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;
  var _data = {};

  var ClipModel = App.Model.extend({
    url: function(){
      return P+"/clip";
    }
  });

  var AddClipView = App.ItemView.extend({
    tagName: "div",
    className: "addClip-view",
    template: "#addClip-view-template",
    events: {
      "click #exImg":"extImg",
      "change #formUpload": "image_change",
      "click #save":"save",
      "click #abandon":"abandon",
      "click #remark": "remark_newClip"
    },
    initialize: function(){
      _data = {content : []};
    },
    extImg:function(evt){
      var that = this;
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      that.editor.execCommand( "insertImage", [{"src":url}] );
    },
    image_change:function(e){
      var that = this;
      var uid = that.model.get("id");
      $("#img_form").submit();
      $("#post_frame").load(function(){ // 加载图片
	var returnVal = this.contentDocument.documentElement.textContent;
	if(returnVal != null && returnVal != ""){
	  var returnObj = eval(returnVal);
	  var imgObjs = [];
	  if(returnObj[0] == 0){
	    var imgids = returnObj[1];
	    for(var i=0;i<imgids.length;i++){
	      var imgid = imgids[i].split(":")[1];
	      var url = P+"/user/"+ uid+"/image/" +imgid;
	      imgObjs.push({src: url});
	    }
	  }
	}
	that.editor.execCommand( "insertImage", imgObjs );
      });
    },
    save: function(){
      var user = this.model.get("id");
      if(this.editor.hasContents()){
	this.editor.sync();
	var html = this.editor.getContent();
	console.log("html:: %j", html);
	_data.content = App.util.HtmlToContent(html);
	this.model.save(_data,{
	  url: P+"/clip",
	  type: 'POST',
	  success:function(response){
	    var cid = user+":";
	    // 临时处理
	    for(var i in response.toJSON()){
	      if(i != "content" && i!= "id")
		cid += i;
	    }
	    App.viewRegion.close();
	    // 如何只刷新一个region的内容
	    // location.reload();
	  },
	  error:function(response){
	    // 出现错误，触发统一事件
	    App.vent.trigger("app.clipapp.clipadd:error");
	  }
	});
      };
    },
    abandon: function(){
      // 直接返回详情页面
      App.vent.trigger("app.clipapp.clipadd:cancel");
    },
    remark_newClip: function(){
      App.vent.trigger("app.clipapp:clipmemo");
    }
  });

  ClipAdd.show = function(uid){
    var clipModel = new ClipModel({id: uid, actUrl:P+"/user/"+ uid+"/image"});
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    addClipView.editor = new baidu.editor.ui.Editor({
      toolbars:[['HighlightCode']],
      contextMenu:[] // 禁止右键菜单
    });
    addClipView.editor.render('addClip-container');
  };

  App.vent.bind("app.clipapp.clipadd:cancel", function(){
    App.viewRegion.close();
  });

  App.vent.bind("app.clipapp.clipadd:error", function(){
    console.info("addClip error");
  });

  App.vent.bind("app.clipapp.clipadd:memo", function(data){
    for(var i in data){
      _data[i] = data[i];
    }
  });

  return ClipAdd;

})(App, Backbone, jQuery);