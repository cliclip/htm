// app.comment.js

App.ClipApp.Comment = (function(App, Backbone, $){
  var Comment = {};
  var tag_list = [];

  var CommentView = App.ItemView.extend({
    tagName : "div",
    className : "comment-view",
    template : "#comment-view-template",
    events : {
      "focus #comm_text":"foucsAction",
      "blur #comm_text":"blurAction",
      "click .size48":"maintagAction",
      "click #submit" : "comment",
      "click #cancel" : "cancel",
      "click .close_w" : "cancel"
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
      var style =document.getElementById(id).className;
      if(style != "size48 orange_48"){
	document.getElementById(id).className="size48 orange_48";
	tag_list.push($("#"+id).html());
	//console.dir(tag_list);
	if($("#comm_text").val() == "" || $("#comm_text").val() == "说点什么吧~"){
	  $("#comm_text").val($("#"+id).html());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).html()));
	}
      }else if(style == "size48 orange_48"){
	document.getElementById(id).className="size48 white_48";
	tag_list = _.without(tag_list,$("#"+id).html());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).html()));
	//console.dir(tag_list);
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
    var clip = commentModel.get("clip");
    var clipid = clip.user.id+":"+clip.id;
    commentModel.save(params,{
      url: App.ClipApp.Url.base+"/clip/"+clipid+"/comment",
      type: "POST",
      success: function(model, res){
	var clip = model.get("clip");
	clip.reply_count = clip.reply_count ? clip.reply_count+1 : 1;
	model.set({clip:clip});
	App.vent.trigger("app.clipapp.cliplist:showlist");
	Comment.close();
	// App.vent.trigger("clip:showDetail", id);
      },
      error:function(model, res){
	Comment.show(model.id,model, res);
      }
    });
  };

  Comment.show = function(model){
    var commentView = new CommentView({model : model});
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