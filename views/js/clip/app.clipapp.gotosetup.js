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
      App.ClipApp.showEmailAdd(this.model.id);
     }
   });

   GotoSetup.show = function(key, arg){
     var text = _i18n(key, arg);
     var gotoSetupModel = new GotoSetupModel({text: text});
     var gotoSetupView = new GotoSetupView({model : gotoSetupModel});
     App.popRegion.show(gotoSetupView);
     $(".login_btn").focus();
   };

  var setup = function(){
    App.popRegion.close();
    App.ClipApp.showUserEdit();
  };

  App.vent.bind("app.clipapp.register:success", function(key, res){
    if(key == "register_success"){ // invite的情况不需要触发gotosetup
      GotoSetup.show(key);
    }else if(key == 'invite'){
      App.ClipApp.showConfirm("invite", res.email, function(){
	App.vent.trigger("app.clipapp.useredit:rename");
      });
    }
  });

  return  GotoSetup;
})(App, Backbone, jQuery);