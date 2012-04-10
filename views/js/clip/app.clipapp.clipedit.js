App.ClipApp.ClipEdit = (function(App, Backbone, $){
  var ClipEdit = {};
  var P = App.ClipApp.Url.base;
  var _data = {};
  var flag = true;
  var EditModel = App.Model.extend({
    url : function(){
      return P+"/clip/"+this.id;
    }
  });

  var extImg = false;

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      "click .link_img":"show_extImg",
      "change #formUpload": "image_change",
      "click .format":"upFormat",
      "click .pop_left": "remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click .cancel":"abandonUpdate",
      "click .img_upload_span .btn":"up_extImg",
      "blur .img_upload_span input":"hide_extImg"
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
      $("#img_upload_url").focus();
    },
    up_extImg: function(){
      var url = $("#img_upload_url1").val();
      if(url == "http://" || url == null)return;
      App.ClipApp.Editor.insertImage("editor", {url: url});

    },
    image_change:function(e){
      var that = this;
      var uid = this.model.get("uid");
      var change = App.util.isImage("formUpload");
      if(change){
	$("#img_form").submit();
	flag = true;//此变量用于解决连续上传多张图片时图片加载重复的奇怪问题
	$("#post_frame").load(function(){ // 加载图片
	  if(flag){
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
	    flag = false;
	  }
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
      // 参数为编辑器id
      var html = App.ClipApp.Editor.getContent("editor");
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
    },
    abandonUpdate: function(){
      // 直接返回详情页面
      App.viewRegion.close();
      var user = this.model.get("user");
      var cid =	user+":"+this.model.id;
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
      var html = App.util.ContentToHtml(editModel.toJSON().content);
      App.ClipApp.Editor.setContent("editor", html);
    });
  };
  App.vent.trigger("app.clipapp.clipedit.error", function(){
    // 可以弹出错误对话框，提示错误信息
  });

  return ClipEdit;

})(App, Backbone, jQuery);