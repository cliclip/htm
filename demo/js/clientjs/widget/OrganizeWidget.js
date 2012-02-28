OrganizeWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "OrganizeWidget";
  var _view = Backbone.View.extend({
    tag_list:[],
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var sub_tag_template = _.template($("#sub_tag_template").html());
      var template = _.template($("#organize_template").html(),{});
      this.el.html(template);
      $("#subtag_templateDiv").html(sub_tag_template);
      this.tag_list = [];
    },
    events:{
      "click .sub_tag":"subtagAction",
      "click #tag":"objtagAction",
      "click #organize_button":"organizeAction",
      "focus #organize_text":"focusAction",
      "blur #organize_text":"blurAction"
    },


    subtagAction:function(evt){
      var id = evt.target.id;
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	this.tag_list.push($("#"+id).val());
	console.dir(this.tag_list);
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	this.tag_list = _.without(this.tag_list,$("#"+id).val());
	console.dir(this.tag_list);
      }
    },

    objtagAction:function(evt){
      $("#objtag_templateDiv").html(_.template($("#obj_tag_template").html()));
      $("#obj_tag_Div").bind("click",function(evt1){
	id = evt1.target.id;
	if(id == "obj_tag_Div"){
	  $("#objtag_templateDiv").empty();
	}else{
	  if($("#tag").val()==""){
	    $("#tag").val($("#"+id).val());
	  }else{
	    $("#tag").val(_.union($("#tag").val().split(","),$("#"+id).val()));
	  }
	}
      });
    },

    focusAction:function(evt){
      var value = "备注一下吧~";
      if($("#organize_text").val() == value){
	$("#organize_text").val("");
      }
    },

    blurAction:function(evt){
      var value = "备注一下吧~";
      if($("#organize_text").val() == ""){
	$("#organize_text").val(value);
      }
    },

    organizeAction:function(evt){
      var id = "1:2";
      var organize_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id;
      var text = $("#organize_text").val();
      var tag = $("#tag").val().split(",");
      var widget = this;
      var clip = {note:[{text:text}],tag:tag};
     RequestUtil.putFunc({
       url:organize_url,
       data:clip,
       successCallBack:function(response){
	 if(response[0] == 0){
	  widget.el.html("成功~");
	  GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	 }else{
	   console.log("fail");
	 }
       },
       errorCallBack:function(response){
	 console.log("find name fail");
       }
     });
      if($("#checkbox").attr("checked")){
	console.log("不公开~");
      }
    }
});
  this.view = new _view();

};
OrganizeWidget.prototype.initialize = function(){
  this.view.initialize();
};

OrganizeWidget.prototype.render = function(){
  this.view.render();
};