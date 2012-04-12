App.ClipApp.ClipDetail = (function(App, Backbone, $){
  var ClipDetail = {};
  var P = App.ClipApp.Url.base;

  var DetailModel = App.Model.extend({
    defaults:{
      imguid:""
    },
    url: function(){
      return P+"/clip/"+this.id;
    },
    // 跟cliplist一致，使得model.id = "uid:id"
    parse: function(resp){
      resp.id = resp.user+":"+resp.id;
      return resp;
    }
  });

  var DetailView = App.ItemView.extend({
    tagName: "div",
    className: "Detail-view",
    template: "#detail-view-template",
    events: {
      "click .operate" : "Operate",
      "click .masker_layer" : "Close", // 点击detail下的层，便隐藏
      "click .close_w":"Close"
    },
    Operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(" ")[0];
      var cid = this.model.id;
      switch(opt){
	case 'biezhen':
	  App.vent.trigger("app.clipapp:reclip", this.model);break;
	case 'refresh':
	  App.vent.trigger("app.clipapp:recommend", cid);break;
	case 'comment':
	  App.vent.trigger("app.clipapp.clipdetail:comment", cid);break;
	case 'note':
	  App.vent.trigger("app.clipapp:clipmemo", this.model);break;
	case 'change':
	  App.vent.trigger("app.clipapp:clipedit", cid);break;
	case 'del':
	  App.vent.trigger("app.clipapp:clipdelete", cid);break;
      }
    },
    Close: function(){
      App.vent.trigger("app.clipapp.clipdetail:close");
    }
  });

  var CommentModel = App.Model.extend({
    url: function(){
      return P+"/clip/"+this.id+"/comment";
    }
  });

  var CommentView = App.ItemView.extend({
    tagName: "div",
    className: "showcomment-view",
    template: "#showcomment-view-template",
    events: {
      "click .comment_con" : "toggleChildren",
      "mouseover .comm_link" : "discoloration",
      "mouseout .comm_link" : "resume",
      "click .reply_comment" : "reply_comment",
      "click .del_comment" : "del_comment"
    },
    toggleChildren : function(e){
      e.preventDefault();
      if($(e.target).attr("class") == "comm_link"){
	// 取得当前的marking
	var marking = $(e.target).children(".marking").text();
	if(marking){ // 如果有值取反
	  marking = marking == '+' ? '-' :'+';
	  $(e.target).children(".marking").text(marking);
	}
	$(e.currentTarget).siblings(".children").toggle();
      }
    },
    discoloration : function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      $("#reply_"+id).css("display","block");
      // $(e.currentTarget).css("background","#f0f");
    },
    resume : function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      $("#reply_"+id).css("display","none");
      $(e.currentTarget).css("background","#fff");
    },
    reply_comment : function(e){
      e.preventDefault();
      var cid = this.model.id;
      var id = e.target.id;
      // 首先在被点击的评论下添加 评论框的div
      if($("#reply_Comm_showDiv"))
	$("#reply_Comm_showDiv").remove();
      $("#"+id).append('<div id="reply_Comm_showDiv"></div>');
      App.vent.trigger("app.clipapp.clipdetail:hide_addComm");
      App.vent.trigger("app.clipapp.clipdetail:show_reply", id, cid);
    },
    del_comment : function(e){
      e.preventDefault();
      var id = e.target.id;
      App.vent.trigger("app.clipapp.clipdetail:delComment", id, this.model.id);
    },
    render:function(_model){
      // 针对commetModel进行处理显示
      var that = this;
      var model = (_model) ? _model.toJSON() :  this.model.toJSON();
      // 将拿到的model对象变为数组
      var res = [];
      var clip_owner = model.id.split(":")[0];
      var auth = App.ClipApp.getMyUid();
      for(var i in model){
	if(i != "id" )
	  res.push(model[i]);
      }
      var template = this.getTemplateSelector();
      var templateRetrieval = App.TemplateCache.get(template);
      $.when(templateRetrieval).then(function(template){
	function render_tree(commentList, html){
	  var e = commentList.shift();
	  // console.log("render_tree :: %j %s", e, html);
	  if(!e) {
	    return html;
	  } else {
	    e.auth = auth;
	    e.clip_owner = clip_owner;
	    if(e.children && e.children.length <= 0){
	      e.has_child = false; // 表明该结点没有子节点
 	    }else{
	      e.has_child = true;
	    }
	    var str = _.template(template, e);
	    if (e.children && e.children.length > 0) {
	      str += "<ul class='children'>";
	      str += render_tree(e.children, "");
	      str += "</ul>";
	    }
	    str = '<div>'+str+'</div>';
            return render_tree(commentList, html+str);
	  }
	}
	that.$el.html(render_tree(res, ""));
	if (that.onRender){
	  that.onRender();
        }
      });
      return this;
     }
  });

  // 显示clip的detail内容 [clipDetiail 以及 Comment]
  var showDetail = function(detailModel){
    var detailView = new DetailView({
      model: detailModel
    });
    App.viewRegion.show(detailView);
  };

  // uid为当前登录用户
  ClipDetail.show = function(uid, cid){
    // 此处的cid并不等于detailModel.id
    var clip = new DetailModel({id: cid});
    clip.fetch();
    clip.onChange(function(detailModel){
      showDetail(detailModel);
      ClipDetail.showComment(cid);
      ClipDetail.showAddComm(cid);
    });
  };

  // 获取comment内容，需要对得到的数据进行显示
  ClipDetail.showComment = function(cid){
    var comment = new CommentModel({id: cid});
    comment.fetch();
    comment.onChange(function(commentModel){
      var commentView = new CommentView({model: commentModel});
      ClipDetail.commentRegion = new App.Region({
	el:".comments"
      });
      ClipDetail.commentRegion.show(commentView);
    });
  };


  var AddCommView = App.ItemView.extend({
    tagName : "div",
    className : "addcomment-view",
    template : "#addcomm-view-template",
    tag_list : [],
    events : {
      "focus #comm_text" : "foucsAction",
      "blur #comm_text"  : "blurAction",
      "click .main_tag"  : "maintagAction",
      "click .verify"    : "comment",
      "click .cancel"    : "cancel"
    },
    foucsAction:function(evt){
      if($("#comm_text").val() == "评论文本框~" ){
	$("#comm_text").val("");
      }
    },
    blurAction:function(evt){
      if($("#comm_text").val() == ""){
	$("#comm_text").val("评论文本框~");
      }
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      var color = $("#"+id).css("backgroundColor");
      if(color != "rgb(255, 0, 0)"){
	$("#"+id).css("backgroundColor","red");
	// document.getElementById(id).style.backgroundColor="red";
	this.tag_list.push($("#"+id).val());
	if($("#comm_text").val() == "" || $("#comm_text").val() == "评论文本框~"){
	  $("#comm_text").val($("#"+id).val());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "rgb(255, 0, 0)"){
	$("#"+id).css("backgroundColor","");
	this.tag_list = _.without(this.tag_list,$("#"+id).val());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).val()));
      }
    },
    comment : function(e){
      if(!App.ClipApp.getMyUid()){
	App.vent.trigger("app.clipapp:login");
      }else{
	e.preventDefault();
	var id = this.model.id;
	var pid = this.model.get("pid") ? this.model.get("pid") : 0;
	var text = $("#comm_text").val();
	var params = {text: text, pid: pid};
	this.model.save({text: text,pid : pid},
	{
	  url: P+"/clip/"+id+"/comment",
	  type: "POST",
	  success:function(comment,response){
	    ClipDetail.showComment(id);
	    ClipDetail.showAddComm(id);
	  },
	  error:function(comment,response){}
	});
	if($("#reclip").attr("checked")){
	  var params1 = {clip:{tag:this.tag_list,note:[{text:text}]}};
	  // console.log("同时收");
	  App.vent.trigger("app.clipapp.reclip:submit",this.model,params1);
	}
      }
    },
    cancel : function(){
      // 需要将选中状态进行重置，同时将this.tag_list重置
      $("#comm_text").val("评论文本框~");
      this.tag_list.forEach(function(e){
	var id = $("input[value="+e+"]").attr("id");
	$("#"+id).css("backgroundColor","");
      });
      this.tag_list = [];
      App.vent.trigger("app.clipapp.clipdetail:cancel_addComm", this.model.id);
    }
  });

  ClipDetail.showAddComm = function(cid, focus){
    var addCommModel = new CommentModel({id: cid});
    var self = (cid.split(":")[0] == App.ClipApp.Me.me.get("id"));
    addCommModel.set("self",self);
    var addCommView = new AddCommView({model: addCommModel});
    ClipDetail.addCommRegion = new App.Region({
      el:".input_textarea"
    });
    ClipDetail.addCommRegion.show(addCommView);
    $(".cancel").css("display","none");
    if(focus)
      $("#comm_text").focus();
  };

  // 对评论进行回复，应该要有取消按钮在，评论的对应位置显示评论输入框
  ClipDetail.show_reply = function(id, cid){
    var replyCommModel = new CommentModel({id : cid});
    replyCommModel.set("pid",id);
    var replyCommView = new AddCommView({model: replyCommModel});
    ClipDetail.replyCommRegion = new App.Region({
      el: "#reply_Comm_showDiv"
    });
    ClipDetail.replyCommRegion.show(replyCommView);
  };

  ClipDetail.delComment = function(id, cid){
    var addCommModel = new CommentModel({id: cid});
    addCommModel.destroy({
      url: P+"/clip/"+cid+"/comment/"+id,
      success:function(model, res){
	// 删除评论成功，重新加载comment
	ClipDetail.showComment(cid);
      },
      error:function(model, res){}
    });
  };

  ClipDetail.close = function(){
    if(ClipDetail.commentRegion){
      ClipDetail.commentRegion.close();
    }
    if(ClipDetail.replyCommRegion){
      ClipDetail.replyCommRegion.close();
    }else{
      ClipDetail.addCommRegion.close();
    }
    App.popRegion.close();
    App.viewRegion.close();
  };

  App.vent.bind("app.clipapp.clipdetail:show_reply", function(pid, cid){
    ClipDetail.show_reply(pid, cid);
  });

  App.vent.bind("app.clipapp.clipdetail:cancel_addComm", function(cid){
    if(ClipDetail.replyCommRegion){
      ClipDetail.replyCommRegion.close();
      ClipDetail.showAddComm(cid);
    }
  });

  App.vent.bind("app.clipapp.clipdetail:comment", function(cid){
    // 当点击clipdetail的评时
    if(App.ClipApp.Me.me.get("id")){
      if(ClipDetail.replyCommRegion)
	ClipDetail.replyCommRegion.close();
      ClipDetail.showAddComm(cid, true);
    }else{
      App.vent.trigger("app.clipapp:login");
    }
  });

  App.vent.bind("app.clipapp.clipdetail:hide_addComm", function(){
    ClipDetail.addCommRegion.close();
  });
  App.vent.bind("app.clipapp.clipdetail:delComment", function(id, cid){
    ClipDetail.delComment(id, cid);
  });

  // 应该绑定在那里
  App.vent.bind("app.clipapp.clipdetail:close", function(){
    ClipDetail.close();
  });

  return ClipDetail;
})(App, Backbone, jQuery);