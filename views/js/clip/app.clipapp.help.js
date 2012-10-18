App.ClipApp.Help=(function(App,Backbone,$){
  var Help={},hist;
  var HelpModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI("/help/help_"+this.get("lang")+".json");
    }
  });
  var HelpView =  App.DialogView.extend({
    tagName : "div",
    className : "help-view",
    template:"#help-view-template",
    events:{
      "click .close_w"  :"cancel",
      "click .masker"   :"masker_close",
      "click .title"    :"toggle"
    },
    initialize: function(){
      this.bind("@closeView",close);
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@closeView");
    },
    masker_close:function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@closeView");
      }
    },
    toggle : function(e){
      e.preventDefault();
      var id = e.currentTarget.id.split("_")[1];
      Backbone.history.navigate("help/"+id, false);
      for(i=1;i<=11;i++){
	if(i != id){
	  $("#descrp_"+i).hide();
	}
      }
      $("#descrp_"+id).toggle();
      //console.info($(e.currentTarget));
      //$(e.currentTarget).nextAll().toggle();
    }
  });

  Help.show = function(item,history){
    var lang=App.versions.getLanguage();
    hist=history;
    var help = new HelpModel({item:item,lang:lang});
    help.fetch({});
    help.onChange(function(helpModel){
      var helpView = new HelpView({model:helpModel});
      App.popRegion.show(helpView);
      $("#descrp_"+item).attr("class","current");
    });
  };

  Help.close = function(){
    App.popRegion.close();
    if(/help\/([0-9]+)/.test(hist))  hist = "";
    Backbone.history.navigate(hist, false);
  };

 var close = function(){
    Help.close();
  };

  return Help;
})(App,Backbone,jQuery);
