SetRuleWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "SetRuleWidget";
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var template = _.template($("#setRule_template").html(),{});
      this.el.html(template);
    },
    events:{
      "click #setRuleAction_button":"setRuleAction"
    },
    setRuleAction:function(evt){
      var setRule_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/rule";
      var title = $("#title").val();
      var to = $("#to").val();
      var cc = $("#cc").val();
      var widget = this;
      RequestUtil.postFunc({
	url:setRule_url,
	data:{
	  title:title,
	  to:[to],
	  cc:[cc]
	},
	successCallBack:function(response){
	  if(response[0] == 0){
	    widget.el.html(client.MESSAGES["rule_success"]);
	    setTimeout(function(){
	      GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	    },2000);
	  }
	},
	errCallBack:function(response){
	  var mcode = response;
	  widget.el.html(client.MESSAGES.getErrorMessage(mcode));
	}
      });
    }
  })
  this.view = new _view();
}
SetRuleWidget.prototype.initialize = function(){
  this.view.initialize();
}
SetRuleWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.SetRuleWidget = null;
}
SetRuleWidget.prototype.render = function(){
  this.view.render();
}