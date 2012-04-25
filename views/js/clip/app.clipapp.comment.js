// app.comment.js
App.ClipApp.Comment = (function(App, Backbone, $){
  var Comment = {};
  var tag_list = [];
  var value = "说点什么吧~";
  // comemntModel有添加，回复，删除，列表等功能
  App.Model.CommentModel = App.Model.extend({
    url:function(){
      if(this.id){
	return P+"/clip/"+this.get("cid")+"/comment/"+this.id;
      }else{
	return P+"/clip/"+this.get("cid")+"/comment";
      }
    }
  });
  var CommentView = App.ItemView.extend({
    tagName : "div",
    className : "comment-view",
    template : "#comment-view-template",
    events : {
      "focus #comm_text" :"foucsAction",
      "blur #comm_text"  :"blurAction",
      "click .size48"    :"maintagAction",
      "click #submit"    :"comment",
      "click #cancel"    :"cancel",
      "click .close_w"   :"cancel"
    },
    foucsAction:function(evt){
      if($("#comm_text").val() == value ){
	$("#comm_text").val("");
      }
    },
    blurAction:function(evt){
      if($("#comm_text").val() == ""){
	$("#comm_text").val(value);
      }
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      var style = $("#"+id).attr("class");
      //var style =document.getElementById(id).className;
      if(style != "size48 orange_48"){
	$("#"+id).attr("class","size48 orange_48");
	tag_list.push($("#"+id).html());
	//console.dir(tag_list);
	if($("#comm_text").val() == "" || $("#comm_text").val() == value){
	  $("#comm_text").val($("#"+id).html());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).html()));
	}
      }else if(style == "size48 orange_48"){
	$("#"+id).attr("class","size48 white_48");
	tag_list = _.without(tag_list,$("#"+id).html());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).html()));
	//console.dir(tag_list);
      }
    },

    comment : function(e){
      e.preventDefault();
      var that = this;
      var text = $("#comm_text").val().trim();
      if(text == "" || text == value){
	$("#comm_text").focus();
	return;
      }
      var params = {id:this.model.id,text: text, pid: 0};
      // console.dir(that.tag_list);
      var params1 = {id:this.model.id,clip:{tag:tag_list,note:[{text:text}]}};
      App.vent.trigger("app.clipapp.comment:submit", params);
      if($("#reclip_box").attr("checked")){
	App.vent.trigger("app.clipapp.reclip:submit", params1);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.comment:cancel");
    }
  });

  var commentAction = function(params){
    var model = new App.Model.CommentModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.comment:success",params.pid);
      },
      error:function(model, res){
	Comment.show(model.id,model, res);
      }
    });
  };

  Comment.show = function(clipid){
    var model = new App.Model.CommentModel({id: clipid});
    var view = new CommentView({model : model});
    App.popRegion.show(view);
    var tag_list = [];
  };

  Comment.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.comment:submit", function(params){
    commentAction(params);
  });
  App.vent.bind("app.clipapp.comment:cancel", function(){
    Comment.close();
  });
  App.vent.bind("app.clipapp.comment:success",function(pid){
    App.vent.trigger("app.clipapp.cliplist:comment",pid);
    Comment.close();
  });

  return Comment;
})(App, Backbone, jQuery);