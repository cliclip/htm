App.ClipApp.Detail = (function(App, Backbone, $){
  var Detail = {};

    var DetailModel = App.Model.extend({
    url: function(){
      return P+"/clip/"+this.id;
    }
  });

  var DetailView = App.ItemView.extend({
    tagName: "div",
    className: "Detail-view",
    template: "#detail-view-template",
    events: {
      "click .operate" : "Operate"
    },
    Operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).val();
      var user = this.model.get("user");
      var cid = user+":"+this.model.id;
      switch(opt){
	case '评': this.comment(cid); break;
	case '转': this.recommend(cid); break;
	case '收': this.reclip(cid); break;
	case '注': this.remark(cid); break;
	case '改': this.update(cid); break;
	case '删': this.remove(cid); break;
      }
    },
    comment : function(cid){
      App.vent.trigger("comment", cid);
      // ClipApp.Comment.open(cid);
    },
    recommend: function(cid){
      App.vent.trigger("recommend", cid);
      // ClipApp.Recommend.open(cid);
    },
    reclip: function(cid){
      ClipApp.Reclip.open(cid);
    },
    update: function(cid){
      var detailEditView = new DetailEditView({model: this.model});
      console.info(detailEditView);
      App.listRegion.show(detailEditView);
      App.Delete.close();
    },
    remark: function(cid){
      App.OrganizeApp.open(cid);
    },
    remove: function(cid){
      //console.info("this.model.id"+this.model.id);
      App.Delete.open(null, P + "/clip/" + cid, null);
    }
  });

  var ImgModel = App.Model.extend({});
  var LocalImgView = App.ItemView.extend({
    tagName: "form",
    className: "localImg-view",
    template: "#localImg-view-template"
  });

  var DetailEditView = App.ItemView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      "click #exImg":"extImg",
      "click #localImg":"localImg",
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
    localImg:function(){
      var user = this.model.get("user");
      var url =	P+"/user/" + user + "/image";
      var imgModel = new ImgModel();
      imgModel.set("actUrl",url);
      var localImgView = new LocalImgView({
	model: imgModel
      });
      ClipApp.LocalImgRegion = new App.RegionManager({el: "#imgUploadDiv"});
      ClipApp.LocalImgRegion.show(localImgView);
      $("#post_frame").load(function(){ // 加载图片
	var returnVal = this.contentDocument.documentElement.textContent;
	if(returnVal != null && returnVal != ""){
	  var returnObj = eval(returnVal);
	  if(returnObj[0] == 0){
	    var imgids = returnObj[1];
	    for(var i=0;i<imgids.length;i++){
	      var url = P+"/user/"+ user+"/image/" +imgids[i];
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
      App.OrganizeApp.open(cid);
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
      var _data = new Object();
      _data.content = [];
      $(".editContent-container").children().each(function(){
	var _text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
	var src = this.src;
	if(_text == "" && !src){
	  $(this).remove();
	}
	if(_text){ // && text.replace(/(^\s*)|(\s*$)/g,"") != ""){
	  _data.content.push({text:_text});//.replace(/(^\s*)|(\s*$)/g,"") );
	}else if(src){ //如果有图片
	  var prefix = P + "user/1/image/";
	  if(src.indexOf(prefix) != -1){
	    id = src.split(prefix);
	    src = id[1];
	  }
	  _data.content.push({image:src});
	}
      });
      var user = this.model.get("user");
      var cid =	user+":"+this.model.id;
      this.model.save(_data,{
	url: P+"/clip/"+cid,
	type: 'PUT',
	success:function(response){
	  // location.href="#/clip/"+cid;
	  App.vent.trigger("clip:showDetail", cid);
	},
	error:function(response){
	  // 出现错误，触发统一事件
	  App.vent.trigger("clip:error", cid);
	}
      });
    },
    abandonUpdate: function(){
      // 直接返回详情页面
      var user = this.model.get("user");
      var cid =	user+":"+this.model.id;
      App.vent.trigger("clip:showDetail", cid);
    }
  });


  // 显示clip的detail内容 [clipDetiail 以及 Comment]
  var showDetail = function(detailModel){
    var detailView = new DetailView({
      model: detailModel
    });
    App.listRegion.show(detailView);
  };

  Detail.show = function(cid){
    //document.cookie = "token=1:ad44a7c2bc290c60b767cb56718b46ac";
    var clip = new DetailModel({id: cid});
    clip.fetch(); // 获得clip详情 detail需要进行url地址的bookmark
    clip.onChange(function(detailModel){
      // var self = document.cookie.split("=")[1].split(":")[0];
      var self = "2";
      var user = detailModel.get("user");
      if(user == self){
	detailModel.set("manage",["注","改","删"]);
      }else{
	detailModel.set("manage",["收","转","评"]);
      }
      detailModel.set("users",[]);
      showDetail(detailModel);
      // commentList和addComment对话框 的显示都要依靠clipdetail
      App.vent.trigger("clip:getComment", cid);
      App.vent.trigger("clip:addComment", cid);
    });
  };
  return Detail;
})(App, Backbone, jQuery);