(function(App,Backbone,$){
  var number_limit =  140;
  var P = App.ClipApp.Url.base;
  var FeedModel = App.Model.extend({});
  var FeedBackModel = App.Model.extend({
    validate: function(attr){
      var text = attr.text;
      if(text == "" || text == _i18n('feedback.defaultText')){
	return {feedback_text: "is_null"};
      }else if(text.length > number_limit){
	return {feedback_text: "word_limit"};
      }else{
	return null;
      }
    },
    url:function(){
      return P+"/feedback";
    }
  });

  var FeedView=App.ItemView.extend({
    tagName:"div",
    className:"feed-view",
    template:"#feed-view-template",
    events:{
      "click .feed"  :  "feedbackShow"
    },
    feedbackShow : function(e){
      feedbackShow();
    }
  });

  var FeedBackView=App.DialogView.extend({
    tagName:"div",
    className:"feedback-view",
    template:"#feedback-view-template",
    events:{
      "focus #feedback_text"  : "focusAction",
      "blur  #feedback_text"  : "blurAction",
      "click #feedback_ok"    : "okClick",
      "click #feedback_cancel": "feedbackClose",
      "click .masker_layer"   : "feedbackClose",
      "click .close_w"        : "feedbackClose",
      "click .masker"         : "masker"
    },
    initialize:function(){
      this.flag = false;
      this.bind("@closeView", close);
    },
    focusAction : function(e){
      this.cleanError(e);
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('feedback.defaultText') ? "" :
      $(e.currentTarget).val() );
      $("#submit").attr("disabled",false);
    },
    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('feedback.defaultText') :
      $(e.currentTarget).val() );
    },
    okClick : function(e){
      var view = this;
      var params = {};
      var text = $("#feedback_text").val();
      var lang = App.versions.getLanguage();
      var uid = App.ClipApp.getMyUid();
      var name = null;
      text = App.util.cleanComment(text); // 过滤一下内容，防止脚本注入
      if(uid){
	name = App.ClipApp.getMyFace().name;
	params = {text:text,uid:uid,name:name,lang:lang};
      }else{
	params = {text:text,uid:uid,name:name,lang:lang};
      }
      var tmpmodel = new FeedBackModel();
      tmpmodel.save(params,{
	success:function(model,res){
	  view.trigger("@closeView");
	  App.ClipApp.showSuccess("feedback_ok");

	},
	error:function(model,error){
	  if(error.feedback_text == "is_null")
	    $("#feedback_text").blur().val("");
	  view.showError("feedback", error);
	}
      });
    },
    feedbackClose : function(e){
      this.trigger("@closeView");
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.feedbackClose(e);
      }
    }
  });

  var close =  function(text){
    App.feedbackRegion.close();
  };

  function feedShow(){
    var lang = App.versions.getLanguage();
    var feedModel = new FeedModel();
    var feedView = new FeedView({model: feedModel});
    App.feedRegion.show(feedView);
    if(lang=="zh"){
      $(".feed").addClass("feed-zh");
    }else{
      $(".feed").addClass("feed-en");
    }
  }

   function feedbackShow(){
     var feedbackModel = new FeedBackModel();
     var feedbackView = new FeedBackView({model: feedbackModel});
     App.feedbackRegion.show(feedbackView);
   }

  App.bind("initialize:after", function(){
    feedShow();
  });

})(App,Backbone,jQuery);