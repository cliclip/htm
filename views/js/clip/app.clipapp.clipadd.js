App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;
  var clip = {};
  App.Model.ClipModel = App.Model.extend({
    url:function(){
      return P+"/clip";
    }
  });
  var AddClipView = App.ItemView.extend({
    tagName: "div",
    className: "addClip-view",
    template: "#addClip-view-template",
    events: {
      "click .link_img":"extImg",
      "click .btn": "up_extImg",
      "blur #img_upload_url":"hide_extImg", // extImg输入框失焦就隐藏
      "click .pop_left": "remark_clip",
      "click .verify":"save",
      "click .cancel":"abandon",
      "click .close_w":"abandon"
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
    save: function(){
      //this.model.get("clip");
      console.info(clip);
      clip.content = App.ClipApp.Editor.getContent("editor",img_list);
      this.model.save(clip,{
	url: P+"/clip",
	type: 'POST',
      	success:function(model,res){ // 返回值res为clipid:clipid
	  //img_list = [];
	  //count = 0;
	  var modifyclip = {};
	  modifyclip.id = res.clipid;
	  modifyclip.tag = clip.tag;
	  modifyclip.note = clip.note;
	  modifyclip.public = clip.public;
	  modifyclip.user = {id:App.util.getMyUid()};
	  modifyclip.content = App.util.getPreview(clip.content, 100);
	  var id = App.util.getMyUid()+":"+res.clipid;
	  model.id = id;
	  model.set({clip:modifyclip,id:id});
	  model.set({recommend:""});
	  App.vent.trigger("app.clipapp.cliplist:addshow", model);
	  //console.log(model);
	  App.ClipApp.Bubb.showUserTags(modifyclip.user.id);
	  ClipAdd.close();
	},
	error:function(model,error){
	  // 出现错误，触发统一事件
	  App.vent.trigger("app.clipapp.clipadd:error");
	}
      });
    },
    abandon: function(){
      // 直接返回详情页面
      App.vent.trigger("app.clipapp.clipadd:cancel");
    },
    remark_clip: function(){
      this.model.set({clip:clip});
      App.vent.trigger("app.clipapp:clipmemo", this.model);
    }
  });

  ClipAdd.image_change = function(sender){
      var change = App.util.isImage("formUpload");
      if(change){
/*	if( sender.files &&sender.files[0] ){//图片本地预览代码
	  var img = new Image();
	  img.src = App.util.get_img_src(sender.files[0]);
	  img.onload=function(){
	    if(img.complete){
	      App.ClipApp.Editor.insertImage("editor", {url: img.src,id:count++});
	    }
	  };
	}
*/
	$("#img_form").submit();
	App.util.get_imgid("post_frame",function(img_src){
	  //img_list.push(img_src);
	  App.ClipApp.Editor.insertImage("editor", {url: img_src});
	});
      }else{
	App.vent.trigger("app.clipapp.message:alert","上传图片格式无效");
      }
    };
  ClipAdd.show = function(uid){
    var clipModel = new App.Model.ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    App.ClipApp.Editor.init();
  };

  ClipAdd.close = function(){
    App.viewRegion.close();
    clip = {};
  };

  App.vent.bind("app.clipapp.clip:update",function(data){
    clip.note = data.note;
    clip.tag = data.tag;
    clip.public = data.public;
  });

  App.vent.bind("app.clipapp.clipadd:cancel", function(){
    ClipAdd.close();
  });

  App.vent.bind("app.clipapp.clipadd:error", function(){
    console.info("addClip error");
  });

  return ClipAdd;

})(App, Backbone, jQuery);