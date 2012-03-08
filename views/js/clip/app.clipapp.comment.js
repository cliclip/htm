// app.comment.js

var P = "/_2_";

App.ClipApp.Comment = (function(App, Backbone, $){
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
      "click .main_tag":"maintagAction",
      "click #commentok_button" : "comment",
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

    maintagAction:function(evt){
      var id = evt.target.id;
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	tag_list.push($("#"+id).val());
	console.dir(tag_list);
	if($("#comm_text").val() == "" || $("#comm_text").val() == "说点什么吧~"){
	  $("#comm_text").val($("#"+id).val());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).val()));
	console.dir(tag_list);
      }
    },

    comment : function(e){
      e.preventDefault();
      var that = this;
      var id = that.model.id;
      var text = $("#comm_text").val();
      var params = {text: text, pid: 0};
      // console.dir(that.tag_list);
      var params1 = {clip:{tag:tag_list,note:[{text:text}]}};
      App.vent.trigger("comment", id, params);
      if($("#collect").attr("checked")){
	console.log("同时收");
	App.vent.trigger("collect", id,params1);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("comment-view:cancel");
    }
  });

  Comment.open = function(cid, model, error){
    if(cid){
      var commentModel = new CommentModel({id: cid});
    }else{
      var commentModel = new CommentModel();
      if (model) commentModel.set(model.toJSON());
      if (error) commentModel.set("error", error);
    }
    var commentView = new CommentView({model : commentModel});
    App.popRegion.show(commentView);
    tag_list = [];
  };

  Comment.close = function(){
    App.popRegion.close();
  };

  var commentAction = function(id, params){
    var comm = new CommentModel();
    comm.save(params,{
      url: P+"/clip/"+id+"/comment",
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