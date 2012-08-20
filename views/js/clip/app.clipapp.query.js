App.ClipApp.Query = (function(App,Backbone,$){
  var Query = {};
  var flag = false;
  var QueryModel = App.Model.extend({});
  var QueryView = App.ItemView.extend({
    tagName: "div",
    template: "#queryclip-view-template",
    events:{
      "click .add": "addClip",
      "click .more": "showMore",
      "mouseout .more":"closeMysetup",
      "mouseover ul.options":"keepOpenMysetup",
      "mouseout ul.options":"closeMysetupMust",
      "click .search_btn" : "query",
      "click .text":"inputAction"
    },
    addClip: function(){
      App.vent.trigger("app.clipapp:clipadd");
    },
    showMore:function(){
      if(/language=en/.test(document.cookie)){
	$("ul.options").removeClass("zh");
	$("ul.options").addClass("en");
      }else{
	$("ul.options").removeClass("en");
	$("ul.options").addClass("zh");
      }
      $("ul.options").toggle();
    },
    keepOpenMysetup: function(){
      flag = true;
      $("ul.options").show();
    },
    closeMysetup: function(){
      setTimeout(function(){
	if(!flag){
	  $("ul.options").css("display","none");
	}
      },200);
    },
    closeMysetupMust: function(){
      flag = false;
      $("ul.options").css("display","none");
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
