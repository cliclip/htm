// app.clipapp.me.js

App.ClipApp.Me = (function(App, Backbone, $){

  var P = App.ClipApp.Url.base;
  var token = document.cookie;
  var Me = {};

  Me.Model = App.Model.extend({
    url : P+"/user/2"
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

  Me.getUid = function(){
    return Me.me.id;
  };

  App.vent.bind("app.clipapp.login:success", function(){
    Me.show();
  });

  App.vent.bind("app.clipapp.logout:success", function(){
    Me.show();
  });

  App.vent.bind("app.clipapp.register:success", function(){
    Me.show();
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
