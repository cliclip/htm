App.ClipApp.ClipEdit = (function(App, Backbone, $){
  var ClipEdit = {};
  var P = App.ClipApp.Url.base;
  var _data = {};
  var flag = true;
  var EditModel = App.Model.extend({
    url : function(){
      return P+"/clip/"+this.id;
    },
    // 跟cliplist一致，使得model.id = "uid:id"
    parse: function(resp){
      resp.id = resp.user+":"+resp.id;
      return resp;
    }
  });

  var extImg = false;

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      "click .link_img":"show_extImg",
      "change #formUpload":"image_change",
      "click .format":"upFormat",
      "click .pop_left":"remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click .cancel":"abandonUpdate",
      "click .close_w":"abandonUpdate",
      "click .img_upload_span .btn":"up_extImg",
      "blur #img_upload_url":"hide_extImg"
    },
    initialize: function(){
      _data = {content : []};
    },
    hide_extImg:function(){//隐藏弹出的链接地址对话框
      setTimeout(function(){
	$(".img_upload_span").hide();
      },500);
    },
    show_extImg:function(evt){//弹出输入链接地址的对话框
      $(".img_upload_span").show();
      $("#img_upload_url").val("");
      $("#img_upload_url").focus();
    },
    up_extImg: function(){
      var url = $("#img_upload_url").val();
      if(url == "http://" || url == null)return;
      $(".img_upload_span").hide();
      App.ClipApp.Editor.insertImage("editor", {url: url});
    },
    image_change:function(e){
      var that = this;
      var uid = this.model.get("uid");
      var change = App.util.isImage("formUpload");
      if(change){
	$("#img_form").submit();
	$("#post_frame").unbind("load");
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var imgids = returnObj[1][0];
	      // for(var i=0;i<imgids.length;i++){ // 上传无需for循环
	      var imgid = imgids.split(":")[1];
	      var url = P+"/user/"+ uid+"/image/" +imgid;
	      App.ClipApp.Editor.insertImage("editor", {url: url});
	      // }
	    }
	  }
	});
      }else{
	App.vent.trigger("app.clipapp.message:alert","上传图片格式无效");
      }
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      console.info("调整页面格式");
    },
    remarkClip:function(){
      // 整个的传model方便直接修改
      App.vent.trigger("app.clipapp:clipmemo", this.model, "update");
    },
    saveUpdate: function(){
      var cid = this.model.id;
      // 参数为编辑器id
      _data.content = App.ClipApp.Editor.getContent("editor");
      this.model.save(_data,{
	url: P+"/clip/"+cid,
	type: 'PUT',
	success:function(model,res){
	  var clip = model.toJSON();
	  var listmodel=App.listRegion.currentView.collection.get(cid);
	  var modifyclip=listmodel.get("clip");
	  modifyclip.content = App.util.getPreview(clip.content, 100);
	  listmodel.set({clip:modifyclip});
	  App.vent.trigger("app.clipapp.cliplist:showlist",App.listRegion.currentView.collection);
	  // App.vent.trigger("app.clipapp:clipdetail", cid);
	  App.viewRegion.close();
	},
	error:function(model,res){
	  // 出现错误，触发统一事件
	  // App.vent.trigger("app.clipapp.clipedit:error", cid);
	}
      });
    },
    abandonUpdate: function(){
      // 直接返回详情页面
      App.viewRegion.close();
      var cid =	this.model.id;
      //在clip列表界面触发“改”时不应返回详情页面
      //App.vent.trigger("app.clipapp:clipdetail", cid);
    }
  });
  ClipEdit.autoResize1= function() {
    try {
      document.all["mainFrame"].style.height=mainFrame.document.body.scrollHeight;
      }catch(e){}
  };
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
      App.ClipApp.Editor.init();
      var html = editModel.toJSON().content;
      App.ClipApp.Editor.setContent("editor", html);
    });
  };
  App.vent.trigger("app.clipapp.clipedit.error", function(){
    // 可以弹出错误对话框，提示错误信息
  });

  return ClipEdit;

})(App, Backbone, jQuery);