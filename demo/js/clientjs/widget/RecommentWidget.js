RecommentWidget=function(_container,options){
/*  var list={list:[{name:"testaaa",uid:"2",imgUrl:"../img/koala.jpg"},{name:"huson",uid:"3",imgUrl:"../img/index.png"},{name:"mockuser",uid:"4",imgUrl:"../img/notewedge.png"},{name:"sherlock",uid:"5",imgUrl:"../img/search.jpg"}]};*/
  var uid="";
  this.container=_container;
  this.options=options;
  this.widgetType="RecommentWidget";
  var _view=Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var template=_.template($("#recomment_template").html());
      this.el.html(template);
    },
    events:{
      "click #name_list"      :"getUserAction",
      "input #name"           :"nameListAction",
      "click #name"           :"nameListAction",
    //  "click #nameList_button":"nameListAction",
      "click #recomm_button"  :"recommentAction",
      "focus #recomment_text" :"clearAction"
     // "blur  #recomment_text" :"blurAction"
    },
    getUserAction:function(evt){
      uid=evt.target.id;
      var name=document.getElementById(uid).innerHTML;
     // var imgurl=document.getElementById(uid).title;
     // console.log(imgurl);
     // image.src="../img/search.jpg";
      $("#name").val(name);
      $("#imgId").removeAttr("hidden");
      $("#imgId").attr("src","../img/search.jpg");
    },
    nameListAction:function(evt){
      var lookup_url=client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"lookup/0..5";
      var str = $("#name").val();
      var params = {q:str};
      console.dir(str);
      RequestUtil.getFunc({
	url:lookup_url,
	data:params,
	successCallBack:function(response){
	  if(response[0] == 0){
	      $("#name_list").empty();
	    var name_template = _.template($("#namelist_template").html(),{
	      list:response[1]});
	      $("#name_list").append(name_template);
	    }else{
	      console.log("fail");
	    }
	  },
	  errorCallBack:function(response){
	    console.info("wrong");
	  }
	});
    },
    recommentAction:function(evt){
      console.log(uid);
      var clipid="1:2";
      var recomment_url=client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"user/"+uid+"/recomm";
      var text=$("#recomment_text").val();
      var str = $("#name").val();
      var userInfo=new UserInfo(recomment_url);
      var widget=this;
      if(uid){
	uid="";
	userInfo.recommentAction({
	  text:text,
	  clipid:clipid
	},
	{viewCallBack:function(status,infoText){
	  if(status==0){
	    widget.el.html(infoText);
	    GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	  }else{
	    widget.el.children().find("span.action-info.name").html(infoText ? infoText : "");
	  }
	}
	});
      }
    },
    clearAction:function(evt){
      var value="说点啥吧～";
      if($("#recomment_text").val()==value){
	$("#recomment_text").val("");
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