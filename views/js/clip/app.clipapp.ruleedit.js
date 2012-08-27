App.ClipApp.RuleEdit = (function(App, Backbone, $){
  var RuleEdit = {};
  var P = App.ClipApp.Url.base;
  var RuleModel = App.Model.extend({
    defaults:{
      title:"",
      to: "",
      cc: "",
      enable: ""
    },
    url:function(){
      var my = App.ClipApp.getMyUid();
      return App.util.unique_url(P+"/user/"+my+"/rule");
    },
    validate: function(attrs){
      var email_pattern = App.util.email_pattern;
      var error = {};
      // 如果没有attrs.rule, 则在fetch时候不会触发onChange事件
      if(attrs.to){
	for(var i=0; attrs.to && i<attrs.to.length; i++){
	  if(!email_pattern.test(attrs.to[i])){
	    error.to = "invalidate";
	    i = attrs.to.length;
	  }
	}
      }
      if(attrs.cc){
	for(var i =0; attrs.cc && i< attrs.cc.length; i++){
	  if(!email_pattern.test(attrs.cc[i])){
	    error.cc = "invalidate";
	    i = attrs.cc.length;
	  }
	}
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });

  var RuleView = App.ItemView.extend({
    tagName: "div",
    className: "ruleEdit",
    template: "#ruleEdit-view-template",
    events: {
      "click #update_rule[type=submit]" : "ruleUpdate",
      "keydown #cc" : "setCC",
      "keydown #to" : "setTO",
      "blur #cc" : "blurAction", // 直接进行to和cc的set,及时进行数据校验
      "blur #to" : "blurAction",
      "focus #to": "cleanError",
      "focus #cc": "cleanError",
      "click #open_rule" : "openRule",
      "error": "showError"
    },
    initialize:function(){
      this.tmpmodel = new RuleModel();
      this.bind("@showrule", showrule);
    },
    openRule:function(e){
      e.preventDefault();
      var checked = $("#open_rule").attr("checked");
      if(checked){
	o_data.enable = true;
	this.tmpmodel.save(o_data,{
	  success: function(model, res){
	    $("#open_rule").attr("checked",true);
	    $(".rule_input").show();
	  },
	  error:function(model, error){
	    console.info(error);
	  }
	});
      }else{
	o_data.enable = false;
	this.tmpmodel.save(o_data,{
	  success: function(model, res){
	    $("#open_rule").attr("checked",false);
	    $(".rule_input").hide();
	  },
	  error:function(model, error){
	    console.log(error);
	  }
	});
      }
    },
    setCC:function(e){
      var key = e.keyCode;
      addSeparator(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    setTO:function(e){
      var key = e.keyCode;
      addSeparator(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    ruleUpdate: function(){
      var view = this;
      var uid = this.model.id;
      var data = view.getInput();
      if(!data.enable) data.enable = false;
      else data.enable = true;
      if(data.to) data.to =  _.compact($.trim(data.to).split(";"));
      if(data.cc) data.cc =  _.compact($.trim(data.cc).split(";"));
      // 因为不能在输入框中正常显示 所以对双引号进行转换
      if(data.title) data.title = data.title.replace(/"/g, '&#34;');
      // 如果没有设置rule, 则在fetch时候不会触发onChange事件"
      if(data.title==o_data.title&&((data.to==o_data.to)||(data.to&&o_data.to&&data.to.join()==o_data.to.join()))&&((data.cc==o_data.cc)||(data.cc&&o_data.cc&&data.cc.join()==o_data.cc.join()))){
	App.ClipApp.showConfirm({rule:"not_update"});
      }else{
	this.tmpmodel.save(data,{
	  success: function(model, res){
  	    view.trigger("@showrule", model.id);
	    App.ClipApp.showSuccess("setRule_success");
	    o_data = data;
	  },
	  error:function(model, res){
	    view.showError('ruleEdit',res);
	  }
	});
      }
    },
    blurAction:function(e){
      var view = this;
      var id = e.currentTarget.id;
      var name = e.currentTarget.name;
      // 可以统一取单独set
      var data = view.getInput();
      var str = null;
      if(data[id]){
	str = _.compact($.trim(data[id]).split(";"));
      }
      if(str){
	var value = _.compact(str).join(";");
	$("input[name="+name+"]").val(value+";");
	str = str.length == 0 ? undefined : str;
	if(id == "to")
	  view.setModel('ruleEdit',this.tmpmodel, {to: str});
	if(id == "cc")
	  view.setModel('ruleEdit',this.tmpmodel, {cc: str});
      }
    }
  });

  function addSeparator(e){
    var key = e.keyCode;
    var str = $.trim($(e.currentTarget).val());
    //按键为 tab 空格 , ; 时处理输入框中的字符串
    if((key==9||key==32||key==188||key==59)){
      if(str){
	// 以;把字符串分为数组，取出没个email的前后空格。
	var arr = [];
	_.each(str.split(";"),function(a){
	  arr.push($.trim(a));
	});
	//在取出无用数据后（空字符串等），再放回输入框
	$(e.currentTarget).val(_.compact(arr).join(";")+";");
      }
    }
  }

  var showrule = function(uid){
    RuleEdit.show(uid);
  };

  var o_data;
  RuleEdit.show = function(){
    var ruleModel = new RuleModel();
    ruleModel.fetch();
    ruleModel.onChange(function(ruleModel){
      var ruleView = new RuleView({model: ruleModel});
      RuleEdit.ruleRegion = new App.Region({el:"#rule"});
      RuleEdit.ruleRegion.show(ruleView);
      if(!ruleModel.get("enable")){
	$(".rule_input").hide();
      }else{
	$(".rule_input").show();
      }
      o_data = {title:ruleModel.get("title")?ruleModel.get("title"):undefined,cc:ruleModel.get("cc")?ruleModel.get("cc"):undefined,to:ruleModel.get("to")?ruleModel.get("to"):undefined};
   });
  };

  RuleEdit.close = function(){
    App.popRegion.close();
  };

  return RuleEdit;
})(App, Backbone, jQuery);