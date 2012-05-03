App.ClipApp.RuleEdit = (function(App, Backbone, $){
  var RuleEdit = {};
  var P = App.ClipApp.Url.base;

  var RuleModel = App.Model.extend({
    defaults:{
      title:"",
      to:[],
      cc:[],
      enable:""
    },
    url:function(){
      return P+"/user/"+this.id+"/rule";
    },
    validate: function(attrs){
      var email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
      var error = {};
      if(!attrs.title&&_.isEmpty(attrs.to)&&_.isEmpty(attrs.cc)&&!attrs.rule){
	error.rule = "is_null";
      }else{
	for(var i=0; i<attrs.to.length; i++){
	  if(!email_pattern.test(attrs.to[i])){
	    error.to = "invalidate";
	    i = attrs.to.length;
	  }
	}
	for(i =0; i< attrs.cc.length; i++){
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
      "blur #cc" : "blurAction",
      "keydown #to" : "setTO",
      "blur #to" : "blurAction",
      "focus #to": "cleanError",
      "focus #cc": "cleanError",
      "focus #title": "cleanError",
      "error": "showError"
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
      var data = {};
      _.each(this.$(":input").serializeArray(), function(obj){
	if(obj.name == "to" || obj.name == "cc")
	  obj.value = _.compact(obj.value.trim().split(";"));
	data[obj.name] = obj.value;
      });
      if(!data.enable) data.enable = false;
      else data.enable = true;
      var ruleModel = new RuleModel({id:uid});
      ruleModel.set(data,{
	error:function(model, error){
	  if(error.rule == "is_null"){
	    App.vent.trigger("app.clipapp.message:chinese", error);
	  }else{
	    view.showError(error);
	  }
	}
      });
      if(ruleModel.isValid()){
	ruleModel.save({},{
	  type: "POST",
	  success: function(model, res){
  	    App.vent.trigger("app.clipapp.ruleedit:@showrule", model.id);
	    App.vent.trigger("app.clipapp.message:confirm", "setRule_success");
	  },
	  error:function(model, res){
	     view.showError(res);
	  }
	});
      }
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      var str = $("#"+id).val().trim();
      if(str){
	var arr = [];
	_.each(str.split(";"),function(a){
	  arr.push(a.trim());
	});
	$("#"+id).val(_.compact(arr).join(";")+";");
      }
    }
  });

  function dealEmail(e){
    var key = e.keyCode;
    var str = ($(e.currentTarget).val()).trim();
    //按键为 tab 空格 , ; 时处理输入框中的字符串
    if((key==9||key==32||key==188||key==59)){
      if(str){
	// 以;把字符串分为数组，取出没个email的前后空格。
	var arr = [];
	_.each(str.split(";"),function(a){
	  arr.push(a.trim());
	});
	//在取出无用数据后（空字符串等），再放回输入框
	$(e.currentTarget).val(_.compact(arr).join(";")+";");
      }

    }
  }

  RuleEdit.show = function(uid){
    var ruleModel = new RuleModel({id:uid});
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