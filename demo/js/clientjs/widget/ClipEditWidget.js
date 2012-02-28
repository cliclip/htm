ClipEditWidget = function(_container,_options){ // el同样是popup
  this.container = _container;
  this.options = _options;
  this.widgetType = "ClipEditWidget";
  var clipEditWidget = this;

  var _view = Backbone.View.extend({
    el:$(_container),
    model: _options.model,
    id: _options.id,
    initialize:function(){
      this.render();
    },
    left_template: _.template($("#editleft_template").html()),
    clip_template: _.template($("#editclip_template").html()),
    right_template: _.template($("#editright_template").html()),
    uploadTemplate: _.template($("#imgUpload_template").html()),

    events:{
      "click #exImg":"extImg",
      "click #localImg":"localImg",
      "click #upformat":"upFormat",
      "click #editClip_Save":"saveUpdate",
      "click #editClip_Abandon":"abandonUpdate",
      "click .editContent-container p":"editText"
    },
    render:function(_model){
      // 首先清空 #popup中的内容，还原原有div块布局 left right都没有删
      $("#detailContact").children().css("display","none");
      // 开始放内容 top left right center
      $("#top").html("<div align=\"center\">改</div>"); //在$("#top")加上改
      this.el.append(this.left_template());
      this.el.append(this.right_template());
      if(!_model){
	model = this.model;
      }else{
	model = _model.toJSON();
      }
      for(var i=0;i<model.content.length;i++){
	if(model.content[i].image && model.content[i].image.length == 32){
	  model.content[i].image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "user/"+model.user+"/image/"+model.content[i].image;
	}
      }
      this.el.append(this.clip_template(model));
    },
    extImg:function(evt){
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      var img = $("<img class='detail-image' src= "+url+">");
      // contentContainer.append(img);
      $(".editContent-container").append(img);
    },
    localImg:function(){
      document.cookie = "token=1:ad44a7c2bc290c60b767cb56718b46ac";
      if($("#imgUploadDiv").html() == ""){
	var actionUrl = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"user/1/image"; // 上传图片
	$("#imgUploadDiv").html(this.uploadTemplate({actUrl:actionUrl}));
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var imgids = returnObj[1];
	      for(var i=0;i<imgids.length;i++){
		var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"user/1/image/" +imgids[i];
		var img = $("<img class='detail-image' src= "+url+">");
		$(".editContent-container").append(img);
		// contentContainer.append(img);
	      }
	    }
	  }
	});
      }else{
	$("#imgUploadDiv").empty();
      }
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      console.info("调整页面格式");
    },
    editText:function(evt){
      var contentText = $(evt.target);
      contentText.attr("contenteditable",false);
      var text = contentText.text().replace(/(^\s*)|(\s*$)/g,"");
      var h = contentText.height()*1.1;
      var w = contentText.width();
      contentText.empty();

      var textarea = $(document.createElement("textarea"));
      textarea.val(text);
      textarea.width(w);
      textarea.height(h);
      contentText.append(textarea);
      textarea.focus();

      textarea.blur(function(evt){
	var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
	textarea.remove();
	contentText.text(text);
      }).click(function(evt){
	evt.stopPropagation();
	evt.preventDefault();
      });
    },
    saveUpdate:function(evt){
      // 保存更新
      var view = this;
      var clipid = _options.id;
      var _data = new Object();
      _data.content = [];
      $(".editContent-container").children().each(function(){
	var _text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
	var src = this.src;
	if(_text == "" && !src){
	  $(this).remove();
	}
	if(_text){ //&& text.replace(/(^\s*)|(\s*$)/g,"") != ""){
	  _data.content.push({text:_text});//.replace(/(^\s*)|(\s*$)/g,"") );
	}else if(src){ //如果有图片
	  var prefix = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "user/1/image/";
	  if(src.indexOf(prefix) != -1){
	    id = src.split(prefix);
	    src = id[1];
	  }
	  _data.content.push({image:src});
	}
      });
      document.cookie = "token=1:ad44a7c2bc290c60b767cb56718b46ac";
      RequestUtil.putFunc({
	url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+clipid,
	data:_data,
	successCallBack:function(response){
	  if(response[0] == 0){
	    // 保存成功 回到详情页面
	    $("#top").html(""); //在$("#top")加上改
	    view.el.children().remove();
	    $("#detailContact").children().remove();
	    location.href = "#/detail/"+view.id;
	    // location.href = location.href.substring(0,location.href.length-5);
	  }else{
	    console.info("response[0] == "+response[0]);
	  }
	},
	errorCallBack:function(response){
	  console.info(response);
	}
      });
    },
    abandonUpdate:function(evt){
      var view = this;
      view.el.children().remove();
      $("#top").html(""); //在$("#top")加上改
      $("#detailContact").children().css("display","block"); // detail
      // 取消更新 [如有上传了图片 先不进行图片删除]
      //会再次执行ClipDetailWidget的render方法
      // location.href = location.href.substring(0,location.href.length-5);
    }
});
  this.view = new _view();
};
ClipEditWidget.prototype.initialize = function(){
  this.view.initialize();
};
ClipEditWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.clipDetailWidget = null;
};
ClipEditWidget.prototype.loadDetail = function(id,model){
  this.view.el = $("#editContact");
  this.view.id = id;
  this.view.model = model;
  this.view.animateIn();
};
ClipEditWidget.prototype.cancelDetail = function(id){
  //this.view.el = $("#container_"+id);
  this.view.el = $("#editContact");
  this.view.animateOut();
};