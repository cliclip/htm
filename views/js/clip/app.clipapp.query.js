App.ClipApp.Query = (function(App,Backbone,$){
  var Query = {};
  var QueryModel = App.Model.extend({});
  var QueryView = App.ItemView.extend({
    tagName: "div",
    template: "#queryclip-view-template",
    events:{
      "click .add": "addClip",
      "click .more": "showMore",
      "click .search_btn" : "query",
      "click .text":"inputAction"
    },
    initialize:function(){
    },
    addClip: function(){
      App.vent.trigger("app.clipapp:clipadd");
    },
    showMore:function(){
      $(".options").toggle();
    },
    query : function(){
      var word = this.$(".text").val();
      this.$(".text").val("");
      App.vent.trigger("app.clipapp:query", word, null);
    },
    inputAction: function(){
      $(".text").unbind("keydown");
      $('.text').keydown(function(e){
	if(e.keyCode==13){ // 响应回车事件
	  $('.search_btn').click();
	}
      });
    }
  });

  Query.show = function(){
    var queryModel = new QueryModel();
    var queryView = new QueryView({
      model: queryModel
    });
    App.searchRegion.show(queryView);
  };

  App.bind("initialize:after", function(){
    Query.show();
  });

  return Query;

})(App,Backbone,jQuery);
