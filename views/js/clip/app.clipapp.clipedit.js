App.ClipApp.ClipEdit = (function(App, Backbone, $){
  var ClipEdit = {};
  var P = App.ClipApp.Url.base;
  var _data = {};

  var EditModel = App.Model.extend({
    url : function(){
      return P+"/clip/"+this.id;
    }
  });

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      "click #exImg":"extImg",
      "change #formUpload": "image_change",
      "click #upformat":"upFormat",
      "click #edit_remark":"remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click #editClip_Abandon":"abandonUpdate"
    },

    initialize: function(){
      _data = {content : []};
    },
    extImg:function(evt){
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      this.editor.execCommand( "insertImage", [{"src":url}] );
    },
    image_change:function(e){
      var that = this;
      var uid = this.model.get("uid");
      var change = App.util.isImage("formUpload");
      if(change){
	$("#img_form").submit();
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    var imgObj = [];
	    if(returnObj[0] == 0){
	      var imgids = returnObj[1];
	      for(var i=0;i<imgids.length;i++){
		var imgid = imgids[i].split(":")[1];
		var url = P+"/user/"+ uid+"/image/" +imgid;
		imgObj.push({src: url});
	      }
	    }
	  }
	  that.editor.execCommand( "insertImage", imgObj );
	});
      }else{
	alert("图片格式无效");
      }
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      console.info("调整页面格式");
    },
    remarkClip:function(){
      var user = this.model.get("user");
      var cid = user+":"+this.model.id;
      var tag = this.model.get("tag");
      var note = this.model.get("note");
      var pub = this.model.get("public");
      App.vent.trigger("app.clipapp:clipmemo", cid, tag, note, pub);
      // App.OrganizeApp.open(cid);
    },
    saveUpdate: function(){
      var user = this.model.get("user");
      var cid = user+":"+this.model.id;
      if(this.editor.hasContents()){
	this.editor.sync();
	var html = this.editor.getContent();
	_data.content = App.util.HtmlToContent(html);
	this.model.save(_data,{
	  url: P+"/clip/"+cid,
	  type: 'PUT',
	  success:function(response){
	    App.viewRegion.close();
	    // App.vent.trigger("app.clipapp:clipdetail", cid);
	  },
	  error:function(response){
	    // 出现错误，触发统一事件
	    // App.vent.trigger("app.clipapp.clipedit:error", cid);
	  }
	});
      }
    },
    abandonUpdate: function(){
      // 直接返回详情页面
      var user = this.model.get("user");
      var cid =	user+":"+this.model.id;
      App.vent.trigger("app.clipapp:clipdetail", cid);
    }
  });

  ClipEdit.show = function(clipid, uid){
    var editModel = new EditModel({
      id: clipid,
      uid: uid,
      actUrl:P+"/user/"+uid+"/image"
    });
    editModel.fetch();
    editModel.onChange(function(editModel){
      var editView = new EditView({model: editModel});
      App.viewRegion.show(editView);
      editView.editor = new baidu.editor.ui.Editor({
	toolbars:[['HighlightCode']],
	contextMenu:[] // 禁止右键菜单
      });
      editView.editor.render('editClip-container');
      console.log(editModel);
      var text = App.util.ContentToHtml(editModel.get("content"));
      editView.editor.setContent(text);
    });
  };

  App.vent.trigger("app.clipapp.clipedit.error", function(){
    // 可以弹出错误对话框，提示错误信息
  });

  return ClipEdit;

})(App, Backbone, jQuery);