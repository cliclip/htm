App.ClipApp.ClipEdit = (function(App, Backbone, $){

  var ClipEdit = {};
  var P = App.ClipApp.Url.base;
  var view = "", isIE = App.util.isIE();
  var old_content = "",ieRange = false;

  var EditModel = App.Model.extend({
    validate: function(attrs){
      var content = attrs.content;
      if(!content || content.replace(/&nbsp;+|\s+/g,"") == ""){
	return {"content":"is_null"};
      }else{
	return null;
      }
    }
  });
  var EditView = App.DialogView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      // "change #formUpload":"image_change", // 改成了直接在jade中绑定
      "mousedown #formUpload":"save_range", //IE-7,8,9下保存Range对象
      "mousedown .link_img":"save_range", //IE-7,8,9下保存Range对象
      "click .link_img":"extImg",
      "click .btn_img":"up_extImg",
      "click .masker_layer1":"hide_extImg",
      "click .format":"upFormat",
      "click .note":"remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click .cancel":"abandonUpdate",
      "click .masker":"masker",
      "click .close_w":"abandonUpdate"
    },
    initialize: function(){
      view = this;
      view.bind("@success", editSuccess);
      view.bind("@error", editFailed);
      view.bind("@cancel", editCanceled);
    },
    save_range:function(){//IE插入图片到光标指定位置，暂存光标位置信息
      var win=document.getElementById('editor').contentWindow;
      var doc=win.document;
      //ieRange=false;
      //doc.designMode='On';//可编辑
      win.focus();
      if(isIE){ // 是否IE并且判断是否保存过Range对象
	ieRange=doc.selection.createRange();
      }
    },
    extImg:function(evt){
      $(".masker_layer1").show();
      $(".img_upload_span").show();
      $("#img_upload_url").focus();
      $("#img_upload_url").val("");
    },
    hide_extImg: function(e){
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
    },
    up_extImg: function(){ // 确定上传
      var url = $("#img_upload_url").val();
      if(url == "http://" || !url )return;
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
      App.Editor.insertImage("editor", {url: url,ieRange:ieRange});
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      // console.info("调整页面格式");
    },
    remarkClip:function(){
      App.ClipApp.showMemo(this.model.id);
    },
    saveUpdate: function(e){
      var target = $(e.currentTarget);
      target.attr("disabled",true);
      var cid = this.model.id;
      var content = App.Editor.getContent("editor"); // 参数为编辑器id
      if(content == old_content){
	view.trigger("@cancel");
      }else{
	var editModel = new EditModel({});
	// 不用this.mode因为this.model中有 录线图
	editModel.save({content: App.util.cleanConImgUrl(content,cid)}, {
	  type:'PUT',
	  url: App.ClipApp.encodeURI(P+"/clip/"+cid),
	  success:function(model, res){
	    var opt = cid.split(":");
	    var content = model.get("content");
	    // App.util.cacheSync("/clip_"+opt[1]+".text.js",content);
	    if(App.util.isLocal()){
	      window.cache["/"+opt[0]+"/clip_"+opt[1]+".text.js"] = content;
	    }
	    view.trigger("@success", content, cid);
	  },
	  error:function(model, error){  // 出现错误，触发统一事件
	    target.attr("disabled", false);
	    view.trigger("@error", error);
	  }
	});
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.abandonUpdate();
      }
    },
    abandonUpdate: function(){
      var content = App.Editor.getContent("editor"); // 参数为编辑器id
      view.trigger("@cancel", content);
    }
  });

  ClipEdit.image_change = function(sender){
    var change = App.util.isImage("formUpload");
    if(!change){
      view.trigger("@error", "imageUp_fail");
    }else{
      $("#img_form").submit();
      App.util.clearFileInput(sender);
    }
  };

  ClipEdit.show = function(clipid){
    var model = new App.Model.DetailModel({id: clipid});
    model.fetch();
    model.onChange(function(editModel){
      var editView = new EditView({model: model});
      App.viewRegion.show(editView);
      // 更新clip：将获取本地图片文件改为获取服务器端文件
      var html = editModel.toJSON().content.replace(/\.\.\//g,P+ "/");
      App.Editor.init();
      App.Editor.setContent("editor", html);
      setTimeout(function(){
	old_content = App.Editor.getContent("editor"); //参数为编辑器id
      },200);
      $($("#editor").get(0).contentWindow.document.body).keydown(function(e){
	if(e.ctrlKey&&e.keyCode==13){
	  $("#editClip_Save").click();
	}
      });
    });
    //接受上传图片返回的信息
    App.vent.bind("app.clipapp:upload",function(returnVal){
      App.util.get_imgurl(returnVal,function(err, img_src){
	if(!err && img_src){
	  App.Editor.insertImage("editor", {url: img_src,ieRange:ieRange});
	}else{
	  App.ClipApp.showConfirm("imageUp_fail");
	}
      });
    });
  };

  ClipEdit.close = function(n_content){
    App.vent.unbind("app.clipapp:upload");
    if(!n_content || n_content == old_content){
      App.viewRegion.close();
    }else{
      App.ClipApp.showAlert("clipedit_save", null, function(){
	App.viewRegion.close();
      });
    }
  };

  var editSuccess =  function(content,cid){
    ClipEdit.close();
    App.vent.trigger("app.clipapp.clipedit:success", content, cid);
  };

  var editFailed = function(error){ // 可以弹出错误对话框，提示错误信息
    App.ClipApp.showConfirm(error, null, function(){
      App.Editor.focus("editor");
    });
  };

  var editCanceled =  function(n_content){
    ClipEdit.close(n_content);
  };

  return ClipEdit;
})(App, Backbone, jQuery);