CommentWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "CommentWidget";
  var _view = Backbone.View.extend({
    tag_list : [],
    value : "",
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var template = _.template($("#comment_template").html());
      var sub_tag_template = _.template($("#sub_tag_template").html());
      this.el.html(template);
      $("#subtag_templateDiv").html(sub_tag_template);
      this.tag_list = [];
      this.value = $("#comm_text").val();
    },
    events:{
      "click .sub_tag":"subtagAction",
      "click #comment_button":"commentAction",
      "focus #comm_text":"foucsAction",
      "blur #comm_text":"blurAction"
    },

    foucsAction:function(evt){
      if($("#comm_text").val() == this.value ){
	$("#comm_text").val("");
      }
    },

    blurAction:function(evt){
      if($("#comm_text").val() == ""){
	$("#comm_text").val(this.value);
      }
    },

    subtagAction:function(evt){
      var id = evt.target.id;
      console.log(id);
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	console.log($("#"+id).val());
	this.tag_list.push($("#"+id).val());
	console.dir(this.tag_list);
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	console.log($("#"+id).val());
	this.tag_list = _.without(this.tag_list,$("#"+id).val());
	console.dir(this.tag_list);
      }
    },

    commentAction:function(evt){
      var id = "1:1";
      var comment_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id+"/comment";
      var text = $("#comm_text").val();
      console.log(text);
      var pid = "0";
      var clipInfo = new ClipInfo(comment_url);
      var widget = this;
      clipInfo.commentAction({
	pid:pid,
	text:text
      },
      {viewCallBack:function(status,infoText){
	 if(status == 0){
	   console.log("comment ok");
	   widget.el.html(infoText);
	   GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	 }else{
	   console.log("comment fail");
	 }
       }
      });

      if($("#collect").attr("checked")){
	console.log("同时收");
	var collect_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id+"/reclip";
	var userInfo = new UserInfo(collect_url);
	userInfo.collectAction({
	  clip:{}
	},
	{ viewCallBack:function(status,infoText){
	    if(status == 0){
	      console.log("collect ok");
	      widget.el.html(infoText);
	      GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	    }else{
	      console.log("collect fail");
	    }
	  }
	 });
	}
      }
});
  this.view = new _view();
};
CommentWidget.prototype.initialize = function(){
  this.view.initialize();
};

CommentWidget.prototype.render = function(){
  this.view.render();
};