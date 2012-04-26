App.ClipApp.ClipEdit = (function(App, Backbone, $){
  var ClipEdit = {};
  var P = App.ClipApp.Url.base;

  App.Model.EditModel = App.Model.extend({
    url : function(){
      return P+"/clip/"+this.id;
    },
    parse: function(resp){ // 跟cliplist一致，使得model.id = "uid:id"
      resp.id = resp.user+":"+resp.id;
      return resp;
    }
  });

  var edit_view = "";
  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      "click .link_img":"show_extImg",
      "click .img_upload_span .btn":"up_extImg",
      "blur #img_upload_url":"hide_extImg",
      // "change #formUpload":"image_change", // 改成了直接在jade中绑定
      "click .format":"upFormat",
      "click .pop_left":"remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click .cancel":"abandonUpdate",
      "click .close_w":"abandonUpdate"
    },
    initialize: function(){
      edit_view = this;
    },
    hide_extImg:function(){    //隐藏弹出的链接地址对话框
      setTimeout(function(){
	$(".img_upload_span").hide();
      },500);
    },
    show_extImg:function(evt){    //弹出输入链接地址的对话框
      $(".img_upload_span").show();
      $("#img_upload_url").val("");
      $("#img_upload_url").focus();
    },
    up_extImg: function(){ // 确定上传
      var url = $("#img_upload_url").val();
      if(url == "http://" || url == null)return;
      $(".img_upload_span").hide();
      App.ClipApp.Editor.insertImage("editor", {url: url});
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      console.info("调整页面格式");
    },
    remarkClip:function(){
      App.vent.trigger("app.clipapp:clipmemo", this.model.id);
    },
    saveUpdate: function(){
      var cid = this.model.id;
      var content = App.ClipApp.Editor.getContent("editor"); // 参数为编辑器id
      //content = App.ClipApp.Editor.getContent("editor",img_list);
      this.model.save({content: content},{
	success:function(model,res){
	  var content = model.get("content");
	  App.vent.trigger("app.clipapp.clipedit:@success", content,cid);
	},
	error:function(model,res){  // 出现错误，触发统一事件
	  App.vent.trigger("app.clipapp.clipedit:@error", cid);
	}
      });
    },
    abandonUpdate: function(){
      App.vent.trigger("app.clipapp.clipedit:@cancel");
    }
  });

  ClipEdit.image_change = function(sender){
    var that = edit_view;
    var uid = that.model.get("user");
    var change = App.util.isImage("formUpload");
    if(!change){
      App.vent.trigger("app.clipapp.message:alert","上传图片格式无效");
    }else{

      /*if( sender.files &&sender.files[0] ){
       var img = new Image();
       img.src = App.util.get_img_src(sender.files[0]);
       img.onload=function(){
       if(img.complete){
       App.ClipApp.Editor.insertImage("editor", {url: img.src,id:count++});
       }};}*/

      $("#img_form").submit();
      App.util.get_imgid("post_frame",function(img_src){
	//img_list.push(img_src);
	App.ClipApp.Editor.insertImage("editor", {url: img_src});
      });
    }
  };

  ClipEdit.autoResize1= function() { // 作用？
    try {
      document.all["mainFrame"].style.height =
	mainFrame.document.body.scrollHeight;
    }catch(e){}
  };

  ClipEdit.show = function(clipid){
    var editModel = new App.Model.EditModel({id: clipid});
    editModel.fetch(); // fetch来的model中的content已经是html了
    editModel.onChange(function(editModel){
      var editView = new EditView({model: editModel});
      App.viewRegion.show(editView);
      App.ClipApp.Editor.init();
      var html = editModel.toJSON().content;
      App.ClipApp.Editor.setContent("editor", html);
    });
  };

  ClipEdit.close = function(){
    App.viewRegion.close();
  };

  App.vent.bind("app.clipapp.clipedit:@success", function(content,cid){
    ClipEdit.close();
    App.vent.trigger("app.clipapp.cliplist:edit", content,cid);
  });

  App.vent.bind("app.clipapp.clipedit:@cancel", function(){
    ClipEdit.close();
  });

  App.vent.trigger("app.clipapp.clipedit:@error", function(){
    // 可以弹出错误对话框，提示错误信息
  });

  return ClipEdit;

})(App, Backbone, jQuery);