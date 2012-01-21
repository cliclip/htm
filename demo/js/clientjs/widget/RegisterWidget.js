RegisterWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "RegisterWidget";
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      this.render();
    },
    render:function(){
      var template = _.template($("#register_template").html(),{});
      this.el.html(template);
    },
    events:{
      "click #registerAction_button":"registerAction",
      "change input[type=text]" :"userNameValidation",
      "keyup input[type=password]" : "passwordValidation"
    },
    registerAction:function(evt){
      var register_url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "register";
      var username = $("#username_r").val();
      var password = $("#password_r").val();
      var userInfo = new UserInfo(register_url);
      var widget = this;
      userInfo.registerAction({
	name:username,
	pass:password
      },
      {viewCallBack:function(status,infoText){
	 if(status == 0){
	   widget.el.html(infoText);
	   GlobalEvent.trigger(client.EVENTS.POPUP_CLOSE);
	 }else{
	   widget.el.children().find("span.action-info.name").html(infoText.name ? infoText.name : "");
	   widget.el.children().find("span.action-info.pass").html(infoText.pass ? infoText.pass : "");
	 }
       }
      });
    },
    userNameValidation:function(evt){

    },
    passwordValidation:function(evt){

    }
  })
  this.view = new _view();
}
RegisterWidget.prototype.initialize = function(){
  this.view.initialize();
}
RegisterWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.registerWidget = null;
}
RegisterWidget.prototype.render = function(){
  this.view.render();
}