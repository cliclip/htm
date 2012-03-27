App.ClipApp.ClipEdit = (function(App, Backbone, $){
  var ClipEdit = {};
  var P = App.ClipApp.Url.base;

  var EditModel = App.Model.extend({
    url : function(){
      return P+"/clip/"+this.id;
    }
  });

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      "click #exImg":"extImg",
      "change #formUpload": "image_change",
      "click #upformat":"upFormat",
      "click #edit_remark":"remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click #editClip_Abandon":"abandonUpdate",
      "click .editContent-container p":"editText"
    },
    extImg:function(evt){
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      var img = $("<img class='detail-image' src= "+url+">");
      // contentContainer.append(img);
      $(".editContent-container").append(img);
    },
    image_change:function(e){
      var uid = this.model.get("uid");
      $("#img_form").submit();
      $("#post_frame").load(function(){ // 加载图片
	var returnVal = this.contentDocument.documentElement.textContent;
	if(returnVal != null && returnVal != ""){
	  var returnObj = eval(returnVal);
	  if(returnObj[0] == 0){
	    var imgids = returnObj[1];
	    for(var i=0;i<imgids.length;i++){
	      var imgid = imgids[i].split(":")[1];
	      var url = P+"/user/"+ uid+"/image/" +imgid;
	      var img = $("<img class='detail-image' src= "+url+">");
	      $(".editContent-container").append(img);
	    }
	  }
	}
      });
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
    editText:function(evt){
      var contentText = $(evt.target);
      contentText.attr("contenteditable",false);
      var text = contentText.text().replace(/(^\s*)|(\s*$)/g,"");
      var h = contentText.height()*1.1;
      var w = contentText.width();
      contentText.empty();

      var textarea = $(document.createElement("textarea"));
      // console.info(text);
      textarea.val(text);
      textarea.width(w);
      textarea.height(h);
      contentText.append(textarea);
      textarea.focus();

      textarea.blur(function(evt){
	// console.info(text);
	var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
	textarea.remove();
	contentText.text(text);
      }).click(function(evt){
	evt.stopPropagation();
	evt.preventDefault();
      });
    },
    saveUpdate: function(){
      var user = this.model.get("user");
      var _data = {content :[]};
      $(".editContent-container").children().each(function(){
	var _text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
	var src = this.src;
	if(_text == "" && !src){
	  $(this).remove();
	}
	if(_text){ // && text.replace(/(^\s*)|(\s*$)/g,"") != ""){
	  _data.content.push({text:_text});//.replace(/(^\s*)|(\s*$)/g,"") );
	}else if(src){ //如果有图片
	  var prefix = P + "user/"+user+"/image/";
	  if(src.indexOf(prefix) != -1){
	    id = src.split(prefix);
	    src = user+":"+id[1];
	  }
	  _data.content.push({image:src});
	}
      });
      var cid =	user+":"+this.model.id;
      this.model.save(_data,{
	url: P+"/clip/"+cid,
	type: 'PUT',
	success:function(response){
	  // location.href="#/clip/"+cid;
	  App.vent.trigger("app.clipapp:clipdetail", cid);
	},
	error:function(response){
	  // 出现错误，触发统一事件
	  App.vent.trigger("app.clipapp.clipedit:error", cid);
	}
      });
    },
    abandonUpdate: function(){
      // 直接返回详情页面
      var user = this.model.get("user");
      var cid =	user+":"+this.model.id;
      App.vent.trigger("app.clipapp:clipdetail", cid);
    }
  });

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
    });
  };

  App.vent.trigger("app.clipapp.clipedit.error", function(){
    // 可以弹出错误对话框，提示错误信息
  });

  return ClipEdit;

})(App, Backbone, jQuery);