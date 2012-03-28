App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;
  var _data = {};

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
      "click #exImg":"extImg",
      "change #formUpload": "image_change",
      "click #save":"save",
      "click #abandon":"abandon",
      "click #insText": "addText",
      "click .detail-text":"editText",
      "click #remark": "remark_newClip"
    },
    initialize: function(){
      _data = {};
    },
    extImg:function(evt){
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      var img = $("<img class='detail-image' src= "+url+">");
      // contentContainer.append(img);
      $(".addClip-container").append(img);
    },
    image_change:function(e){
      var uid = this.model.get("id");
      var change = App.util.isImage("formUpload");
      if(change){
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
		$(".addClip-container").append(img);
	      }
	    }
	  }
	});
      }else{
	alert("图片格式无效");
      }
    },
    addText: function(evt){
      var newText = $("<p class='detail-text'>新内容</p>");
      $(".addClip-container").append(newText);
    },
    editText:function(evt){
      var contentText = $(evt.target);
      contentText.attr("contenteditable",false);
      var text = contentText.text().replace(/(^\s*)|(\s*$)/g,"");
      var h = contentText.height()*1.1;
      var w = contentText.width();
      contentText.empty();

      var textarea = $(document.createElement("textarea"));
      if(text == "新内容"){
	textarea.val("");
      }else{
	textarea.val(text);
      }
      textarea.width(w);
      textarea.height(h);
      contentText.append(textarea);
      textarea.focus();

      textarea.blur(function(evt){
	var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
	textarea.remove();
	if(!text){
	  contentText.text("新内容");
	}else{
	  contentText.text(text);
	}
      }).click(function(evt){
	evt.stopPropagation();
	evt.preventDefault();
      });
    },
    save: function(){
      _data.content = [];
      var user = this.model.get("id");
      $(".addClip-container").children().each(function(){
	var _text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
	var src = this.src;
	if(_text == "" && !src){
	  $(this).remove();
	}
	if(_text){ // && text.replace(/(^\s*)|(\s*$)/g,"") != ""){
	  _data.content.push({text:_text});//.replace(/(^\s*)|(\s*$)/g,"") );
	}else if(src){ //如果有图片,取得id赋值给content.image
	  var prefix = P + "/user/"+user+"/image/";
	  if(src.indexOf(prefix) != -1){
	    id = src.split(prefix);
	    src = user+":"+id[1];
	  }
	  _data.content.push({image:src});
	}
	console.log(_data.content);
      });
      this.model.save(_data,{
	url: P+"/clip",
	type: 'POST',
	success:function(response){
	  var cid = user+":";
	  // 临时处理
	  for(var i in response.toJSON()){
	    if(i != "content" && i!= "id")
	      cid += i;
	  }
	  App.viewRegion.close();
	  // 如何只刷新一个region的内容
	  location.reload();
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
      App.vent.trigger("app.clipapp:clipmemo");
    }
  });

  ClipAdd.show = function(uid){
    var clipModel = new ClipModel({id: uid, actUrl:P+"/user/"+ uid+"/image"});
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
  };

  App.vent.bind("app.clipapp.clipadd:cancel", function(){
    App.viewRegion.close();
  });

  App.vent.bind("app.clipapp.clipadd:error", function(){
    console.info("addClip error");
  });

  App.vent.bind("app.clipapp.clipadd:memo", function(data){
    for(var i in data){
      _data[i] = data[i];
    }
  });

  return ClipAdd;

})(App, Backbone, jQuery);