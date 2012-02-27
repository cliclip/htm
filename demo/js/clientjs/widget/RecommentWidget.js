RecommentWidget=function(_container,options){
  this.container=_container;
  this.options=options;
  this.widgetType="RecommentWidget";
  var _view=Backbone.View.extend({
    uid:"",
    el:$(_container),
    initialize:function(){
      this.render();
    },
    template:_.template($("#recomment_template").html()),
    render:function(){
      //var template = _.template($("#recomment_template").html());
      template =  this.template();
      this.el.html(template);
      this.uid = "";
    },
    events:{
      "click #name_list":"getNameAction",
      "input #name":"nameListAction",
      "click #name":"nameListAction",
      "click #recomm_button":"recommentAction",
      "mouseover #name_list":"MouseOver",
      "mouseout #name_list":"MouseOut",
      "focus #text":"clearAction"
    },

    nameListAction:function(evt){
      var lookup_url=client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"lookup/0..5";
      var str = $("#name").val();
      var params = {q:str};
      var view = this;
      RequestUtil.getFunc({
	url:lookup_url,
	data:params,
	successCallBack:function(response){
	  if(response[0] == 0){
	    $("#name_listDiv").empty();
	    var name_template = _.template($("#namelist_template").html(),{list:response[1]});
	    $("#name_listDiv").append(name_template);
	  }else{
	    console.log("fail");
	    //view.el.children().find("span.action-info.name").html(response[1] ? response[1] : "");
	  }
	},
      errorCallBack:function(response){
	console.log("find name fail");
      }
    });
    },

    MouseOver:function(evt){

    },
    MouseOut:function(evt){

    },

    getNameAction:function(evt){
      var view = this;
      this.uid = evt.target.id;
      var name = document.getElementById(this.uid).innerHTML;
      var imgurl=document.getElementById(this.uid).title;
      console.log(imgurl);
      $("#name").val(name);
      $("#imgId").attr("src",imgurl);
      $("#name_listDiv").empty();
    },

    recommentAction:function(evt){
      var clipid="1:1";
      var recomment_url=client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"user/"+this.uid+"/recomm";
      var text=$("#text").val();
      var userInfo=new UserInfo(recomment_url);
      var widget=this;
      userInfo.recommentAction({
	text:text,
	clipid:clipid
      },
      {viewCallBack:function(status,infoText){
	if(status==0){
	  widget.el.html(infoText);
	  GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	}else{
	  console.log(infoText);
	  widget.el.children().find("span.action-info.name").html(infoText ? infoText : "");
	}
       }
      });
    },
    clearAction:function(evt){
      var value="说点啥吧～";
      if($("#text").val()==value){
	$("#text").val("");
      }
    }
  })
  this.view=new _view();
}
RecommentWidget.prototype.initialize = function(){
  this.view.initialize();
}
RecommentWidget.prototype.render = function(){
  this.view.render();
}