
// app.comment.js

App.Comment = (function(App, Backbone, $){
  var Comment = {};
  var tag_list = [];
  var CommentModel = App.Model.extend({});

  var CommentView = App.ItemView.extend({
  	tagName : "div",
  	className : "comment-view",
  	template : "#comment-view-template",
  	events : {
	  "focus #comm_text":"foucsAction",
	  "blur #comm_text":"blurAction",
  	  "click #comment_button" : "comment",
  	  "click #cancel_button" : "cancel"
  	},

	foucsAction:function(evt){
	  if($("#comm_text").val() == "说点什么吧~" ){
	    $("#comm_text").val("");
	  }
	},

	blurAction:function(evt){
	  if($("#comm_text").val() == ""){
	    $("#comm_text").val("说点什么吧~");
	  }
	},

  	comment : function(e){
	  var that = this;
	  var id = "1:1";
	  var text = $("#comm_text").val();
	  var pid = "0";
  	  e.preventDefault();
	  var params = {text: text, pid: pid};
	  var params1 = {clip:{tag:tag_list,note:[{text:text}]}};
	  App.vent.trigger("comment", id, params);
	  if($("#collect").attr("checked")){
	    console.log("同时收");
	     App.vent.trigger("collect", params1);
	  }
  	},
  	cancel : function(e){
  	  e.preventDefault();
  	  App.vent.trigger("comment-view:cancel");
  	}
  });

  var MaintagView = App.ItemView.extend({
    tagName : "Div",
    className : "maintag-view",
    template:"#maintag-view-template",
    events : {
      "click .main_tag":"maintagAction"
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	tag_list.push($("#"+id).val());
	if($("#comm_text").val() == "" || $("#comm_text").val() == "说点什么吧~")
	{
	  $("#comm_text").val($("#"+id).val());
	  //console.dir(tag_list);
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).val()));
	//console.dir(tag_list);
      }
    }
  });

  Comment.open = function(model, error){
  	var commentModel = new CommentModel();
  	if (model) commentModel.set(model.toJSON());
  	if (error) commentModel.set("error", error);
  	commentView = new CommentView({model : commentModel});
	miantagView = new MaintagView();
	Comment.maintagRegion = new App.RegionManager({
	  el:"#maintag_templateDiv"
	});
	App.popRegion.show(commentView);
	Comment.maintagRegion.show(miantagView);
	tag_list = [];
  };

  Comment.close = function(){
        Comment.maintagRegion.close();
  	App.popRegion.close();
  };

  var commentAction = function(id, params){
    var comm = new CommentModel();
    comm.save(params,{
      url: "/_2_/clip/"+this.id+"/comment",
      type: "POST",
      success: function(model, res){
  	//console.log("success model = %j, response = %j", model, res);
  	App.vent.trigger("comment-view:success");
      },
      error:function(model, res){
  	// that.model.set("error", res);
  	// that.model.change();
  	//console.log("error model = %j, response = %j", model, res);
  	App.vent.trigger("comment-view:error", model, res);
      }
    });
  };

  App.vent.bind("comment", function(id ,params){
    commentAction(id, params);
  });

  App.vent.bind("comment-view:success", function(){
  	Comment.close();
  });

  App.vent.bind("comment-view:error", function(model, error){
  	Comment.open(model, error);
  });

  App.vent.bind("comment-view:cancel", function(){
  	Comment.close();
  });

  // TEST
  //App.bind("initialize:after", function(){ Comment.open(); });

  return Comment;
})(App, Backbone, jQuery);