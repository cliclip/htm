UserEmailRuleWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "UserEmailRuleWidget";
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){},
    render:function(rule){
      var collection={};
      if(rule){
	collection = rule;
	//console.info("rule is exists");
      }else{
	collection = this.emailRule.toJSON();
	//console.info("rule is not exists");
      }
      //console.info(collection);
      var template = _.template($("#EmailRule_template").html(),{rule:collection});
      this.el.append(template);
    },
    events:{},
    iniEmailRule:function(){
      var view = this;
      //新建一个model
      this.emailRule = new RuleInfo();
      this.emailRule.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/rule";
      this.emailRule.fetch({
	success:function(collection,resp){
	  //console.info("iniEmailRule success");
	  if(resp[0] == 0){
	    // 调用view的render函数
	    view.show(resp[1]);
	  }else{
	    //console.info("iniEmailRule success resp!=0");
	    //server response exception
	  }
	},
	error:function(collection,resp){}
      });
    },
  show:function(rule){
    var view = this;
    $("#contentWrapper").animate({"width":0,"opacity":0},"slow","swing",function(){
    view.render(rule);
    $(this).css("display","none");
    view.el.children(".email-rule").animate({"width":view.el.width(),"opacity":1},"slow","swing",function(){
      $("#setEmailRuleDiv").css("display","");
      if($("#setEmailRuleDiv").html() == ""){
	var actionUrl = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/rule";
	var addTemplate = _.template($("#setEmailRule_template").html(),{actUrl:actionUrl,rule:rule});
	$("#setEmailRuleDiv").html(addTemplate);
      }

      $("#confirm").bind("click",function(evt){
	var _rule = {
	  title:"",
	  to:[],
	  cc:[]
	};
	_rule.title = $("#ruleTitle").val();
	_rule.to = $("#ruleTo").val().split(";");
	_rule.cc = $("#ruleCc").val().split(";");
	RequestUtil.postFunc({
	  url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL+"my/rule",
	  data:_rule,
	  successCallBack:function(response){
	    if(response[0] == 0){
	      var id = response[1];
	      location.href = "#/my/rule";
	      alert("更新成功！");
	    }else{
	      //alert(response[0]);
	    }
	  },
	  erroeCallBack:function(response){}
	});
      });
/*
      $("#quit").bind("click",function(evt){
	$("#setEmailRuleDiv").css("display","none");
      });
*/
     });

   });
  },
  close:function(){
    var view = this;
    this.el.children(".email-rule").animate({"width":0,"opacity":0},"slow","swing",function(){
     $(this).css("display","none");
     view.el.children(".email-rule").remove();
     $("#contentWrapper").css("display","");
     $(document).scrollTop(view.tempScrollTop);
     $("#contentWrapper").animate({"opacity":1,"width":view.el.width()},"slow","swing",function(){});
    });
  }
  });
  this.view = new _view();
}
UserEmailRuleWidget.prototype.initialize = function(){
  if(!this.view)
    return;
  this.view.initialize();
}
UserEmailRuleWidget.prototype.loadEmailRule = function(){
    this.view.el=$("#page-home");
    $(".email-rule").remove();
    $(".addClip-container").remove();
    this.view.iniEmailRule();
}

UserEmailRuleWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.userEmailRuleWidget = null;
}
UserEmailRuleWidget.prototype.render = function(){
  if(!this.view)
    return;
  this.view.render();
}
