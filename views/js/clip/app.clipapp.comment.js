// app.comment.js
App.ClipApp.Comment = (function(App, Backbone, $){
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
    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultComm ? "" :
      $(e.currentTarget).val() );
    },
    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultComm :
      $(e.currentTarget).val() );
    },
    maintagAction:function(e){
      var id = e.target.id;
      var style = $("#"+id).attr("class");
      if(style != "size48 orange_48"){
	$("#"+id).attr("class","size48 orange_48");
	tag_list.push($("#"+id).html());
	//console.dir(tag_list);
	if($("#comm_text").val() == "" || $("#comm_text").val() == defaultComm){
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
      if(text == "" || text == defaultComm){
	$("#comm_text").focus();
	return;
      }
      var params = {cid:this.model.get("cid"),text: text, pid: 0};
      // console.dir(that.tag_list);
      var params1 = {id:this.model.get("cid"),clip:{tag:tag_list,note:[{text:text}]}};
      App.vent.trigger("app.clipapp.comment:@submit", params);
      if($("#reclip_box").attr("checked")){
	App.vent.trigger("app.clipapp.reclip:sync", params1);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.comment:@close");
    }
  });

  var Comment = {};
  var tag_list = [],defaultComm = "说点什么吧~";

  Comment.show = function(cid){
    var model = new App.Model.CommentModel({cid: cid});
    var view = new CommentView({model : model});
    App.popRegion.show(view);
    var tag_list = [];
  };

  Comment.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.comment:@submit", function(params){
    var model = new App.Model.CommentModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.cliplist:refresh",{type:"comment",pid:params.pid});
	Comment.close();
      },
      error:function(model, res){

      }
    });
  });
  App.vent.bind("app.clipapp.comment:@close", function(){
    Comment.close();
  });

  return Comment;
})(App, Backbone, jQuery);