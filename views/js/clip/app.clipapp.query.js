App.ClipApp.Query = (function(App,Backbone,$){
  var Query = {};
  var QueryModel = App.Model.extend({});
  var QueryView = App.ItemView.extend({
    tagName: "div",
    template: "#queryclip-view-template",
    events:{
     "click #query_button" : "query"
    },
    query : function(){
      var word = this.$("#input_keyword").val();
      App.vent.trigger("app.clipapp.cliplist:query",word);
    }
  });

  Query.show = function(){
    var queryModel = new QueryModel();
    var queryView = new QueryView({
      model: queryModel
    });
    App.queryRegion.show(queryView);
  };
/*
  App.bind("initialize:after", function(){
    console.info("!!!!!!!!!!!!");
    Query.show();
  });
*/

  return Query;

})(App,Backbone,jQuery);
