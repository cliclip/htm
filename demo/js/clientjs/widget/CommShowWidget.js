CommShowWidget = function (_container,_options){
  this.container = _container;
  this.options = _options;
  this.widgetType = "CommentWidget";
  var value = "评论文本框";
  var commentWidget = this;
  this._view = Backbone.View.extend({
    initialize:function(){},
    template: _.template($("#comm_template").html()),
    events:{
      "click": "ChildShow",
      "mouseover": "MouseOver",
      "mouseout": "MouseOut"
    },
    MouseOver:function(evt){
      $(this.el).css("background","#f0f");
      // var id = evt.target.id;
      // var tag = $("#"+id).children();
      // tag.css("display","block");
    },
    MouseOut:function(evt){
      $(this.el).css("background","#fff");
      // var id = evt.target.id;
      // var tag = $("#"+id).children();
      // tag.css("display","none");
    },
    ChildShow:function(evt){
      // 层级递进关系如何实现
      var flag = 1;
      var id = evt.target.id.split("_")[1];
      var pid = $("#comment_"+id).attr("name");
      if(pid != id){ pid = id; flag = 0; }
      var tags = $("div[name="+pid+"]");
      if(tags.length > flag){ // 所点击的节点有孩子节点
	var display = $("#"+tags[flag].id).css("display");
	this.checkTags(pid, tags, display);
      }
    },
    checkTags:function(pid, tags, display){
      if(!tags) return;
      for(var i=0; i<tags.length; i++){
	var tag = tags[i];
	if(tag == undefined || !tag){
	  return;
	}else{
	  var tmp_id = tag.id.split("_")[1];
	  if(tmp_id != pid){                // 排除自己
	    if(display == "block" ){
	      $("#comment_"+tmp_id).css("display","none");
	    }else{
	      $("#comment_"+tmp_id).css("display","block");
	    }
	    // 更改pid为给定id的结点的孩子节点的显示属性。
	    this.checkTags(pid, $("div[name="+tmp_id+"]"), display);
	  }
	}
      }
    },
    showTree:function(comment){
      if(comment){
	$(this.el).html(this.template({comment:comment}));
	this.comm = $(this.el);
	this.comm.css("margin-left",comment.layer*10+"px");
      }
      return this;
    },
    render:function(_model){
      if(_model){
	model = _model.toJSON();
      }else{
	model = this.model;
      }
      return this.showTree(model);
    }
  });
  this.add_view = Backbone.View.extend({
    initialize:function(){},
    template: _.template($("#addComm_template").html()),
    events:{
      "click .comm": "Comment", // 评论的各个选项 点击事件
      "click #addComment":"addComment",
      "focus #comm_text": "ClearAction", // 评论输入框 事件
      "blur #comm_text": "AddAction"
    },
    ClearAction:function(evt){
      if($("#comm_text").val() == value ){
	$("#comm_text").val("");
      }
    },
    AddAction:function(evt){
      if($("#comm_text").val() == ""){
	$("#comm_text").val(value);
      }
    },
    Comment:function(evt){ // 正确
      var id = evt.target.id;
      var val = $("#"+id).val();
      var val1 = $("#comm_text").val();
      if(val1 == value){
	$("#comm_text").val(val);
      }else{
	$("#comm_text").val(val1+" "+val);
      }
    },
    addComment:function(evt){
      var _data = {
	text: $("#comm_text").val(),
	pid : 0
      };
      var clipid = this.id;
      RequestUtil.postFunc({
	url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+clipid+"/comment",
	data:_data,
	successCallBack:function(response){
	  if(response[0] == 0){
	    // 保存成功 回到详情页面
	    $("#comm_text").val(value);
	  }else{
	    console.info("response[0] == "+response[0]);
	  }
	},
	errorCallBack:function(response){
	  console.info(response);
	}
      });
    },
    render:function(){
      this.el.append(this.template());
    }
  });
};

CommShowWidget.prototype.initialize = function(){
  this.view.initialize();
};
CommShowWidget.prototype.loadComment = function(model,clipid){
 var comment = (model.toJSON()).comment;
 for(var i=0; i<comment.length; i++){
    var view = new this._view({model:comment[i], id:comment[i].id});
    $("#popup_Contact").children("#center_comment").append(view.render().el);
 }
 var view = new this.add_view({el:$("#popup_Contact"),id:clipid});
 view.render();
};