DeleteWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "DeleteWidget";
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var template = _.template($("#delete_template").html(),{});
      this.el.html(template);
    },
    events:{
      "click #Clipdel_button":"clipdelAction"
    },

    clipdelAction:function(url){
      var id = "1:1";
      var delete_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id;
      var widget = this;
      RequestUtil.deleteFunc({
	url:delete_url,
	successCallBack:function(response){
	  if(response[0] == 0){
	   widget.el.html("删除成功");
	   GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	  }else{
	    console.log("Delete fail");
	    widget.el.html("删除失败！");
	  }

	},
	errorCallBack:function(response){
	  console.info(response);
	}
	});
    }

/*
    clipdelAction:function(evt){
      var id = "1:1";
      var delete_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id;
      var clipInfo = new ClipInfo(delete_url);
      clipInfo.deleteAction({viewCallBack:function(status,infoText){
	 if(status == 0){
	   console.log("Delete ok");
	   widget.el.html(infoText);
	   GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	 }else{
	   console.log("Delete fail");
	 }
      }
    });
    }
*/


});
  this.view = new _view();
};
DeleteWidget.prototype.initialize = function(){
  this.view.initialize();
};

DeleteWidget.prototype.render = function(){
  this.view.render();
};