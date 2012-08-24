App.ClipApp.Help=(function(App,Backbone,$){
  var Help={};
  var HelpModel = App.Model.extend({
    url:function(){
      return "/help/help_"+this.get("lang")+".json";
    }
  });
  var HelpView =  App.ItemView.extend({
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
      var target  = $(e.currentTarget).children("span")[0];
      var id = e.currentTarget.id;
      for(i=1;i<=5;i++){
	if("item_"+i != id){
	  $("#descrp_"+i).attr("style","display:none");
	}
      }
      $(e.currentTarget).children().toggle();
    }
  });
  Help.show = function(item){
    var lang=App.versions.getLanguage();
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
  };

  var close = function(){
    Help.close();
  };

  return Help;
})(App,Backbone,jQuery);
 //{item_1:item_1,item_2:item_2,item_3:item_3,item_4:item_4,item_5:item_5}
 // console.log(helpModel.get("item_1"));
/* success:function(model,res){
	//console.log(res);
      },
      error:function(model,error){}*/