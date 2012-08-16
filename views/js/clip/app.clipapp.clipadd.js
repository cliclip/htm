App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;
  var clip = {};
  var ieRange = false, clipper = "";
  var isIE= App.util.isIE();
  App.Model.ClipModel = App.Model.extend({
    url:function(){
      return P+"/clip";
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

  var AddClipView = App.ItemView.extend({
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
      this.flag = true;
      this.bind("success", saveSuccess);
      this.bind("error", saveFailed);
      this.bind("cancel", saveCanceled);
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
      App.ClipApp.Editor.insertImage("editor", {url: url,ieRange:ieRange});
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
      App.vent.trigger("app.clipapp.clipper:ok");
    },
    masker:function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelcliper();
      }
    },
    cancelcliper:function(){
      clip.content = App.ClipApp.Editor.getContent("editor");
      if(clipper){
	App.vent.trigger("app.clipapp.clipper:cancel", clip);
      }else{
	this.trigger("cancel", clip);
      }
    },
    savecliper:function(e){
      var target = $(e.currentTarget);
      var view = this;
      target.attr("disabled",true);
      e.preventDefault();
      clip.content = App.ClipApp.Editor.getContent("editor");
      this.model.save(clip, {
	success:function(model,res){ // 返回值res为clipid:clipid
	  model.id = res.clipid; // 将clip本身的id设置给model
	  if(clipper){
	    App.vent.trigger("app.clipapp.clipper:save");
	  }else{
	    view.trigger("success", model);
	  }
	},
	error:function(model,error){  // 出现错误，触发统一事件
	  target.attr("disabled",false);
	  view.trigger("error", error);
	}
      });
    },
    emptycliper:function(){
      App.vent.trigger("app.clipapp.clipper:empty");
    },
    remark_clip: function(){ // 此全局变量就是为了clip的注操作
      App.vent.trigger("app.clipapp:clipmemo", clip);
    }
  });

  var saveSuccess = function(model){
    ClipAdd.close();
    var uid = App.util.getMyUid();
    if(Backbone.history){
      //console.log(Backbone.history.fragment);
      if(Backbone.history.fragment == "my"){
	App.vent.trigger("app.clipapp.cliplist:add", model);
      }else{
	Backbone.history.navigate("/my", true);
      }
      App.vent.trigger("app.clipapp:bubb.refresh",uid,null,model.get("tag"));
      App.vent.trigger("app.clipapp.taglist:taglistRefresh",model.get("tag"));
    }
  };
  var saveFailed = function(error){
    App.vent.trigger("app.clipapp.message:confirm", error);
    App.vent.unbind("app.clipapp.message:sure");
    App.vent.bind("app.clipapp.message:sure", function(){
      App.ClipApp.Editor.focus("editor");
    });
  };
  var saveCanceled = function(clip){
    ClipAdd.close(clip);
  };

  ClipAdd.image_change = function(sender){ // 在view中直接绑定
    var change = App.util.isImage("formUpload");
    if(!change){
      App.vent.trigger("app.clipapp.message:confirm","imageUp_fail");
    }else{
      /*if( sender.files &&sender.files[0] ){//图片本地预览代码
       var img = new Image();
       img.src = App.util.get_img_src(sender.files[0]);
       img.onload=function(){
       if(img.complete){
       App.ClipApp.Editor.insertImage("editor", {url: img.src,id:count++,ieRange:ieRange});
       }};}*/

      $("#img_form").submit();
      App.util.get_imgid("post_frame",function(img_src){
	// console.info("after submit",img_src);
	// img_list.push(img_src);
	if(img_src)
	  App.ClipApp.Editor.insertImage("editor", {url: img_src,ieRange:ieRange});
      });
      //解决ie 789 无法连续上传相同的图片，需要清空上传控件中的数据
      App.util.clearFileInput(sender);
    }
  };

  ClipAdd.show = function(isClipper){ // 是否为书签摘录
    clipper = isClipper;
    var clipModel = new App.Model.ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    App.ClipApp.Editor.init();
    App.ClipApp.Editor.focus("editor");
    //为iframe添加keydown事件，可以按快捷键提交iframe中的输入
    $($("#editor").get(0).contentWindow.document.body).keydown(function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#save").click();
      }
    });
    function shortcut_save(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#save").click();
      }
    }
  };

  ClipAdd.close = function(clip){
    if(!clip || !clip.content){
      App.viewRegion.close();
    }else{
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      App.vent.trigger("app.clipapp.message:alert", "clipadd_save");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.viewRegion.close();
      });
    }
  };

  // 由外部触发
  App.vent.bind("app.clipapp.clipadd:update",function(data){
    clip.note = data.note;
    clip.tag = data.tag;
    clip.public = data.public;
  });

  return ClipAdd;
})(App, Backbone, jQuery);