App.ClipApp.Query = (function(App,Backbone,$){
  var Query = {};
  var QueryModel = App.Model.extend({});
  var QueryView = App.ItemView.extend({
    tagName: "div",
    template: "#queryclip-view-template",
    events:{
      "click #query_button" : "query",
      "click #addClip": "addClip"
    },
    query : function(){
      var word = this.$("#input_keyword").val();
      App.vent.trigger("app.clipapp.query:query",word);
    },
    addClip: function(){
      App.vent.trigger("app.clipapp:clipadd");
    }
  });

  Query.show = function(){
    var queryModel = new QueryModel();
    var queryView = new QueryView({
      model: queryModel
    });
    App.queryRegion.show(queryView);
  };

  App.bind("initialize:after", function(){
    Query.show();
  });


  App.vent.bind("app.clipapp.query:query",function(word){
    // 如此便限定了，当用户登录之后只可以查询自己的
    App.vent.trigger("app.clipapp:query", word, null);
    /*
    if(document.cookie){
      App.vent.trigger("app.clipapp:myQuery", word, null);
      App.vent.trigger("app.clipapp.routing:myquery:show",word);
    }else{
      App.vent.trigger("app.clipapp:siteQuery", word, null);
      App.vent.trigger("app.clipapp.routing:query:show",word);
    }*/
  });

  return Query;

})(App,Backbone,jQuery);
