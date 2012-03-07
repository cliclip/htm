// app.meapp.js
var P = "/_2_";
var token = "1:aaaa";
App.MeApp = (function(App, Backbone, $){
  var MeApp = {};

  var MeModel = App.Model.extend({
    // url : "/test/me.json"
    url : P+"/user/"+token.split(":")[0]
  });

  var MeView = App.ItemView.extend({
    tagName: "div",
    className: "me-view",
    template: "#me-view-template",
    events:{
      "click #recomment_button" :"recommentAction",
      "click #organize_button"  :"organizeAction"
    },
    recommentAction:function(){
      App.RecommApp.open();
    },
    organizeAction:function(){
      App.OrganizeApp.open();
    }
  });

  MeApp.show = function(){
    MeApp.me.onChange(function(meModel){
      var meView = new MeView({
        model: meModel
      });
      App.mineRegion.show(meView);
    });
  };

  App.vent.bind("me:login", function(){
    MeApp.show();
  });
  App.vent.bind("me:logout", function(){
    MeApp.show();
  });

  App.addInitializer(function(){
    MeApp.me = new MeModel();
    MeApp.me.fetch();
  });

  App.bind("initialize:after", function(){
    MeApp.show();
  });

  return MeApp;
})(App, Backbone, jQuery);

