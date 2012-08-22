App.ClipApp.GotoSetup = (function(App, Backbone, $){
  var GotoSetup = {};
  var GotoSetupModel = App.Model.extend({});
  var GotoSetupView = App.ItemView.extend({
    tagName : "div",
    className : "gotosetup-view",
    template : "#gotosetup-view-template",
    events : {
      "click .login_btn"  : "go"
    },
    initialize : function(){
      this.flag = false;
      this.bind("setup", setup);
    },
    go : function(e){
      e.preventDefault();
      this.trigger("setup");
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

  return  GotoSetup;
})(App, Backbone, jQuery);