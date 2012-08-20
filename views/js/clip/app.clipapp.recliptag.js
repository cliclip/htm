App.ClipApp.ReclipTag = (function(App, Backbone, $){
  var ReclipTag = {}, flag = false;
  var P = App.ClipApp.Url.base;

  var ReclipTagModel = App.Model.extend({
    url: function(){
      return P+"/user/"+this.id+"/reclip/tag/"+encodeURIComponent(this.get("tag"));
    }
  });

  var ReclipTagView = App.ItemView.extend({
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
      this.flag = false;
      this.bind("submit", submit);
      this.bind("closeView", close);
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
      this.trigger("submit", params, this.model.get("count"));
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
      this.trigger("closeView",params, this.model.get('count'));
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
    //console.log("user :: " +user+ " tag :: " + tag);
    if(!user) user = 2; // 系统用户
    var model = new ReclipTagModel(); //此model只用于取数据
    model.fetch({
      type: "GET",
      url: App.util.unique_url(P+"/user/"+user+"/clip/tag/"+encodeURIComponent(tag)),
      success: function(model, res){
	if(!res.count){
	  // 现在只是公用该事件，事件名称有待改进
	  App.vent.trigger("app.clipapp.message:confirm","reclip_null");
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
      App.vent.trigger("app.clipapp.message:alert", "reclip_save");
      App.vent.bind("app.clipapp.message:sure",function(){
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
	  App.vent.trigger("app.clipapp.message:success","reclip_tag_success");
	} else if(res.reclip_tag == 0){
	  App.vent.trigger("app.clipapp.message:confirm","reclip_tag_fail");
	}else{
	  App.vent.trigger("app.clipapp.message:confirm","reclip_tag",res.reclip_tag);
	}
	App.vent.trigger("app.clipapp.taglist:mytag",model.get("clip").tag);
	ReclipTag.close();
      },
      error:function(model, res){
	ReclipTag.close();
	App.vent.trigger("app.clipapp.message:confirm",res);
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
	  // 现在只是公用该事件，事件名称有待改进
	  //App.vent.trigger("app.clipapp.message:confirm","reclip_null");
	}else{
	  // 有count表示可以收到数据
	  var params = {clip:{"public":"false","tag":tag},id:user,tag:tag[0]};
	  var model_post = new ReclipTagModel(params);
	  model_post.save({}, {
	    type: "POST",
	    success: function(model, res){
	      App.vent.trigger("app.clipapp.taglist:mytag",tag);
	      var uid = App.util.getMyUid();
	      App.ClipApp.Bubb.showUserTags(uid);
	      App.ClipApp.ClipList.showUserClips(uid);
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