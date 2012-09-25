// app.comment.js
App.ClipApp.Comment = (function(App, Backbone, $){
  var number_limit =  140;
  var P = App.ClipApp.Url.base;

  // comemntModel有添加，回复，删除，列表等功能
  App.Model.CommentModel = App.Model.extend({
    url:function(){
      if(this.id){
	return App.ClipApp.encodeURI(P+"/clip/"+this.get("cid")+"/comment/"+this.id);
      }else{
	return App.ClipApp.encodeURI(P+"/clip/"+this.get("cid")+"/comment");
      }
    }
  });
  // 主要用于进行comment的保存操作
  App.Model.CommModel = App.Model.extend({
    validate: function(attr){
      var text = attr.text;
      if(text == "" || text == _i18n('comment.defaultText')){
	return {comm_text: "is_null"};
      }else if(text.length > number_limit){
	return {comm_text: "word_limit"};
      }else{
	return null;
      }
    }
  }); //和api层进行交互

  var CommentView = App.DialogView.extend({
    tagName : "div",
    className : "comment-view",
    template : "#comment-view-template",
    tag_list: [],
    events : {
      "focus #comm_text" :"focusAction",
      "blur #comm_text"  :"blurAction",
     // "click .size48"    :"maintagAction",
      "keydown #comm_text":"shortcut_comment",
      "click #submit"    :"comment",
      "click #cancel"    :"cancel",
      "click .masker"    :"masker",
      "click .close_w"   :"cancel"
    },
    initialize:function(){
      this.bind("@closeView", close);
    },
    focusAction:function(e){
      this.cleanError(e);
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('comment.defaultText') ? "" :
      $(e.currentTarget).val() );
      $("#submit").attr("disabled",false);
    },
    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('comment.defaultText') :
      $(e.currentTarget).val() );
    },
    /*maintagAction:function(e){
      // 取得评论框中的文本并转为数组，去除掉数组中的默认值和空值。
      $("#comm_text").focus();
      var arr_text = _.compact(_.without($("#comm_text").val().split(","),_i18n('comment.defaultText')));
      var tag = $(e.currentTarget).text(); //取得当前点击的tag
      $(e.currentTarget).toggleClass("white_48"); //tag颜色的切换
      $(e.currentTarget).toggleClass("orange_48");
      if($(e.currentTarget).hasClass("orange_48")){
	this.tag_list.push(tag); //把变色的tag值push进一个数组，reclip时需要。
	$("#comm_text").val((_.union(arr_text,tag)).join(",")); //把点击的tag加入到评论文本框
      }else{ // 与上面相反。
	this.tag_list = _.without(this.tag_list,tag);
	$("#comm_text").val((_.without(arr_text,tag)).join(","));
      }
    },*/
    comment : function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var view = this;
      var text = $.trim($("#comm_text").val());
      text = App.util.cleanInput(text); // 过滤一下评论内容，防止脚本注入
      var params = {text: text, pid: 0};
      var params1 = null;
      /*if($("#reclip_box").attr("checked")){
	params1 = {id:this.model.get("cid"),clip:{tag:this.tag_list,note:[{text:text}]}};}*/
      var tmpmodel = new App.Model.CommModel();
      tmpmodel.save(params,{
	url: App.ClipApp.encodeURI(P+"/clip/"+clipid+"/comment"),
	success: function(model, res){
	  /*if(params1){
	    App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
	  }*/
	  App.vent.trigger("app.clipapp.comment:success", {model_id:mid});
	  App.ClipApp.showSuccess("comment");
	  view.trigger("@closeView");
	},
	error:function(model, res){
	  if(res.comm_text == "is_null")
	    $("#comm_text").blur().val("");
	  view.showError("comment", res);
	}
      });
    },
    shortcut_comment : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#submit").click();
	return false;
      }else {
	return true;
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      var text = $.trim($("#comm_text").val());
      if(text == _i18n('comment.defaultText')) text = "";
      this.trigger("@closeView",text);
    }
  });

  var Comment = {};

  var mid,clipid;//mid为model_id

  Comment.show = function(cid,model_id){
    mid = model_id;
    clipid = cid;
    var model = new App.Model.CommModel({cid: cid});
    var view = new CommentView({model : model});
    App.popRegion.show(view);
  };

  Comment.close = function(text){
    if(!text || text == ""){
      App.popRegion.close();
      mid = null;
    }else{
      var fun = function(){App.popRegion.close();mid = null;};
      App.ClipApp.showAlert("comment_save", null, fun);
    }
  };

  var close =  function(text){
    Comment.close(text);
  };

  return Comment;
})(App, Backbone, jQuery);