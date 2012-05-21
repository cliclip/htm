// app.comment.js
App.ClipApp.Comment = (function(App, Backbone, $){
  // comemntModel有添加，回复，删除，列表等功能
  App.Model.CommentModel = App.Model.extend({
    url:function(){
      if(this.id){
	return App.util.unique_url(P+"/clip/"+this.get("cid")+"/comment/"+this.id);
      }else{
	return App.util.unique_url(P+"/clip/"+this.get("cid")+"/comment");
      }
    }
  });
  App.Model.CommModel = App.Model.extend(); //和api层进行交互

  var CommentView = App.ItemView.extend({
    tagName : "div",
    className : "comment-view",
    template : "#comment-view-template",
    tag_list: [],
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
	this.tag_list.push(tag); //把变色的tag值push进一个数组，reclip时需要。
	$("#comm_text").val((_.union(arr_text,tag)).join(",")); //把点击的tag加入到评论文本框
      }else{
	// 与上面相反。
	this.tag_list = _.without(this.tag_list,tag);
	$("#comm_text").val((_.without(arr_text,tag)).join(","));
      }
    },
    comment : function(e){
      e.preventDefault();
      var that = this;
      var text = $.trim($("#comm_text").val());
      if(text == "" || text == defaultComm){
	$("#comm_text").focus();
	return;
      }
      var params = {text: text, pid: 0};
      var params1 = null;
      if($("#reclip_box").attr("checked")){
	params1 = {id:this.model.get("cid"),clip:{tag:this.tag_list,note:[{text:text}]}};
      }
      App.vent.trigger("app.clipapp.comment:@submit", params,params1);
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.comment:@close");
    }
  });

  var Comment = {};
  var mid,clipid,defaultComm = "说点什么吧~";//mid为model_id

  Comment.show = function(cid,model_id){
    mid = model_id;
    clipid = cid;
    var model = new App.Model.CommentModel({cid: cid});
    var view = new CommentView({model : model});
    App.popRegion.show(view);
    $(".small_pop").css("top", App.util.getPopTop("small"));
  };

  Comment.close = function(){
    App.popRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.comment:@submit", function(params,params1){
    var model = new App.Model.CommModel(params);
    model.save({},{
      url: P+"/clip/"+clipid+"/comment",
      success: function(model, res){
	if(params1){
	  App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
	}
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