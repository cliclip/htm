App.ClipApp.ReclipTag = (function(App, Backbone, $){
  var ReclipTag = {}, flag = false;
  var P = App.ClipApp.Url.base;

  var ReclipTagModel = App.Model.extend({
    url: function(){
      return P+"/user/"+this.id+"/reclip/tag/"+encodeURIComponent(this.get("tag"));
    }
  });

  var ReclipTagView = App.DialogView.extend({
    tagName : "div",
    className : "reclipTag-view",
    template : "#reclipTag-view-template",
    events : {
      //"focus #reclip_text" : "foucsAction",
      //"blur #reclip_text"  : "blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      : "maintagAction",
      "click .masker"      : "masker",
      "click .close_w"     : "cancel"
    },
    initialize:function(){
      this.bind("@submit", submit);
      this.bind("@closeView", close);
    },
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    /*
    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('reclipTag.defaultNote') ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('reclipTag.defaultNote') :
      $(e.currentTarget).val() );
    },
    */
    submit:function(evt){
      evt.preventDefault();
      var params = loadData(this.$el);
      params["id"] = this.model.get("user");
      params["tag"] = this.model.get("tag");
      this.trigger("@submit", params, this.model.get("count"));
    },
    masker : function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      var params = loadData(this.$el);
      params["id"] = this.model.get("user");
      params["tag"] = this.model.get("tag");
      this.trigger("@closeView",params, this.model.get('count'));
    }
  });


  function loadData(el){
    /*
    var text = "";
    if($.trim($("#reclip_text", el).val())!=_i18n('reclipTag.defaultNote')){//过滤defaultNote默认值
      text = $.trim($("#reclip_text", el).val());
    }
   */
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i,el).html()));
      }
    };
    var tag = _.without($("#obj_tag",el).val().split(","),"");
    tag = _.union(tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{tag:tag,"public":"false"}};
    }else{
      var params = {clip:{tag:tag}};
    }
    return params;
  }

  ReclipTag.show = function(user, tag){
    var model = new ReclipTagModel(); //此model只用于取数据
    model.fetch({
      type: "GET",
      url: App.util.unique_url(P+"/user/"+user+"/clip/tag/"+encodeURIComponent(tag)),
      success: function(model, res){
	if(!res.count){
	  // 现在只是公用该事件，事件名称有待改进
	  App.ClipApp.showConfirm("reclip_null");
	}else{
	  // 有count表示可以收到数据
	  model.set({user:user,tag:tag,count:res.count});
	  var view = new ReclipTagView({model : model});
	  App.popRegion.show(view);
	  $('#obj_tag').tagsInput({
	    //autocomplete_url:'test/fake_json_endpoint.html'
	  });
	}
      },
      error:function(model, res){
	//console.info(res);
      }
    });
  };

  ReclipTag.close = function(params, count){
    if(!params||(params.clip.tag.length==0&&params.clip['public']!='false')){
      App.popRegion.close();
    }else{
      App.ClipApp.showAlert("reclip_save", null, function(){
	App.popRegion.close();
      });
    }
  };

  var submit = function(params,count){
    var model = new ReclipTagModel(params);
    model.save({}, {
      type: "POST",
      success: function(model, res){
	if(res.reclip_tag == count){
	  App.ClipApp.showSuccess("reclip_tag_success");
	} else if(res.reclip_tag == 0){
	  App.ClipApp.showConfirm("reclip_tag_fail");
	}else{
	  App.ClipApp.showConfirm("reclip_tag",res.reclip_tag);
	}
	ReclipTag.close(); // 返回的model是什么有待测试
	App.vent.trigger("app.clipapp.recliptag:success",model.get("clip").tag);
      },
      error:function(model, res){
	ReclipTag.close();
	App.ClipApp.showConfirm(res);
      }
    });
  };

  var close = function(params, count){
    ReclipTag.close(params, count);
  };

  //user 为用户名为cliclip 的user_id tag为新手,帮助或newbie
  ReclipTag.help = function(user,tag){
    var model_get = new ReclipTagModel(); //此model只用于取数据
    model_get.fetch({
      type: "GET",
      url: App.util.unique_url(P+"/user/"+user+"/clip/tag/"+encodeURIComponent(tag[0])),
      success: function(model, res){
	if(!res.count){
	  // App.ClipApp.showConfirm("reclip_null");
	}else{
	  // 有count表示可以收到数据
	  var params = {clip:{"public":"false","tag":tag},id:user,tag:tag[0]};
	  var model_post = new ReclipTagModel(params);
	  model_post.save({}, {
	    type: "POST",
	    success: function(model, res){
	      App.vent.trigger("app.clipapp.recliptag:success",tag);
	      //console.info(res);
	    },
	    error:function(model, res){
	      //console.info(res);
	    }
	  });
	}
      },
      error:function(model, res){
	console.info(res);
      }
    });
  };

  return ReclipTag;
})(App, Backbone, jQuery);