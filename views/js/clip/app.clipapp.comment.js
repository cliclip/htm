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
      "click #submit" : "comment",
      "click #cancel" : "cancel"
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
	document.getElementById(id).style.backgroundColor="pink";
	tag_list.push($("#"+id).val());
	console.dir(tag_list);
	if($("#comm_text").val() == "" || $("#comm_text").val() == "说点什么吧~"){
	  $("#comm_text").val($("#"+id).val());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "pink"){
	document.getElementById(id).style.backgroundColor="";
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).val()));
	console.dir(tag_list);
      }
    },

    comment : function(e){
      e.preventDefault();
      var that = this;
      var text = $("#comm_text").val();
      var params = {text: text, pid: 0};
      // console.dir(that.tag_list);
      var params1 = {clip:{tag:tag_list,note:[{text:text}]}};
      App.vent.trigger("app.clipapp.comment:submit", that.model, params);
      if($("#reclip_box").attr("checked")){
	App.vent.trigger("app.clipapp.reclip:submit", that.model,params1);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.comment:cancel");
    }
  });

  var commentAction = function(commentModel, params){
    commentModel.save(params,{
      url: P+"/clip/"+commentModel.id+"/comment",
      type: "POST",
      success: function(model, res){
	Comment.close();
	// App.vent.trigger("clip:showDetail", id);
      },
      error:function(model, res){
	Comment.show(model.id,model, res);
      }
    });
  };

  Comment.show = function(cid, model, error){
    var commentModel = new CommentModel({id: cid});
    if (model) commentModel.set(model.toJSON());
    if (error) commentModel.set("error", error);
    var commentView = new CommentView({model : commentModel});
    App.popRegion.show(commentView);
    tag_list = [];
  };
  Comment.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.comment:submit", function(model,params){
    commentAction(model, params);
  });
  App.vent.bind("app.clipapp.comment:cancel", function(){
    Comment.close();
  });


  // TEST
 //App.bind("initialize:after", function(){ Comment.show("1:1"); });

  return Comment;
})(App, Backbone, jQuery);