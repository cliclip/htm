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
      var my = App.util.getMyUid();
      return App.util.unique_url(P+"/user/"+my+"/rule");
    },
    validate: function(attrs){
      var email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
      var error = {};
      // 如果没有attrs.rule, 则在fetch时候不会触发onChange事件
      if(!attrs.title && !attrs.to&& !attrs.cc && !attrs.rule){
	error.rule = "is_null";
      }else{
	for(var i=0; attrs.to && i<attrs.to.length; i++){
	  if(!email_pattern.test(attrs.to[i])){
	    error.to = "invalidate";
	    i = attrs.to.length;
	  }
	}
	for(i =0; attrs.cc && i< attrs.cc.length; i++){
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
      "error": "showError"
    },
    initialize:function(){
      this.tmpmodel = new RuleModel();
    },
    setCC:function(e){
      var key = e.keyCode;
      dealEmail(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    setTO:function(e){
      var key = e.keyCode;
      dealEmail(e);
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
      this.tmpmodel.set(data,{
	error:function(model, error){
	  if(error.rule == "is_null"){ // 因为有特殊逻辑所以要单独set
	    App.vent.trigger("app.clipapp.message:chinese", error);
	  }else{
	    view.showError('ruleEdit',error);
	  }
	}
      });
      if(this.tmpmodel.isValid()){
	this.tmpmodel.save({},{
	  success: function(model, res){
  	    App.vent.trigger("app.clipapp.ruleedit:@showrule", model.id);
	    App.vent.trigger("app.clipapp.message:confirm", "setRule_success");
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

  function dealEmail(e){
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

  RuleEdit.show = function(){
    var ruleModel = new RuleModel();
    RuleEdit.ruleRegion = new App.Region({el:"#rule"});
    ruleModel.fetch();
    ruleModel.onChange(function(ruleModel){
      var ruleView = new RuleView({model: ruleModel});
      RuleEdit.ruleRegion.show(ruleView);
    });
  };

  RuleEdit.close = function(){
    App.popRegion.close();
  };


  App.vent.bind("app.clipapp.ruleedit:@showrule", function(uid){
    RuleEdit.show(uid);
  });

  return RuleEdit;
})(App, Backbone, jQuery);