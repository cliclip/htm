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

  var UserListView = App.ItemView.extend({
    tagName: "div",
    className: "userlist-view",
    template: "#userlist-view-template",
    events : {
      "click #comment_button" : "comment",
      "click #collect_button" : "collect",
      "click #delete_button" : "delete"
    },
    comment : function(e){
      App.Comment.open();
    },
    collect : function(e){
      App.Collect.open();
    },
    delete : function(e){
      App.Delete.open();
    }
  });

  var showUser = function(userModel){
    var userFaceView = new UserFaceView({
      model: userModel
    });
    var userBubbView = new UserBubbView({
      model: userModel
    });

    var userListView = new UserListView({
      model: userModel
    });

    App.faceRegion.show(userFaceView);
    App.bubbRegion.show(userBubbView);
    App.listRegion.show(userListView);
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
