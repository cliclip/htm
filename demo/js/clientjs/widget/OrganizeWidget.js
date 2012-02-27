OrganizeWidget=function(_container,options){
  this.container=_container;
  this.options=options;
  this.widgetType="OrganizeWidget";
  var _view=Backbone.View.extend({
  el:$(_container),
  initialize:function(){
    this.render();
  },
  render:function(){
    var template=_.template($("#organize_template").html(),{});
    this.el.html(template);
  },
  events:{
    "click .organize"     :  "tagAction",
    "click #org_button"   :  "organizeAction",
    "focus #organize_text":  "focusAction",
    "blur #organize_text" :  "blurAction"
  },
  tagAction:function(evt){
    var id=evt.target.id;
    if($("#tag").val()==""){
      $("#tag").val($("#"+id).val());
    }else{
      if(!_.include($("#tag").val().split(","),$("#"+id).val())){
  	$("#tag").val($("#tag").val()+","+$("#"+id).val());
      }
    }
  },
  focusAction:function(evt){
    var value="备注一下吧~";
    if($("#organize_text").val()==value){
      $("#organize_text").val("");
    }
  },
  blurAction:function(evt){
    var value="备注一下吧~";
    if($("#organize_text").val()==""){
      $("#organize_text").val(value);
    }
  },
  organizeAction:function(evt){
    var id="1:2";
    var update_url=client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"clip/"+id;
    var widget=this;
    var text=$("#organize_text").val();
    var tag=$("#tag").val().split(",");
    var clip = new Object();
    clip.tag = tag;
    clip.note =[{text:text}];
    RequestUtil.putFunc({
      url:update_url,
      data:clip,
      successCallBack:function(response){
	if(response[0] == 0){
	  widget.el.html("success");
	  GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	}else{
	  widget.el.children().find("span.action-info.name").html(infoText ? infoText : "");
	}
      },
      errorCallBack:function(response){
	console.info("error");
      }
    });
    if($("#checkbox").attr("checked")){
      console.log("private");
    }
  }
 });
 this.view=new _view();
};
OrganizeWidget.prototype.initialize = function(){
  this.view.initialize();
};
OrganizeWidget.prototype.render = function(){
  this.view.render();
};