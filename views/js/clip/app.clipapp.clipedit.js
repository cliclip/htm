App.ClipApp.ClipEdit = (function(App, Backbone, $){
  var ClipEdit = {};
  var P = App.ClipApp.Url.base;
  var edit_view = "", flag = false;
  var old_content = "",ieRange = false;
  var EditModel = App.Model.extend({
    validate: function(attrs){
      var content = attrs.content;
      if(!content || content.replace(/&nbsp;/g,"") == ""){
	return {"content":"is_null"};
      }else{
	return null;
      }
    }
  });
  var EditView = App.ItemView.extend({
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
      edit_view = this;
      flag = false;
    },
    save_range:function(){//IE插入图片到光标指定位置，暂存光标位置信息
      var isIE=document.all? true:false;
      var win=document.getElementById('editor').contentWindow;
      var doc=win.document;
      //ieRange=false;
      //doc.designMode='On';//可编辑
      win.focus();
      if(isIE){//是否IE并且判断是否保存过Range对象
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
      App.ClipApp.Editor.insertImage("editor", {url: url,ieRange:ieRange});
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      // console.info("调整页面格式");
    },
    remarkClip:function(){
      App.vent.trigger("app.clipapp:clipmemo", this.model.id);
    },
    saveUpdate: function(e){
      var target = $(e.currentTarget);
      target.attr("disabled",true);
      var cid = this.model.id;
      var content = App.ClipApp.Editor.getContent("editor"); // 参数为编辑器id
      /*if(content == old_content){
	//alert("您并未做出任何更改");
	target.attr("disabled", false);
	return;
      }*/
      var editModel = new EditModel({});
      editModel.set({content:content},{
	error:function(model, error){
	  App.vent.trigger("app.clipapp.message:confirm", error);
	  App.vent.bind("app.clipapp.message:sure", function(){
	    target.attr("disabled", false);
	    App.ClipApp.Editor.focus("editor");
	  });
	}
      });
      if(editModel.isValid()){
	editModel.save({},{ // 不用this.mode因为this.model中有 录线图
	  type:'PUT',
	  url: P+"/clip/"+cid,
	  success:function(model,res){
	    var content = model.get("content");
	    App.vent.trigger("app.clipapp.clipedit:@success", content,cid);
	  },
	  error:function(model,res){  // 出现错误，触发统一事件
	    target.attr("disabled", false);
	    App.vent.trigger("app.clipapp.clipedit:@error", cid);
	  }
	});
      };
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.abandonUpdate();
      }
    },
    abandonUpdate: function(){
      var content = App.ClipApp.Editor.getContent("editor"); // 参数为编辑器id
      App.vent.trigger("app.clipapp.clipedit:@cancel",content);
    }
  });

  ClipEdit.image_change = function(sender){
    var that = edit_view;
    var uid = that.model.get("user");
    var change = App.util.isImage("formUpload");
    if(!change){
      App.vent.trigger("app.clipapp.message:confirm","imageUp_fail");
    }else{

      /*if( sender.files &&sender.files[0] ){
       var img = new Image();
       img.src = App.util.get_img_src(sender.files[0]);
       img.onload=function(){
       if(img.complete){
       App.ClipApp.Editor.insertImage("editor", {url: img.src,id:count++,ieRange:ieRange});
       }};}*/

      $("#img_form").submit();
      App.util.get_imgid("post_frame",function(img_src){
	//img_list.push(img_src);
	if(img_src)
	  App.ClipApp.Editor.insertImage("editor", {url: img_src,ieRange:ieRange});
      });
      App.util.clearFileInput(sender);
    }
  };
/*
  ClipEdit.autoResize1= function() { // 作用？
    try {
      document.all["mainFrame"].style.height =
	mainFrame.document.body.scrollHeight;
    }catch(e){}
  };
*/
  ClipEdit.show = function(clipid){
    var model = new App.Model.DetailModel({id: clipid});
    model.fetch();
    model.onChange(function(editModel){
      var editView = new EditView({model: model});
      App.viewRegion.show(editView);
      $("body").addClass("noscroll");
      var html = App.util.contentToHtml(editModel.toJSON().content);
      App.ClipApp.Editor.init();
      // 保证了api层接受的数据和返回的数据都是ubb格式的
      App.ClipApp.Editor.setContent("editor", html);
      setTimeout(function(){
	old_content = App.ClipApp.Editor.getContent("editor"); // 参数为编辑器id
      },200);
    });
  };

  ClipEdit.close = function(n_content){
    if(!n_content || n_content == old_content){
      App.viewRegion.close();
      $("body").removeClass("noscroll");
    }else{
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      App.vent.trigger("app.clipapp.message:alert", "clipedit_save");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.viewRegion.close();
	$("body").removeClass("noscroll");
      });
    }
  };

  App.vent.bind("app.clipapp.clipedit:@success", function(content,cid){
    ClipEdit.close();
    App.vent.trigger("app.clipapp.cliplist:edit", content,cid);
    App.vent.trigger("app.clipapp.bubb:showUserTags",App.util.getMyUid());
  });

  App.vent.bind("app.clipapp.clipedit:@cancel", function(n_content){
    ClipEdit.close(n_content);
  });

  App.vent.trigger("app.clipapp.clipedit:@error", function(){
    // 可以弹出错误对话框，提示错误信息
  });

  return ClipEdit;

})(App, Backbone, jQuery);