App.ClipApp.GotoSetup = (function(App, Backbone, $){
  var GotoSetup = {};
  var GotoSetupModel = App.Model.extend({});
  var GotoSetupView = App.DialogView.extend({
    tagName : "div",
    className : "gotosetup-view",
    template : "#gotosetup-view-template",
    events : {
      "click .login_btn"  : "go"
    },
    initialize : function(){
      this.bind("@setup", setup);
    },
    go : function(e){
      e.preventDefault();
      this.trigger("@setup");
     }
   });

   GotoSetup.show = function(key, arg){
     var text = _i18n(key, arg);
     var gotoSetupModel = new GotoSetupModel({text: text});
     var gotoSetupView = new GotoSetupView({model : gotoSetupModel});
     App.popRegion.show(gotoSetupView);
   };

  var setup = function(){
    App.popRegion.close();
    App.ClipApp.showUserEdit();
  };

  App.vent.bind("app.clipapp.register:success", function(key){
    if(key == "register_success"){ // invite的情况不需要触发gotosetup
      ClipApp.GotoSetup.show(key, res.email);
    }
  });

  return  GotoSetup;
})(App, Backbone, jQuery);