App.ClipApp.Bubb = (function(App, Backbone, $){
  var Bubb = {};

  Bubb.showSiteTags = function(tag)
    getSiteTags(function(tags){
    	tags.default = tag; 
  	   	App.vent.trigger("app.clipapp.bubb:show", tags);
    });
  };

  Bubb.showSiteBubs = function(tag)
    getSiteBubs(function(tags){
    	tags.default = tag; 
  	   	App.vent.trigger("app.clipapp.bubb:show", tags);
    });
  };

  Bubb.showUserTags = function(uid, tag){
    getUserTags(uid, tag, function(tags){
    	tags.default = tag; 
  	   	App.vent.trigger("app.clipapp.bubb:show", tags);
  	});
  };

  Bubb.showUserBubs = function(uid, tag){
    getUserBubs(uid, tag, function(tags){
    	tags.default = tag; 
  	   	App.vent.trigger("app.clipapp.bubb:show", tags);
  	});
  };

  App.vent.bind("app.clipapp.bubb:show", function(tags){
	var bubbView = new BubbView({model: tags});
	App.bubbRegion.show(bubbView);
  });

  App.addInitializer(function(){
    Bubb.siteTags = new Bubb.SiteTags();
    Bubb.siteTags.fetch();
    Bubb.siteBubbs = new Bubb.SiteBubbs();
    Bubb.siteBubbs.fetch();
  });
  
  return Bubb;
})(App, Backbone, jQuery);