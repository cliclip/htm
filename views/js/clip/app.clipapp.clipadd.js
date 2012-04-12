App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;
  var objEditor = "";

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
      "click .link_img":"extImg",
      "change #formUpload": "image_change",
      "click .btn": "up_extImg",
      "click .verify":"save",
      "click .cancel":"abandon",
      "click .close_w":"abandon",
      "click .pop_left": "remark_newClip",
      "blur #img_upload_url":"hide_extImg"
    },
    extImg:function(evt){
      $(".img_upload_span").css("display","block");
      $("#img_upload_url").focus();
      $("#img_upload_url").val("");

    },
    hide_extImg: function(){
      setTimeout(function(){
	$(".img_upload_span").hide();
      },500);
    },
    up_extImg: function(){
      var url = $("#img_upload_url").val();
      if(url == "http://" || url == null)return;
      $(".img_upload_span").hide();
      App.ClipApp.Editor.insertImage("editor", {url: url});
    },
    image_change:function(e){
      e.preventDefault();
      var flag = true;
      var change = App.util.isImage("formUpload");
      if(change){
	$("#img_form").submit();
	$("#post_frame").load(function (){
	  if(flag){
	    var returnVal = this.contentDocument.documentElement.textContent;
	    if(returnVal != null && returnVal != ""){
	      var returnObj = eval(returnVal);
	      if(returnObj[0] == 0){
		var imgids = returnObj[1][0];
		//for(var i=0;i<imgids.length;i++){ // 上传无需for循环
		var ids = imgids.split(":");
		var url = P+"/user/"+ ids[0]+"/image/" +ids[1];
		App.ClipApp.Editor.insertImage("editor", {url: url});
		// }
	      }
	    }
	  }
	  flag = false;

	});
      }else{
	App.vent.trigger("app.clipapp.message:alert","上传图片格式无效");
      }
    },
    save: function(){
      var user = this.model.get("id");
      var clip = {};
      var html = App.ClipApp.Editor.getContent("editor");
      clip.content = App.util.HtmlToContent(html);
      clip.tag = this.model.get("tag");
      clip.note = this.model.get("note");
      clip.public = this.model.get("public");
      this.model.save(clip,{
      //this.model.save("content",content,{
	url: P+"/clip",
	type: 'POST',
	success:function(response){
	  /*
	  var cid = user+":";
	  // 临时处理
	  for(var i in response.toJSON()){
	    if(i != "content" && i!= "id")
	      cid += i;
	  }
	   */
	  //console.info(response);
	  App.vent.trigger("app.clipapp.cliplist:addshow", response);
	  App.viewRegion.close();
	  // 如何只刷新一个region的内容
	},
	error:function(response){
	  // 出现错误，触发统一事件
	  App.vent.trigger("app.clipapp.clipadd:error");
	}
      });
    },
    abandon: function(){
      // 直接返回详情页面
      App.vent.trigger("app.clipapp.clipadd:cancel");
    },
    remark_newClip: function(){
      App.vent.trigger("app.clipapp:clipmemo", this.model, "add");
    }
  });

  ClipAdd.show = function(uid){
    var clipModel = new ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    App.ClipApp.Editor.init();
  };

  App.vent.bind("app.clipapp.clipadd:cancel", function(){
    App.viewRegion.close();
  });

  App.vent.bind("app.clipapp.clipadd:error", function(){
    console.info("addClip error");
  });

  return ClipAdd;

})(App, Backbone, jQuery);