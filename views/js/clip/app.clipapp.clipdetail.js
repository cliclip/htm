App.ClipApp.ClipDetail = (function(App, Backbone, $){

  var ClipDetail = {};
  var mid, number_limit = 140, hist, offset;
  var P = App.ClipApp.Url.base;

  App.Model.DetailModel = App.Model.extend({
    defaults:{
      "public": true
    },
    url:function(){
      var uid = this.get("id").split(":")[0];
      var cid = this.get("id").split(":")[1];
      return App.ClipApp.encodeURI(P+"/"+uid + "/" + cid)+"&rid="+this.get("rid");
    },
    parse: function(resp){ // 跟cliplist一致，使得model.id = "uid:id"
      if(!/:/.test(resp.id)){
	resp.id = resp.user+":"+resp.id;
      }
      // resp.content = App.util.expandConImgUrl(resp.content,resp.user,resp.id);
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
	case 'share':
	  var content = this.model.get("content");
	  App.ClipApp.showShareDialog(cid, pub, App.util.getPreview(content,100)); break;
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
      "mouseenter .comment_show" : "show_del",
      "mouseleave .comment_show" : "hide_del",
      "click .reply_comment" : "reply_comment",
      "click .del_comment" : "del_comment"
    },
    initialize : function(){
      this.bind("@reply", showReply);
      this.bind("@delComment", delComment);
    },
    show_del : function(e){
      e.preventDefault();
      var id = e.currentTarget.id || e.currentTarget.children[0].id;
      id = id.match(/\d+/)[0];
      $("#reply_"+id+"_del").show();
    },
    hide_del : function(e){
      e.preventDefault();
      var id = e.currentTarget.id || e.currentTarget.children[0].id;
      id = id.match(/\d+/)[0];
      $("#reply_"+id+"_del").hide();
    },
    reply_comment : function(e){
      e.preventDefault();
      if(e.target.id.match(/reply_/)){
	var cid = this.model.get("cid"); // 取得当前detail的id
	var user = this.model.get("user");
	this.trigger("@reply", cid, user);
      }
    },
    del_comment : function(e){
      e.preventDefault();
      if(e.target.id.match(/del_/)){
	var view = this;
	var cid = this.model.get("cid");
	var id = e.target.id.split("_")[1];
	App.ClipApp.showAlert("del_comment", null, function(){
	  view.trigger("@delComment", cid, id);
	});
      }
    }
  });

  var CommentList = App.CollectionView.extend({
     tagName: "div",
     className: "comments",
     itemView: CommentView
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
      "click .verify"    : "comment"
    },
    initialize:function(){
      this.bind("@saveaddComm", saveaddComm);
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

  var CommentModel = App.Model.extend({
    defaults:{
      cid:'',
      id: '',
      user: '',
      date: '',
      text: ''
    }
  });

  var commCollection = App.Collection.extend({
    model : CommentModel
  });

  // 获取comment内容，需要对得到的数据进行显示
  function showComment (cid){
    var list = new commCollection();
    list.fetch({url:App.ClipApp.encodeURI(P + "/" + cid.split(":")[0] + "/" +cid.split(":")[1] +"/comment")});
    list.onReset(function(commentCollection){ // rename CommentsView
      var comms = commentCollection.toJSON();
      if(comms.length!= 1 || comms[0].id){
	// ie 8不支持arrayObj.forEach()的写法
	_.each(commentCollection.models,function(model){
	  model.set('cid', cid);
	});
	var commentList = new CommentList({collection: commentCollection});
	ClipDetail.commentRegion = new App.Region({el:".comments"});
	ClipDetail.commentRegion.show(commentList);
      }
    });
  };

  function showAddComm (cid, focus){
    var model = new App.Model.CommentModel({cid: cid});
    var addCommView = new AddCommView({model: model});
    ClipDetail.addCommRegion = new App.Region({el:".input_textarea"});
    ClipDetail.addCommRegion.show(addCommView);
    $(".cancel").css("display","none");
    if(focus) $("#comm_text").focus(); // 如果是弹出的回复对话框就要聚焦
  };

  function showReply (cid, user){
    var uname = user.name;
    showAddComm(cid, true);
    $("#comm_text").val("@"+uname);
  };

  var detailClose = function(){
    ClipDetail.close();
  };

  var detailComment = function(cid){ // 当点击clipdetail的评时
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){ showAddComm(cid, true); });
    }else{
      showAddComm(cid, true);
    }
  };

  var delComment = function(cid, comm_id){

    var model = new App.Model.CommentModel({cid: cid, id: comm_id});
    model.destroy({
      success:function(model, res){ // 删除评论成功，重新加载comment
	showComment(cid);
	showAddComm(cid);
	App.vent.trigger("app.clipapp.delComment:success",  {model_id:mid});
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

  var saveaddComm = function(view, params, mid){
    var model = new App.Model.CommModel();
    var uid = params.clipid.split(":")[0];
    var cid = params.clipid.split(":")[1];
    model.save({pid:params.pid, text:params.text},{
      url : App.ClipApp.encodeURI(P+"/"+uid + "/" + cid +"/comment"),
      success:function(comment,response){
	/*if(params1){ // 避免comment和reclip同时去写clip数据
	  App.vent.trigger("app.clipapp.reclip:sync",params1,mid);
	}*/
	showComment(params.clipid);
	showAddComm(params.clipid);
	App.vent.trigger("app.clipapp.comment:success",  {model_id:mid});
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

  ClipDetail.show = function(cid,model_id,recommend, link){ // cid等于detailModel.id
    var ids = cid.split(":");
    var model = new App.Model.DetailModel({id: cid, rid:recommend.rid, ruser:recommend.user});
    mid = model_id;
    // 获取当前页面的 url 以及 scrollTop
    hist = Backbone.history.fragment;
    offset = $(window).scrollTop() || $(document.body).scrollTop();
    if(link) Backbone.history.navigate("link/"+link, false);
    else Backbone.history.navigate("clip/"+ids[0]+"/"+ids[1], false);
    model.fetch({
      success:function(res,detailModel){
	model.onChange(function(detailModel){
	  // 去掉图片标签中的width和height 与$(".content")预设的固定宽度冲突
	  var clip = detailModel.toJSON();
	  var content = App.util.expandConImgUrl(clip.content,clip.user,clip.id);
	  var reg = /width=(\'|\")(\d+)(\'|\")\sheight=(\'|\")(\d+)(\'|\")/g;
	  // 为每一张图片添加onerror事件，加载本地文件失败改加载服务器端文件
	  detailModel.set("content",content.replace(reg,"onerror=\"App.util.img_error(this)\""));
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
    regionClose("addCommRegion");
    App.popRegion.close();
    resetUrl(hist, offset);
    App.viewRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    if(ClipDetail.addCommRegion){
      ClipDetail.close();
    }
  });

  return ClipDetail;
})(App, Backbone, jQuery);