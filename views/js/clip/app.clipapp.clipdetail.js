App.ClipApp.ClipDetail = (function(App, Backbone, $){

  var ClipDetail = {};
  var mid, number_limit = 140, hist, offset;
  var P = App.ClipApp.Url.base;

  App.Model.DetailModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/clip/"+this.id)+"&rid="+this.get("rid");
    },
    parse: function(resp){ // 跟cliplist一致，使得model.id = "uid:id"
      resp.id = resp.user+":"+resp.id;
      return resp;
    }
  });

  var DetailView = App.DialogView.extend({
    tagName: "div",
    className: "Detail-view",
    template: "#detail-view-template",
    events: {
      "click .operate" : "Operate",
      "click .masker" : "Masker", // 点击detail下的层，便隐藏
      "click .close_w": "Close",
      "click .user_head": "Close",
      "dblclick .content": "editDetail"
    },
    initialize: function(){
      this.bind("@detailComment", detailComment);
      this.bind("@detailClose", detailClose);
    },
    Operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(" ")[0];
      var cid = this.model.id;
      var pub = this.model.get("public");
      switch(opt){
	case 'reclip':
	  var recommend = {
	    rid : this.model.get("rid"),
	    user: this.model.get("ruser")
	  };
	  App.ClipApp.showReclip(cid, mid, recommend, pub); break;
	// case 'recommend':
	  //App.vent.trigger("app.clipapp:recommend", cid,mid,pub);break;
	case 'comment':
	  this.trigger("@detailComment", cid);break;
	case 'note':
	  App.ClipApp.showMemo(cid); break;
	case 'modify':
	  this.trigger("@detailClose");
	  App.ClipApp.showEditClip(cid); break;
	case 'del':
	  App.ClipApp.showClipDelete(cid); break;
      }
    },
    Masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@detailClose");
      }
    },
    Close: function(e){
      this.trigger("@detailClose");
    },
    editDetail: function(e){
      this.trigger("@detailClose");
      App.ClipApp.showEditClip(this.model.id);
    }
  });

  var CommentView = App.ItemView.extend({
    tagName: "div",
    className: "showcomment-view",
    template: "#showcomment-view-template",
    events: {
      "click .text" : "toggleChildren",
      "mouseover .comment_show" : "discoloration",
      "mouseout .comment_show" : "resume",
      "click .reply_comment" : "reply_comment",
      "click .del_comment" : "del_comment"
    },
    initialize: function(){
      this.bind("@reply", showReply);
      this.bind("@delComment", delComment);
    },
    toggleChildren : function(e){
      e.preventDefault();
      var curr = $(e.target).attr("class");
      var open = _i18n('showcomment.open');
      var pack = _i18n('showcomment.pack');
      if(curr == "marking"){
	var marking = $(e.target).text();
	if(marking)
	  $(e.target).text(marking == open ? pack : open);
      }else{
	var marking = $(e.target).siblings(".marking").text();
	if(marking)
	  $(e.target).siblings(".marking").text(marking == open ? pack : open);
      }
      var div = $($(e.currentTarget).parent()[0]).parent();
      $(div).siblings(".children").toggle();
    },
    discoloration : function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      $("#reply_"+id).css("display","block");
    },
    resume : function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      $("#reply_"+id).css("display","none");
    },
    reply_comment : function(e){
      e.preventDefault();
      var cid = this.model.get("cid"); // 取得当前detail的id
      var pid = e.target.id;   // 取得当前评论的id
      if($("#reply_Comm_showDiv"))  // 首先在被点击的评论下添加 评论框的div
	$("#reply_Comm_showDiv").remove(); // 保证detail页面只有一个评论回复框
      $("#"+pid).append('<div id="reply_Comm_showDiv"></div>');
      this.trigger("@reply", cid, pid);
    },
    del_comment : function(e){
      e.preventDefault();
      var view = this;
      var cid = this.model.get("cid");
      var id = e.target.id;
      App.ClipApp.showAlert("del_comment", null, function(){
	view.trigger("@delComment", cid, id);
      });
    },
    render:function(_model){  // 针对commetModel进行处理显示
      var that = this;
      var model = _model ? _model.toJSON() :  this.model.toJSON();
      var res = [];
      for(var i in model){ // 将拿到的model对象变为数组
	if(i != "cid" ) res.push(model[i]);
      }
      var clip_owner = model.cid.split(":")[0];
      var template = this.getTemplateSelector();
      // 远程调用template,我们用的是本地调用 TODO
      var templateRetrieval = App.TemplateCache.get(template);
      $.when(templateRetrieval).then(function(template){
	function render_tree(commentList, html){
	  var e = commentList.shift();
	  // console.log("render_tree :: %j %s", e, html);
	  if(!e) {
	    return html;
	  } else {
	    e.clip_owner = clip_owner;
	    if(e.children && e.children.length <= 0){ e.has_child = false;}
	    else{e.has_child = true;} // has_child 用于显示控制
	    var str = _.template(template, e);
	    if (e.children && e.children.length > 0) {
	      str += "<ul class='children'>";
	      str += render_tree(e.children, "");
	      str += "</ul>";
	    }
	    str = '<div>'+str+'</div>';
	  };
	  return render_tree(commentList, html+str);
	}
      that.$el.html(render_tree(res, ""));
      /*if (that.onRender){that.onRender();}*/
      return this;
     });
    }
  });

  var AddCommView = App.ItemView.extend({
    tagName : "div",
    className : "addcomment-view",
    template : "#addcomm-view-template",
    //tag_list : [],
    events : {
      "focus #comm_text" : "focusAction",
      "blur #comm_text"  : "blurAction",
      //"click .main_tag"  : "maintagAction",
      "keydown #comm_text":"shortcut_comment",
      "click .verify"    : "comment",
      "click .cancel"    : "cancel"
    },
    initialize:function(){
      this.bind("@saveaddComm", saveaddComm);
      this.bind("@canceladdComm", canceladdComm);
    },
    focusAction:function(e){
      e.currentTarget.select();//将光标定位到当前选中元
      this.$(".verify").attr("disabled",false);
      this.cleanError(e);
      var text = $(e.currentTarget).val();
      $(e.currentTarget).val(text == _i18n('comment.defaultText') ? "" : text);
    },
    blurAction:function(e){
      var text = $(e.currentTarget).val();
      $(e.currentTarget).val(text == "" ? _i18n('comment.defaultText') : text);
    },
    /*maintagAction:function(e){
      $("#comm_text").focus();
      var id = e.target.id;
      $(e.currentTarget).toggleClass("original");
      $(e.currentTarget).toggleClass("selected");
      if($(e.currentTarget).hasClass("selected")){
	//将其值加入到comm_text中去
	this.tag_list.push($("#"+id).val());
	if($("#comm_text").val() == "" || $("#comm_text").val() == _i18n('comment.defaultText')){
	  $("#comm_text").val($("#"+id).val());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).val()));
	}
      }else if($(e.currentTarget).hasClass("original")){
	this.tag_list = _.without(this.tag_list,$("#"+id).val());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).val()));
      }
    },*/
    comment : function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var view = this;
      var cid = this.model.get("cid");
      var pid = this.model.get("pid") ? this.model.get("pid") : 0;
      var text = $.trim($("#comm_text").val());
      text = App.util.cleanInput(text); // 过滤一下评论内容，防止脚本注入
      var params = {clipid: cid, text: text, pid: pid};
      /*var params1 = null;
      if($("#reclip").attr("checked")){ // checked 、tag_list都是全局变量
	params1 = {id:cid,clip:{tag:this.tag_list,note:[{text:text}]}};
      }*/
      if(!App.ClipApp.isLoggedIn()){
	App.ClipApp.showLogin(function(){
	  view.trigger("@saveaddComm",this, params, mid);
	});
      }else{
	view.trigger("@saveaddComm", this, params, mid);
      }
    },
    shortcut_comment : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$(".verify").click();
	return false;
      }else{
	return true;
      }
    },
    cancel : function(){
      this.trigger("@canceladdComm",this.model.get("cid"));
    }
  });

  // 显示clip的detail内容 [clipDetiail 以及 Comment]
  function showDetail (detailModel){
    var detailView = new DetailView({model: detailModel});
    App.viewRegion.show(detailView);
    $("#focus").focus(); // 是的详情响应pagedowm pageup等键盘事件
    var anchors = this.$(".content a");
    for(var i=0;i<anchors.length;i++){
      var anchor = anchors[i];
      anchor.target="_blank";
    }
  };

  // 获取comment内容，需要对得到的数据进行显示
  function showComment (cid){
    var comment = new App.Model.CommentModel({cid: cid});
    comment.fetch();
    comment.onChange(function(commentModel){ // rename CommentsView
      var commentView = new CommentView({model: commentModel});
      ClipDetail.commentRegion = new App.Region({el:".comments"});
      ClipDetail.commentRegion.show(commentView);
    });
  };

  function showReplyComm (cid, pid){
    regionClose("addCommRegion"); // 关闭最下边的评论框区域
    var model = new App.Model.CommentModel({cid : cid, pid: pid});
    var replyView = new AddCommView({model: model});
    ClipDetail.replyCommRegion = new App.Region({
      el: "#reply_Comm_showDiv"
    });
    ClipDetail.replyCommRegion.show(replyView);
    $("#comm_text").focus(); // 如果是弹出的回复对话框就要聚焦
  };

  function showAddComm (cid, focus){
    regionClose("replyCommRegion"); // 关闭回复评论框
    var model = new App.Model.CommentModel({cid: cid});
    var addCommView = new AddCommView({model: model});
    ClipDetail.addCommRegion = new App.Region({el:".input_textarea"});
    ClipDetail.addCommRegion.show(addCommView);
    $(".cancel").css("display","none");
    if(focus) $("#comm_text").focus(); // 如果是弹出的回复对话框就要聚焦
  };

  var detailClose = function(){
    ClipDetail.close();
  };

  var detailComment = function(cid){ // 当点击clipdetail的评时
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){
	showAddComm(cid, true);
      });
    }else{
      showAddComm(cid, true);
    }
  };

  var showReply = function(cid, pid){
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){
	showReplyComm(cid, pid);
      });
    }else{
      showReplyComm(cid, pid);
    }
  };

  var delComment = function(cid, comm_id){
    var model = new App.Model.CommentModel({cid: cid, id: comm_id});
    model.destroy({
      success:function(model, res){ // 删除评论成功，重新加载comment
	showComment(cid);
	showAddComm(cid);
      },
      error:function(model, res){}
    });
  };

  var resetUrl = function(hist, offset){
    if(/clip\/([0-9]+)\/([0-9]+)/.test(hist)) hist = "";
    Backbone.history.navigate(hist, false);
    if($('html').hasClass("lt-ie8")){ // ie7
      $(document.body).scrollTop(offset);
    }else{
      $(window).scrollTop(offset);
    }
  };

  var canceladdComm = function(cid){
    regionClose("replyCommRegion");
    showAddComm(cid);
  };

  var saveaddComm = function(view, params, mid){
    var model = new App.Model.CommModel();
    model.save({pid:params.pid, text:params.text},{
      url : App.ClipApp.encodeURI(P+"/clip/"+params.clipid+"/comment"),
      success:function(comment,response){
	/*if(params1){ // 避免comment和reclip同时去写clip数据
	  App.vent.trigger("app.clipapp.reclip:sync",params1,mid);
	}*/
	showComment(params.clipid);
	showAddComm(params.clipid);
	App.vent.trigger("app.clipapp.comment:success",  {type:"comment",pid:params.pid,model_id:mid});
      },
      error:function(comment,res){
	if(res.comm_text == "is_null")
	  $("#comm_text").blur().val("");
	view.showError("comment", res);
      }
    });
  };

  function regionClose(name){
    if(ClipDetail[name]){
      ClipDetail[name].close();
    }
  }

  ClipDetail.show = function(cid,model_id,recommend){ // cid等于detailModel.id
    var ids = cid.split(":");
    var model = new App.Model.DetailModel({id: cid, rid:recommend.rid, ruser:recommend.user});
    mid = model_id;
    // 获取当前页面的 url 以及 scrollTop
    hist = Backbone.history.fragment;
    offset = $(window).scrollTop() || $(document.body).scrollTop();
    Backbone.history.navigate("clip/"+ids[0]+"/"+ids[1], false);
    model.fetch({
      success:function(res,detailModel){
	model.onChange(function(detailModel){
	  showDetail(detailModel);
	  showComment(cid);
	  showAddComm(cid);
	});
      },
      error:function(res,error){
	 App.ClipApp.showConfirm(error);
      }
    });
  };

  ClipDetail.close = function(){
    regionClose("commentRegion");
    regionClose("replyCommRegion");
    regionClose("addCommRegion");
    App.popRegion.close();
    resetUrl(hist, offset);
    App.viewRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    if(ClipDetail.addCommRegion || ClipDetail.replyCommRegion){
      ClipDetail.close();
    }
  });

  return ClipDetail;
})(App, Backbone, jQuery);