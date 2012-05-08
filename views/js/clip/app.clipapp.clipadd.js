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
      "click .btn":"up_extImg", // 确定上传
      //"change #formUpload":"image_change", // 改成了直接在jade中绑定
      "blur #img_upload_url":"hide_extImg", // extImg输入框失焦就隐藏
      "click .pop_left":"remark_clip",
      "click .verify":"save",
      "click .cancel":"abandon",
      "click .close_w":"abandon"
    },
    initialize:function(){
      clip = {};
    },
    extImg:function(evt){
      $(".img_upload_span").show();
      $("#img_upload_url").focus();
      $("#img_upload_url").val("");
    },
    hide_extImg: function(){
      setTimeout(function(){
	$(".img_upload_span").hide();
      },500);
    },
    up_extImg: function(e){
      e.preventDefault();
      var url = $("#img_upload_url").val();
      if(url == "http://" || !url )return;
      $(".img_upload_span").hide();
      App.ClipApp.Editor.insertImage("editor", {url: url});
    },
    save: function(e){
      e.preventDefault();
      $(e.currentTarget).disabled = true;
      // var img_list = [];
      // clip.content = App.ClipApp.Editor.getContent("editor",img_list);
      clip.content = App.ClipApp.Editor.getContent("editor");
      this.model.save(clip,{
      	success:function(model,res){ // 返回值res为clipid:clipid
	  model.id = res.clipid; // 将clip本身的id设置给model
	  App.vent.trigger("app.clipapp.clipadd:@success", model);
	  $(e.currentTarget).disabled = true;
	},
	error:function(model,error){  // 出现错误，触发统一事件
	  App.vent.trigger("app.clipapp.clipadd:@error");
	}
      });
    },
    abandon: function(){
      App.vent.trigger("app.clipapp.clipadd:@cancel");
    },
    remark_clip: function(){ // 此全局变量就是为了clip的注操作
      App.vent.trigger("app.clipapp:clipmemo", clip);
    }
  });

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
       App.ClipApp.Editor.insertImage("editor", {url: img.src,id:count++});
       }};}*/

      $("#img_form").submit();
      App.util.get_imgid("post_frame",function(img_src){
	//img_list.push(img_src);
	App.ClipApp.Editor.insertImage("editor", {url: img_src});
      });
    }
  };

  ClipAdd.show = function(){
    var clipModel = new App.Model.ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    App.ClipApp.Editor.init();
  };

  ClipAdd.close = function(){
    App.viewRegion.close();
  };

  // 由外部触发
  App.vent.bind("app.clipapp.clip:update",function(data){
    clip.note = data.note;
    clip.tag = data.tag;
    clip.public = data.public;
  });

  App.vent.bind("app.clipapp.clipadd:@success", function(model){
    ClipAdd.close(); // 关闭clipadd,同步list的数据
    App.vent.trigger("app.clipapp.cliplist:add", model);
    if(model.get("tag")){
      var uid = App.util.getMyUid();
      //只刷新bubbs，而不重新load
      App.vent.trigger("app.clipapp.bubb:refresh",uid,null,model.get("tag"));
      //App.vent.trigger("app.clipapp.bubb:showUserTags", uid);
    }
  });

  App.vent.bind("app.clipapp.clipadd:@cancel", function(){
    ClipAdd.close();
  });

  App.vent.bind("app.clipapp.clipadd:@error", function(){
    console.info("addClip error"); // 触发统一的错误事件
  });

  return ClipAdd;
})(App, Backbone, jQuery);