App.ClipApp.ClipDetail = (function(App, Backbone, $){
  var ClipDetail = {};
  var COMM_TEXT = "说点什么吧~";
  var P = App.ClipApp.Url.base;
  App.Model.DetailModel = App.Model.extend({
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
      // if(this.model.get("clip")){this.model.unset("clip");}
      switch(opt){
	case 'biezhen':
	  App.vent.trigger("app.clipapp:reclip", cid);break;
	case 'refresh':
	  App.vent.trigger("app.clipapp:recommend", this.model);break;
	case 'comment':
	  App.vent.trigger("app.clipapp.clipdetail:comment", cid);break;
	case 'note':
	  App.vent.trigger("app.clipapp:clipmemo", cid);break;
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
      App.vent.trigger("app.clipapp.clipdetail:show_reply", cid, pid);
    },
    del_comment : function(e){
      e.preventDefault();
      // App.vent.unbind("app.clipapp.message:sure");//解绑 解决请求多次的问题
      var cid = this.model.get("cid");
      var id = e.target.id;
      App.vent.trigger("app.clipapp.message:alert", "删除评论!");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.clipdetail:delComment", cid, id);
      });
    },
    render:function(_model){
      // 针对commetModel进行处理显示
      var that = this;
      var model = (_model) ? _model.toJSON() :  this.model.toJSON();
      // 将拿到的model对象变为数组
      var res = [];
      for(var i in model){
	if(i != "cid" ) res.push(model[i]);
      }
      var clip_owner = model.cid.split(":")[0];

      var template = this.getTemplateSelector();
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
            return render_tree(commentList, html+str);
	  }
	}
	that.$el.html(render_tree(res, ""));
	/*if (that.onRender){that.onRender();}*/
      });
      return this;
     }
  });

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
      if($("#comm_text").val() == COMM_TEXT ){
	$("#comm_text").val("");
      }
    },
    blurAction:function(evt){
      if($("#comm_text").val() == ""){
	$("#comm_text").val(COMM_TEXT);
      }
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      // 可以在css中添加两个class，点击过后在两个class之间切换
      var color = $("#"+id).css("backgroundColor");
      if(color != "rgb(255, 0, 0)"){
	$("#"+id).css("backgroundColor","red");
	this.tag_list.push($("#"+id).val());
	if($("#comm_text").val() == "" || $("#comm_text").val() == COMM_TEXT){
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
      e.preventDefault();
      if(!App.ClipApp.getMyUid()){
	App.vent.trigger("app.clipapp:login");
      }else{
	var cid = this.model.get("cid");
	var pid = this.model.get("pid") ? this.model.get("pid") : 0;
	var text = ($("#comm_text").val()).replace(/[\s]/g, "");
	if(text == "" || text == COMM_TEXT)return;
	var params = {cid: cid, text: text, pid: pid};
	App.vent.trigger("app.clipapp.clipdetail:save_addComm", params);
	if($("#reclip").attr("checked")){ // console.log("同时收");
	  // 没有重构 可否在detail中就收了该clip
	  var params1 = {clip:{tag:this.tag_list,note:[{text:text}]}};
	  App.vent.trigger("app.clipapp.reclip:submit",this.model,params1);
	}
      }
    },
    cancel : function(){
      // 需要将选中状态进行重置，同时将this.tag_list重置
      $("#comm_text").val(COMM_TEXT);
      this.tag_list.forEach(function(e){
	var id = $("input[value="+e+"]").attr("id");
	$("#"+id).css("backgroundColor","");
      });
      this.tag_list = [];
      App.vent.trigger("app.clipapp.clipdetail:cancel_addComm", this.model.id);
    }
  });

  // 显示clip的detail内容 [clipDetiail 以及 Comment]
  function showDetail (detailModel){
    var detailView = new DetailView({model: detailModel});
    App.viewRegion.show(detailView);
  };

  // 获取comment内容，需要对得到的数据进行显示
  function showComment (cid){
    var comment = new App.Model.CommentModel({cid: cid});
    comment.fetch();
    comment.onChange(function(commentModel){
      var commentView = new CommentView({model: commentModel});
      ClipDetail.commentRegion = new App.Region({el:".comments"});
      ClipDetail.commentRegion.show(commentView);
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

  ClipDetail.show = function(cid){   // 此处的cid等于detailModel.id
    var clip = new App.Model.DetailModel({id: cid});
    clip.fetch();
    clip.onChange(function(detailModel){
      showDetail(detailModel);
      showComment(cid);
      showAddComm(cid);
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

  App.vent.bind("app.clipapp.clipdetail:show_reply", function(cid, pid){
    ClipDetail.addCommRegion.close();
    if(!App.ClipApp.Me.me.get("id")){
      App.vent.trigger("app.clipapp:login");
    }else{
      var model = new App.Model.CommentModel({cid : cid, pid: pid});
      var replyView = new AddCommView({model: model});
      ClipDetail.replyCommRegion = new App.Region({
	el: "#reply_Comm_showDiv"
      });
      ClipDetail.replyCommRegion.show(replyView);
    }
  });

  App.vent.bind("app.clipapp.clipdetail:cancel_addComm", function(cid){
    if(ClipDetail.replyCommRegion){
      ClipDetail.replyCommRegion.close();
      showAddComm(cid);
    }
  });

  App.vent.bind("app.clipapp.clipdetail:save_addComm", function(data){
    var model = new App.Model.CommentModel(data);
    model.save(data,{
      success:function(comment,response){
	showComment(data.cid);
	showAddComm(data.cid);
	App.vent.trigger("app.clipapp.cliplist:comment",data.pid);
	// 触发preview中对回复条数的同步
	// var listmodel=App.listRegion.currentView.collection.get(id);
	// var modifyclip=listmodel.get("clip");
	// modifyclip.reply_count = modifyclip.reply_count ? modifyclip.reply_count+1 : 1;
	// listmodel.set({clip:modifyclip});
	// App.vent.trigger("app.clipapp.cliplist:showlist");
      },
      error:function(comment,response){}
    });
  });

  App.vent.bind("app.clipapp.clipdetail:comment", function(cid){
    // 当点击clipdetail的评时
    if(App.ClipApp.Me.me.get("id")){
      if(ClipDetail.replyCommRegion)
	ClipDetail.replyCommRegion.close();
      showAddComm(cid, true);
    }else{
      App.vent.trigger("app.clipapp:login");
    }
  });

  App.vent.bind("app.clipapp.clipdetail:delComment", function(cid, comm_id){
    var model = new App.Model.CommentModel({cid: cid, id: comm_id});
    model.destroy({
      success:function(model, res){
	// 删除评论成功，重新加载comment
	showComment(cid);
      },
      error:function(model, res){}
    });
  });

  // 应该绑定在那里
  App.vent.bind("app.clipapp.clipdetail:close", function(){
    ClipDetail.close();
  });

  return ClipDetail;
})(App, Backbone, jQuery);