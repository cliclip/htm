App.ClipApp.Message = (function(App, Backbone, $){
  var Message = {};

  var MessageModel = App.Model.extend({
    defaults:{message:""}
  });

  var MessageView = App.ItemView.extend({
    tagName: "div",
    className: "message-view",
    template: "#message-view-template",
    events: {
      "click #sure": "MessageSure"
    },
    MessageSure: function(){
      if(this.model.get("message") == "在添加邮件之前请先设置用户名")
	App.vent.trigger("app.clipapp.useredit:rename");
      App.setpopRegion.close();
    }
  });

  var WarningView = App.ItemView.extend({
    tagName: "div",
    className: "message-view",
    template: "#warning-view-template",
    events: {
      "click #sure": "MessageSure",
      "click #cancel":"Messageclose"
    },
    MessageSure: function(){
      App.setpopRegion.close();
      App.vent.trigger("app.clipapp.message:sure");
    },
    Messageclose: function(){
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
      var view = new WarningView({model: messageModel});
    }else{
      var view = new MessageView({model : messageModel});
      setTimeout(function(){
	Message.close();
      },3000);
    }
    App.setpopRegion.show(view);
    $(".small_pop").css("top", App.util.getPopTop("small"));
  };

  Message.close = function(){
    App.setpopRegion.close();
  };

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
    var message = _i18n('message.'+key,value);
    Message.show("confirm", message);
  });

  App.vent.bind("app.clipapp.message:alert", function(key, value){
    var message = _i18n('warning.'+key,value);
    Message.show("warning", message);
  });

  return Message;
})(App, Backbone, jQuery);

