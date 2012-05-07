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
      // 取得评论框中的文本并转为数组，去除掉数组中的默认值和空值。
      var arr_text = _.compact(_.without($("#comm_text").val().split(","),defaultComm));
      var tag = $(e.currentTarget).text(); //取得当前点击的tag
      $(e.currentTarget).toggleClass("white_48"); //tag颜色的切换
      $(e.currentTarget).toggleClass("orange_48");
      if($(e.currentTarget).hasClass("orange_48")){
	tag_list.push(tag); //把变色的tag值push进一个数组，reclip时需要。
	$("#comm_text").val((_.union(arr_text,tag)).join(",")); //把点击的tag加入到评论文本框
      }else{
	// 与上面相反。
	tag_list = _.without(tag_list,tag);
	$("#comm_text").val((_.without(arr_text,tag)).join(","));
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
	App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.comment:@close");
    }
  });

  var Comment = {};
  var mid,tag_list = [],defaultComm = "说点什么吧~";//mid为model_id

  Comment.show = function(cid,model_id){
    mid = model_id;
    var model = new App.Model.CommentModel({cid: cid});
    var view = new CommentView({model : model});
    App.popRegion.show(view);
    $(".small_pop").css("top", App.util.getPopTop("small"));
    var tag_list = [];
  };

  Comment.close = function(){
    App.popRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.comment:@submit", function(params){
    var model = new App.Model.CommentModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.cliplist:refresh",{type:"comment",pid:params.pid,model_id:mid});
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