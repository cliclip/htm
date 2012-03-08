// app.commentapp.js

var P = "/_2_";
App.CommentApp = (function(App, Backbone, $){
  var CommentApp = {};

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
      "click .comm_link" : "toggleChildren",
      "mouseover .comm_link" : "discoloration",
      "mouseout .comm_link" : "resume",
      "click .add_comment" : "add_comment",
      "click .del_comment" : "del_comment"
    },
    toggleChildren : function(e){
      e.preventDefault();
      var id = e.target.id;
      if($("#"+id).attr("class") == "comm_link")
	$(e.currentTarget).siblings(".children").toggle();
    },
    discoloration : function(e){
      e.preventDefault();
      $(e.currentTarget).css("background","#f0f");
    },
    resume : function(e){
      e.preventDefault();
      $(e.currentTarget).css("background","#fff");
    },
    add_comment : function(e){
      e.preventDefault();
      var cid = this.model.id;
      var id = e.target.id;
      // 首先在被点击的评论下添加 评论框的div
      $("#"+id).append('<div id="comm_addComm_showDiv"></div>');
      App.vent.trigger("comment:addComment", id, cid);
    },
    del_comment : function(e){
      e.preventDefault();
      var id = e.target.id;
      App.vent.trigger("comment:delComment", id, this.model.id);
    },
    render:function(_model){
      // 针对commetModel进行处理显示
      var that = this;
      var model = (_model) ? _model.toJSON() :  this.model.toJSON();
      // 将拿到的model对象变为数组
      var res = [];
      for(var i in model){
	if(i != "id" ) {
	  res.push(model[i]);
	}
      }
      this.getTemplate(function(template){
	function render_tree(commentList, html){
	  var e = commentList.shift();
	  // console.log("render_tree :: %j %s", e, html);
	  if(!e) {
	    return html;
	  } else {
	    var str = that.renderTemplate(template, e);
	    if (e.children && e.children.length > 0) {
	      str += "<div class='children'>";
	      str += render_tree(e.children, "");
	      str += "</div>";
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

  var AddCommModel = App.Model.extend({});
  var AddCommView = App.ItemView.extend({
    tagName: "div",
    className: "addComm-view",
    template: "#addcomm-view-template",
    value: "评论文本框",
    events:{
      "click .comm": "Comment", // 评论的各个选项 点击事件
      "click .addComment":"add_Comment",
      "focus #comm_text": "ClearAction", // 评论输入框 事件
      "blur #comm_text": "AddAction"
    },
    ClearAction:function(evt){
      if($("#comm_text").val().trim() == this.value){
	$("#comm_text").val("");
      }
    },
    AddAction:function(evt){
      if($("#comm_text").val() == ""){
	$("#comm_text").val(this.value);
      }
    },
    Comment:function(evt){ // 正确
      var id = evt.target.id;
      var val = $("#"+id).val();
      var val1 = $("#comm_text").val();
      if(val1 == this.value){
	$("#comm_text").val(val);
      }else{
	$("#comm_text").val(val1+" "+val);
      }
    },
    // 该方法响应的有可能即是对clip的直接评论，又是对comment的回复
    add_Comment:function(evt){
      // 之后从登录后设置的cookie中得到
      //document.cookie = "token=1:ad44a7c2bc290c60b767cb56718b46ac";
      var pid = this.model.get("pid") ? this.model.get("pid") : 0;
      var cid = this.model.id;
      this.model.save({text: $("#comm_text").val(),pid : pid},
      {
	url: P+"/clip/"+cid+"/comment",
	type: "POST",
	success:function(comment,response){
	  CommentApp.getComment(cid);
	  $("#comm_text").val("评论文本框");
	},
	error:function(comment,response){
	  console.log(response);
	}
      });
      }
  });

  // 在tmpl/detail-view-template中
  var showComment = function(commentModel){
    var commentView = new CommentView({model: commentModel});
    CommentApp.commentRegion = new App.RegionManager({
      el:"#comment_showDiv"
    });
    CommentApp.commentRegion.show(commentView);
  };

  // 在tmpl/detail-view-template中
  var showAddComm = function(addCommModel){
    var addCommView = new AddCommView({model: addCommModel});
    CommentApp.addCommRegion = new App.RegionManager({
      el:"#addComm_showDiv"
    });
    CommentApp.addCommRegion.show(addCommView);
  };

  // 获取comment内容，需要对得到的数据进行显示
  CommentApp.getComment = function(cid){
    var comment = new CommentModel({id: cid});
    comment.fetch();
    comment.onChange(showComment);
  };

  CommentApp.addComment = function(cid){
    var addCommModel = new AddCommModel({id: cid});
    showAddComm(addCommModel);
  };

  // 对评论进行回复，应该要有取消按钮在，评论的对应位置显示评论输入框
  CommentApp.comm_addComment = function(id, cid){
    var addCommModel = new CommentModel({id : cid});
    addCommModel.set("pid",id);
    var addCommView = new AddCommView({model: addCommModel});
    CommentApp.comm_addCommRegion = new App.RegionManager({
      el: "#comm_addComm_showDiv"
    });
    CommentApp.comm_addCommRegion.show(addCommView);
  };

  CommentApp.comm_delComment = function(id, cid){
    var addCommModel = new CommentModel({id: cid});
    addCommModel.destroy({
      url: P+"/clip/"+cid+"/comment/"+id,
      success:function(model, res){
	// 删除评论成功，重新加载comment
	CommentApp.getComment(cid);
      },
      error:function(model, res){
	// console.log(res);
      }
    });
  };

  CommentApp.close = function(){
    CommentApp.commentRegion.close();
    CommentApp.addCommRegion.close();
  };

  // App.vent.bind方便调用 app.clipapp.js 触发
  App.vent.bind("clip:getComment", function(cid){
    CommentApp.getComment(cid);
  });

  // 最底层的回复对话框 app.clipapp.js触发
  App.vent.bind("clip:addComment", function(cid){
    CommentApp.addComment(cid);
  });

  App.vent.bind("comment:addComment", function(pid, cid){
    CommentApp.comm_addComment(pid, cid);
  });

  App.vent.bind("comment:delComment", function(id, cid){
    CommentApp.comm_delComment(id, cid);
  });

  App.vent.bind("clip:closeComment", function(){
    CommentApp.close();
  });

  return CommentApp;
})(App, Backbone, jQuery);