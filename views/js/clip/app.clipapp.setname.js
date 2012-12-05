App.ClipApp.SetName = (function(App, Backbone, $){
  var SetName = {};
  var P = App.ClipApp.Url.base;

  var NameModel = App.Model.extend({
    url:function(){
      return  App.ClipApp.encodeURI(P+"/"+App.ClipApp.getMyUid()+"/name");
    },
    validate:function(attrs){
      if(!attrs.name || attrs.name == ""){
	return {_name: "is_null"};
      }else if(!App.util.name_pattern.test(attrs.name)){
	return {_name: "invalidate"};
      }else if(!attrs.newpass){
	return {_newpass: "is_null"};
      }else if(!attrs.confirm){
	return {_conpass: "is_null"};
      }else if(attrs.newpass && attrs.confirm && attrs.newpass != attrs.confirm){
	return {_confirm: "password_diff"};
      }else{
	return null;
      }
    }
  });

  var SetNameModel = App.Model.extend({});
  var SetNameView = App.ItemView.extend({
    tagName : "div",
    className : "setName-view",
    template : "#setName-view-template",
    events : {
      "click #submit"   : "update",
      "focus #_name"    : "cleanError",
      "focus #_conpass" : "focusAction",
      "focus #_newpass" : "focusAction",
      "blur #_name"     : "blurName",
      "blur #_pass"     : "blurAction",
      "blur #_confirm"  : "blurAction",
      "focus #_pass"    : "cleanError",
      "focus #_confirm"  : "cleanError",
      "click .masker"   : "masker",
      "click .close_w"  : "cancel",
      "click #cancel"   : "cancel"
    },
    initialize: function(){
      this.tmpmodel = new App.Model.RegisterModel();
      this.bind("@closeView", close);
    },
    blurName:function(e){
      var that = this;
      var name = $("#_name").val();
      this.tmpmodel.save({name:name},{
	url : App.ClipApp.encodeURI(P+"/register/check/"+name),
	type: "GET",
	success:function(model,res){
	  if(res){
	    that.showError('faceEdit',{"_name":"exist"});
	    $("#submit").attr("disabled",true);
	  }else{
	    $("#submit").attr("disabled",false);
	  }
	},
	error:function(model,error){
	  var e2={};
	  for(var key in error){
	    var key2 = "_"+key;
	    e2[key2] = error[key];
	  }
	  that.showError("faceEdit",e2);
	}
      });
    },
    update:function(e){
      var view = this;
      var uid = this.model.id;
      var data = view.getInput();
      var nameModel = new NameModel({id:uid});
      nameModel.save(data ,{
	type: 'PUT',
	success:function(model,res){
	  if(App.util.isLocal()){
	    window.cache["/" + uid +"/info.json.js" ].name = res.name;
	  }
	  App.ClipApp.UserEdit.faceRegion.currentView.model.set("name", res.name);
	  document.cookie = "token="+res.token;
	  App.ClipApp.showSuccess("setname_success");
	  App.vent.trigger("app.clipapp.face:changed");
	  view.cancel();
	},
	error:function(model,res){
	  var res2={};
	  for(var key in res){
	    var key2 = "_"+key;
	    res2[key2] = res[key];
	  }
	  view.showError('faceEdit',res2);
	}
      });
    },
    focusAction:function(e){
      var id = e.currentTarget.id;
      $(e.currentTarget).hide();
      if(id == "_newpass"){
	$(e.currentTarget).siblings("#_pass").show();
	setTimeout(function(){
	  $(e.currentTarget).siblings("#_pass").focus();
	},10);
      }
      if(id == "_conpass"){
	$(e.currentTarget).siblings("#_confirm").show();
	setTimeout(function(){
	  $(e.currentTarget).siblings("#_confirm").focus();
	},10);
      }
      this.cleanError(e);
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      if(id == "_pass" && $("#"+id).val() == ""){
	$("#"+id).hide();
	$("#_newpass").show();
      }else if(id=="_confirm" && $("#"+id).val()==""){
	$("#"+id).hide();
	$("#_conpass").show();
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel();
      }
    },
    cancel: function(){
      this.trigger("@closeView");
    }
  });

  SetName.close = function(){
    App.popRegion.close();
  };

  var close = SetName.close;

  SetName.show = function(){
    var uid = App.util.getMyUid();
    var setNameModel = new SetNameModel({id:uid});
    var setNameView = new SetNameView({model:setNameModel});
    App.popRegion.show(setNameView);
  };

  return SetName;
})(App, Backbone, jQuery);