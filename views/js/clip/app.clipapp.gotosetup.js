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
    },
    go : function(e){
      e.preventDefault();

      App.vent.trigger("app.clipapp.gotosetup:go");
     }
   });

   GotoSetup.show = function(text){
     var gotoSetupModel = new GotoSetupModel({text: text});
     var gotoSetupView = new GotoSetupView({model : gotoSetupModel});
     App.popRegion.show(gotoSetupView);
   };

   App.vent.bind("app.clipapp.gotosetup:show", function(key, email){
     var message = _i18n(key, email);
     GotoSetup.show(message);
   });

  App.vent.bind("app.clipapp.gotosetup:go", function(){
    App.popRegion.close();
    App.vent.trigger("app.clipapp.useredit:show",App.util.getMyUid());
  });

  return  GotoSetup;
})(App, Backbone, jQuery);