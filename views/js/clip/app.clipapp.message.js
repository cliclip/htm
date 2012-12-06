App.ClipApp.Message = (function(App, Backbone, $){
  var Message = {};

  var MessageModel = App.Model.extend({
    defaults:{message:""}
  });

  var MessageView = App.DialogView.extend({
    tagName: "div",
    className: "message-view",
    template: "#message-view-template",
    events: {
      "click .masker":"Masker",
      "click #sure": "MessageSure",
      "click ._oauth" : "openWindow"
    },
    initialize:function(){
      this.bind("@closeView", close);
    },
    openWindow:function(){// TODO a标签不明原因的失效
      window.open($("._oauth").attr("title"));
    },
    Masker: function(e){
      e.preventDefault();
      if($(e.target).attr("class") == "masker"){
	this.MessageSure(e);
      }
    },
    MessageSure: function(){
      this.trigger("@closeView");
      App.vent.trigger("app.clipapp.message:sure");
    }
  });

  var SuccessView = App.ItemView.extend({
    tagName: "div",
    className: "success-view",
    template: "#success-view-template"
  });

  var WarningView = App.DialogView.extend({
    tagName: "div",
    className: "message-view",
    template: "#warning-view-template",
    events: {
      "click .masker":"Masker",
      "click #sure": "MessageSure",
      "click #cancel":"MessageClose"
    },
    initialize:function(){
      this.bind("@closeView", close);
    },
    MessageSure: function(e){
      e.preventDefault();
      this.trigger("@closeView");
      App.vent.trigger("app.clipapp.message:sure");
    },
    Masker: function(e){
      e.preventDefault();
      if($(e.target).attr("class") == "masker"){
	this.MessageClose(e);
      }
    },
    MessageClose: function(e){
      e.preventDefault();
      this.trigger("@closeView");
      App.vent.trigger("app.clipapp.message:cancel");
    }
  });

  function show(type, message){
    var messageModel = new MessageModel({message:message});
    if(type == "warning"){
      var view = new WarningView({model: messageModel});
    }else if(type == "confirm"){
      var view = new MessageView({model : messageModel});
    }else{
      var view = new SuccessView({model : messageModel});
      setTimeout(function(){
	close();
      },1000);
    }
    App.setpopRegion.show(view);
  };

  var close = function(){
    App.setpopRegion.close();
  };

  Message.success = function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('message.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('message'+'.'+k+'.'+key[k], value);
      }
    }
    show("success", message);
  };

  Message.confirm = function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('message.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('message'+'.'+k+'.'+key[k], value);
      }
    }
    show("confirm", message);
  };

  Message.alert = function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('warning.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('warning'+'.'+k+'.'+key[k], value);
      }
    }
    show("warning", message);
  };

  return Message;
})(App, Backbone, jQuery);