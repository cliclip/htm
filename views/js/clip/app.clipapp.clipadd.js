App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;
  var clip = {};
  var ieRange=false;
  App.Model.ClipModel = App.Model.extend({
    url:function(){
      return P+"/clip";
    },
    validate: function(attrs){
      var content = attrs.content;
      if(!content || content.replace(/&nbsp;/g,"") == ""){
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
      "click .link_img":"extImg",
      "click .btn_img":"up_extImg", // 确定上传
      "mousedown #formUpload":"save_range", //IE-7,8,9下保存Range对象
      "mousedown .link_img":"save_range", //IE-7,8,9下保存Range对象
      //"change #formUpload":"image_change", // 改成了直接在jade中绑定
      "blur #img_upload_url":"hide_extImg", // extImg输入框失焦就隐藏
      "click #img_upload_url":"show_extImg",
      "click .pop_left":"remark_clip",
      "click .message":"message_hide",
      "click .close_w":"abandon",
      "click #ok": "okcliper",
      "click #cancel": "cancelcliper",
      "click #save": "savecliper",
      "click #empty":"emptycliper"
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
    okcliper:function(){
      App.vent.trigger("app.clipapp.clipper:ok");
    },
    message_hide:function(){
      $(".message").hide();
      var data = new Date();
      data.setTime(data.getTime() + 30*24*60*60*10000);
      document.cookie = "first=false"+";expires=" + data.toGMTString();
    },
    cancelcliper:function(){
      App.vent.trigger("app.clipapp.clipper:cancel");
      App.vent.trigger("app.clipapp.clipadd:@cancel");
    },
    savecliper:function(e){
      var target = $(e.currentTarget);
      target.attr("disabled",true);
      e.preventDefault();
      clip.content = App.ClipApp.Editor.getContent("editor");
      this.model.set(clip, {
	error:function(model, error){
	  App.vent.trigger("app.clipapp.message:alert", error);
	  App.vent.bind("app.clipapp.message:sure", function(){
	    target.attr("disabled", false);
	    App.ClipApp.Editor.focus("editor");
	  });
	}
      });
      if(this.model.isValid()){
	this.model.save({},{
	  success:function(model,res){ // 返回值res为clipid:clipid
	    model.id = res.clipid; // 将clip本身的id设置给model
	    App.vent.trigger("app.clipapp.clipper:save");
	    App.vent.trigger("app.clipapp.clipadd:@success", model);
	  },
	  error:function(model,error){  // 出现错误，触发统一事件
	    target.attr("disabled",false);
	    App.vent.trigger("app.clipapp.clipadd:@error");
	  }
	});
      }
    },
    emptycliper:function(){
      App.vent.trigger("app.clipapp.clipper:empty");
    },
    initialize:function(){
      clip = {};
    },
    extImg:function(evt){
      $(".img_upload_span").show();
      $("#img_upload_url").focus();
      $("#img_upload_url").val("");
    },
    show_extImg:function(evt){
      $(".img_upload_span").show();
      $("#img_upload_url").focus();
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
      App.ClipApp.Editor.insertImage("editor", {url: url,ieRange:ieRange});
    },
    abandon: function(){
      App.vent.trigger("app.clipapp.clipper:cancel");
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
       App.ClipApp.Editor.insertImage("editor", {url: img.src,id:count++,ieRange:ieRange});
       }};}*/

      $("#img_form").submit();
      App.util.get_imgid("post_frame",function(img_src){
	// console.info("after submit",img_src);
	// img_list.push(img_src);
	App.ClipApp.Editor.insertImage("editor", {url: img_src,ieRange:ieRange});
      });
      //解决ie 789 无法连续上传相同的图片，需要清空上传控件中的数据
      App.util.clearFileInput(sender);
    }
  };

  ClipAdd.show = function(){
    var clipModel = new App.Model.ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    $(".big_pop").css("top", App.util.getPopTop("big"));
    App.ClipApp.Editor.init();
    //console.info(document.cookie);
    if(!/first=false/.test(document.cookie)){
      $(".message").show();
    }else{
      var data = new Date();
      data.setTime(data.getTime() + 30*24*60*60*10000);
      document.cookie = "first=false"+";expires=" + data.toGMTString();
    }
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
    ClipAdd.close();
    var uid = App.util.getMyUid();
    if(Backbone.history){
      //console.log(Backbone.history.fragment);
      if(Backbone.history.fragment == "my"){
	App.vent.trigger("app.clipapp.cliplist:add", model);
      }else{
	Backbone.history.navigate("/my", true);
      }
      App.vent.trigger("app.clipapp.bubb:refresh",uid,null,model.get("tag"));
      App.vent.trigger("app.clipapp.taglist:taglistRefresh",model.get("tag"));
    }
  });

  App.vent.bind("app.clipapp.clipadd:@cancel", function(){
    ClipAdd.close();
  });

  App.vent.bind("app.clipapp.clipadd:@error", function(){
    // console.info("addClip error"); // 触发统一的错误事件
  });

  return ClipAdd;
})(App, Backbone, jQuery);