App.ClipApp.Message = (function(App, Backbone, $){
  var Message = {}, flag = false;

  var MessageModel = App.Model.extend({
    defaults:{message:""}
  });

  var MessageView = App.ItemView.extend({
    tagName: "div",
    className: "message-view",
    template: "#message-view-template",
    events: {
      "click .masker":"MessageSure",
      "click #sure": "MessageSure"
    },
    initialize:function(){
      flag = false;
    },
    MessageSure: function(){
      if(this.model.get("message") == _i18n('message.email.no_uname')){
	App.vent.trigger("app.clipapp.useredit:rename");
      }
      App.vent.trigger("app.clipapp.message:sure");
      if(flag){ $("body").removeClass("noscroll"); }
      App.setpopRegion.close();
    }
  });

  var SuccessView = App.ItemView.extend({
    tagName: "div",
    className: "success-view",
    template: "#success-view-template"
  });

  var WarningView = App.ItemView.extend({
    tagName: "div",
    className: "message-view",
    template: "#warning-view-template",
    events: {
      "click .masker":"Messageclose",
      "click #sure": "MessageSure",
      "click #cancel":"Messageclose"
    },
    initialize:function(){
      flag = false;
    },
    MessageSure: function(){
      if(flag){	$("body").removeClass("noscroll"); }
      App.setpopRegion.close();
      App.vent.trigger("app.clipapp.message:sure");
    },
    Messageclose: function(){
      if(flag){ $("body").removeClass("noscroll"); }
      App.setpopRegion.close();
      App.vent.trigger("app.clipapp.message:cancel");
    }
  });

  Message.getMessage = function(key, value){
    return  value ? App.util.getMessage("pre_"+key)+value+App.util.getMessage("post_"+key) : App.util.getMessage(key);
  };

  Message.getError = function(key){
    return App.util.getErrorMessage(key);
  };

  Message.show = function(type, message){
    var messageModel = new MessageModel({message:message});
    if(type == "warning"){
      if(!$("body").hasClass("noscroll")){
	flag = true;
	$("body").addClass("noscroll");
      }
      var view = new WarningView({model: messageModel});
    }else if(type == "confirm"){
      if(!$("body").hasClass("noscroll")){
	flag = true;
	$("body").addClass("noscroll");
      }
      var view = new MessageView({model : messageModel});
    }else{
      var view = new SuccessView({model : messageModel});
      setTimeout(function(){
	Message.close();
      },1000);
    }
    App.setpopRegion.show(view);
  };

  Message.close = function(){
    App.setpopRegion.close();
  };

  App.vent.bind("app.clipapp.message:success", function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('message.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('message'+'.'+k+'.'+key[k], value);
      }
    }
    Message.show("success", message);
  });

  App.vent.bind("app.clipapp.message:chinese", function(key){
    var chinese = null;
    if(typeof(key)=="string"){
      chinese = _i18n('message.'+key);
    }else if(typeof(key)=="object"){
      for(var k in key){
	chinese = _i18n('message'+'.'+k+'.'+key[k]);
      }
    }
    Message.show("confirm", chinese);
  });

  App.vent.bind("app.clipapp.message:confirm", function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('message.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('message'+'.'+k+'.'+key[k], value);
      }
    }
    Message.show("confirm", message);
  });

  App.vent.bind("app.clipapp.message:alert", function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('warning.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('warning'+'.'+k+'.'+key[k], value);
      }
    }
    Message.show("warning", message);
  });

  return Message;
})(App, Backbone, jQuery);

