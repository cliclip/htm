App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};

  var P = App.ClipApp.Url.base;
  var clip = {}, clipper = "";
  var ieRange = false, isIE = App.util.isIE();

  App.Model.ClipModel = App.Model.extend({
    //localStorage: new Store("clipdetail"),
    url: function(){
      return App.ClipApp.encodeURI(P + "/" + App.util.getMyUid() +"/clip");
    },
    validate: function(attrs){
      var content = attrs.content;
      if(!content || content.replace(/&nbsp;+|\s+/g,"") == ""){
	return {"content":"is_null"};
      }else{
	return null;
      }
    }
  });

  var AddClipView = App.DialogView.extend({
    tagName: "div",
    className: "addClip-view",
    template: "#addClip-view-template",
    events: {
      "mousedown #formUpload":"save_range", //IE-7,8,9下保存Range对象
      "mousedown .link_img":"save_range", //IE-7,8,9下保存Range对象
      //"change #formUpload":"image_change", // 改成了直接在jade中绑定
      "click .link_img":"extImg",//显示连接图片输入框并清空输入框
      "click .btn_img":"up_extImg", // 确定上传
      "click .masker_layer1":"hide_extImg",
      "click .note":"remark_clip",
      "click .close_w":"cancelcliper",
      "click .masker":"masker",
      "click #ok": "okcliper", // 对应clipper的back
      "click #cancel": "cancelcliper",
      "click #save": "savecliper", // 对应clipper的ok
      "click #empty":"emptycliper"
    },
    initialize:function(){
      clip = {};
      this.bind("@error", saveFailed);
      this.bind("@cancel", saveCanceled);
      this.bind("@closeRegion", closeRegion);
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
    up_extImg: function(e){
      e.preventDefault();
      var url = $("#img_upload_url").val();
      if(url == "http://" || !url )return;
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
      App.Editor.insertImage("editor", {url: url,ieRange:ieRange});
    },
    save_range:function(){//IE插入图片到光标指定位置，暂存光标位置信息
      var win=document.getElementById('editor').contentWindow;
      var doc=win.document;
      //ieRange=false;
      //doc.designMode='On';//可编辑
      win.focus();
      if(isIE){//是否IE并且判断是否保存过Range对象
	ieRange=doc.selection.createRange();
      }
    },
    okcliper:function(){
      this.trigger("@closeRegion");
      App.vent.trigger("app.clipapp.clipper:ok");
    },
    masker:function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelcliper();
      }
    },
    cancelcliper:function(){
      clip.content = App.Editor.getContent("editor");
      if(clipper){
	App.vent.trigger("app.clipapp.clipper:cancel", clip);
      }else{
	this.trigger("@cancel", clip);
      }
    },
    savecliper:function(e){
      e.preventDefault();
      var target = $(e.currentTarget);
      var view = this;
      target.attr("disabled",true);
      //con = App.util.cleanConImgUrl(con);
      clip.content = App.Editor.getContent("editor");
      this.model.save(clip, {
	success:function(model,res){ // 返回值res为clipid:clipid
	  model.id = res.clipid; // 将clip本身的id设置给model
	  view.trigger("@closeRegion");
	  if(clipper) App.vent.trigger("app.clipapp.clipper:save");
	  else App.vent.trigger("app.clipapp.clipadd:success", model);
	},
	error:function(model,error){  // 出现错误，触发统一事件
	  target.attr("disabled",false);
	  view.trigger("@error", error);
	}
      });
    },
    emptycliper:function(){
      this.trigger("@closeRegion");
      App.vent.trigger("app.clipapp.clipper:empty");
    },
    remark_clip: function(){ // 此全局变量就是为了clip的注操作
      App.ClipApp.showMemo(clip);
    }
  });

  var saveFailed = function(error){
    App.ClipApp.showConfirm(error, null, function(){
      App.Editor.focus("editor");
    });
  };

  var saveCanceled = function(clip){
    ClipAdd.close(clip);
  };

  var closeRegion = function(){
    App.vent.unbind("app.clipapp:upload");
    App.viewRegion.close();
  };

  // 在template中直接绑定
  ClipAdd.image_change = function(sender){
    var change = App.util.isImage("formUpload");
    if(!change){
      view.trigger("@error", "imageUp_fail");
    }else{
      $("#img_form").submit();
      //解决ie 789 无法连续上传相同的图片，需要清空上传控件中的数据
      App.util.clearFileInput(sender);
    }
  };

  ClipAdd.show = function(isClipper,clipper_content){ // 是否为书签摘录
    clipper = isClipper;
    var clipModel = new App.Model.ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);

    App.Editor.init();
    App.Editor.focus("editor");
    if(clipper_content){App.Editor.setContent("editor", clipper_content);}
    //为iframe添加keydown事件，可以按快捷键提交iframe中的输入
    $($("#editor").get(0).contentWindow.document.body).keydown(function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#save").click();
      }
    });

    //接收上传图片返回的信息
    App.vent.bind("app.clipapp:upload",function(returnVal){
      App.util.get_imgurl(returnVal,function(err, img_src){
	if(!err && img_src){
	  App.Editor.insertImage("editor",{url: img_src,ieRange:ieRange});
	}else{
	  App.ClipApp.showConfirm("imageUp_fail");
	}
      });
    });
  };

  ClipAdd.close = function(clip){
    App.vent.unbind("app.clipapp:upload");
    // 打开新建clip界面
    if(!clip || !clip.content || clip.content=="<br>"){
      App.viewRegion.close();
    }else{
      App.ClipApp.showAlert("clipadd_save", null, function(){
	App.viewRegion.close();
      });
    }
  };

  App.vent.bind("app.clipapp.clipadd:memo",function(data){
    clip.note = data.note;
    clip.tag = data.tag;
    clip["public"] = data["public"];
  });

  return ClipAdd;
})(App, Backbone, jQuery);