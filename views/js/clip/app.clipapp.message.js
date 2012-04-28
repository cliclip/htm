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
    }
    App.setpopRegion.show(view);
  };

  Message.close = function(){
    App.setpopRegion.close();
  };

  App.vent.bind("app.clipapp.message:chinese", function(key){
    var chinese = Message.getError(key);
    Message.show("confirm", chinese);
  });

  App.vent.bind("app.clipapp.message:confirm", function(key, value){
    var message = Message.getMessage(key, value);
    Message.show("confirm", message);
  });

  App.vent.bind("app.clipapp.message:alert", function(key, value){
    var message = Message.getMessage(key, value);
    Message.show("warning", message);
  });

  return Message;
})(App, Backbone, jQuery);

