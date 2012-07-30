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
      "click .masker":"Masker",
      "click #sure": "MessageSure"
    },
    Masker: function(e){
      e.preventDefault();
      if($(e.target).attr("class") == "masker"){
	this.MessageSure(e);
      }
    },
    MessageSure: function(){
      if(this.model.get("message") == _i18n('message.email.no_uname')){
	App.vent.trigger("app.clipapp.useredit:rename");
      }
      Message.close();
      App.vent.trigger("app.clipapp.message:sure");
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
      "click .masker":"Masker",
      "click #sure": "MessageSure",
      "click #cancel":"MessageClose"
    },
    MessageSure: function(e){
      e.preventDefault();
      Message.close();
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
      Message.close();
      App.vent.trigger("app.clipapp.message:cancel");
    }
  });

  Message.show = function(type, message){
    flag = false;
    var messageModel = new MessageModel({message:message});
    if(type == "warning"){
      var view = new WarningView({model: messageModel});
      if(!$("body").hasClass("noscroll")){
	flag = true;
	$("body").addClass("noscroll");
      }
    }else if(type == "confirm"){
      var view = new MessageView({model : messageModel});
      if(!$("body").hasClass("noscroll")){
	flag = true;
	$("body").addClass("noscroll");
      }
    }else{
      var view = new SuccessView({model : messageModel});
      setTimeout(function(){
	Message.close();
      },1000);
    }
    App.setpopRegion.show(view);
  };

  Message.close = function(){
    if(flag){ $("body").removeClass("noscroll"); }
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

