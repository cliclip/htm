CollectWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "CollectWidget";
  var _view = Backbone.View.extend({
    tag_list:[],
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var template = _.template($("#collect_template").html());
      var sub_tag_template = _.template($("#sub_tag_template").html());
      this.el.html(template);
      $("#subtag_templateDiv").html(sub_tag_template);
      this.tag_list = [];
    },
    events:{
      "click .sub_tag":"subtagAction",
      "click #tag":"objtagAction",
      "click #collect_button":"collectAction",
      "focus #collect_text":"focusAction",
      "blur #collect_text":"blurAction"
    },

    subtagAction:function(evt){
      var id = evt.target.id;
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	this.tag_list.push($("#"+id).val());
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	this.tag_list.pop($("#"+id).val());
      }
    },

    objtagAction:function(evt){
      $("#objtag_templateDiv").html(_.template($("#obj_tag_template").html()));
      $("#obj_tag_Div").bind("click",function(evt1){
	var id = evt1.target.id;
	if(id == "obj_tag_Div"){
	  $("#objtag_templateDiv").empty();
	}else{
	  if($("#tag").val()==""){
	    $("#tag").val($("#"+id).val());
	  }else{
	    $("#tag").val($("#tag").val()+","+$("#"+id).val());
	  }
	}
      });
    },

    focusAction:function(evt){
      var value = "备注一下吧~";
      if($("#collect_text").val() == value){
	$("#collect_text").val("");
      }
    },

    blurAction:function(evt){
      var value = "备注一下吧~";
      if($("#collect_text").val() == ""){
	$("#collect_text").val(value);
      }
    },

    collectAction:function(evt){
      var id = "1:1";
      var collect_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id+"/reclip";
      var text = $("#collect_text").val();
      var tag = $("#tag").val().split(",");
      var clip = {note: [{text:text}],tag:tag};
      var userInfo = new UserInfo(collect_url);
      var widget = this;
      userInfo.collectAction({
	clip:clip
      },
      {viewCallBack:function(status,infoText){
	 if(status == 0){
	   console.log("collect ok");
	   widget.el.html(infoText);
	   GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	 }else{
	   console.log("collect fail");
	 }
       }
      });
      if($("#checkbox").attr("checked")){
	console.log("不公开~");
      }
    }
});
  this.view = new _view();
};
CollectWidget.prototype.initialize = function(){
  this.view.initialize();
};

CollectWidget.prototype.render = function(){
  this.view.render();
};