GetRuleWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "GetRuleWidget";
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      this.iniRuleList();
    },
    render:function(rules){
      var collection={};
      if(rules){
	collection = rules;
      }else{
	collection = this.ruleList.toJSON();
      }
      var template = _.template($("#getRule_template").html(),{rules:collection});
      this.el.append(template);
    },
    events:{
      "click #affirmRuleAction_button":"affirmRuleAction"
    },
    iniRuleList:function(){
      var view = this;
      this.ruleList = new RuleList();
      this.ruleList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/rule";
      this.ruleList.fetch({
	success:function(collection,resp){
	  if(resp[0] == 0){
	    // 调用view的render函数
	    //console.info("11111111111");
	    view.render(resp[1]);
	  }else{
	    //server response exception
	  }
	},
	error:function(collection,resp){
	}
      });
    },
  affirmRuleAction:function(evt){
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
  });
  this.view = new _view();
}
GetRuleWidget.prototype.initialize = function(){
  if(!this.view)
    return;
  this.view.initialize();
}
GetRuleWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.getRuleWidget = null;
}
/*
GetRuleWidget.prototype.render = function(){
  if(!this.view)
    return;
  this.view.render();
}
*/