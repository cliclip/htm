// app.userapp.js

App.UserApp = (function(App, Backbone, $){
  var UserApp = {};

  var UserModel = App.Model.extend({
    url: function(){
      return "/test/user-"+this.id+".json";
    }
  });

  var UserFaceView = App.ItemView.extend({
    tagName: "div",
    className: "userface-view",
    template: "#userface-view-template"
  });

  var UserBubbView = App.ItemView.extend({
    tagName: "div",
    className: "userbubb-view",
    template: "#userbubb-view-template"
  });

  var showUser = function(userModel){
    var userFaceView = new UserFaceView({
      model: userModel
    });
    var userBubbView = new UserBubbView({
      model: userModel
    });
    App.faceRegion.show(userFaceView);
    App.bubbRegion.show(userBubbView);
  };

  UserApp.show = function(uid){
    var user = new UserModel({
      id: uid
    });
    user.fetch();
    user.onChange(showUser);
  };

  App.vent.bind("user:show", function(userModel){
    showUser(userModel);
  });

  return UserApp;
})(App, Backbone, jQuery);
