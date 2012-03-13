// app.clipapp.me.js

App.ClipApp.Me = (function(App, Backbone, $){

  var P = "/_2_";
  var token = "1:aaaa";
  var Me = {};

  Me.Model = App.Model.extend({
    // url : "/test/me.json"
    url : P+"/user/"+token.split(":")[0]
  });

  Me.View = App.ItemView.extend({
    tagName: "div",
    className: "me-view",
    template: "#me-view-template"
  });

  Me.show = function(){
    Me.me.onChange(function(meModel){
      var meView = new Me.View({
        model: meModel
      });
      App.mineRegion.show(meView);
    });
  };

  App.vent.bind("app.clipapp.login:success", function(){
    MeApp.show();
  });
  App.vent.bind("app.clipapp:logout:success", function(){
    MeApp.show();
  });

  App.addInitializer(function(){
    Me.me = new Me.Model();
    Me.me.fetch();
  });

  App.bind("initialize:after", function(){
    Me.show();
  });

  return Me;
})(App, Backbone, jQuery);
