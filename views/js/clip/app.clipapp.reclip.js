App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var tag_list = [];
  var value = "备注一下吧~";
  var P = App.ClipApp.Url.base;

  var ReclipModel = App.Model.extend({
  });
  var ReclipView = App.ItemView.extend({
    tagName : "div",
    className : "reclip-view",
    template : "#reclip-view-template",
    events : {
      "focus #reclip_text" : "foucsAction",
      "blur #reclip_text"  : "blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      : "maintagAction",
      "click .close_w"     : "cancel"
    },
    maintagAction:function(evt){
      evt.preventDefault();
      var id = evt.target.id;
      var style = $("#"+id).attr("class");
      //var style =document.getElementById(id).className;
      if(style != "size48 orange_48"){
	$("#"+id).attr("class","size48 orange_48");
      }else if(style == "size48 orange_48"){
	$("#"+id).attr("class","size48 white_48");
      }
    },

    foucsAction:function(evt){
      evt.preventDefault();
      if($("#reclip_text").val() == value){
	$("#reclip_text").val("");
      }
    },

    blurAction:function(evt){
      evt.preventDefault();
      if($("#reclip_text").val() == ""){
	$("#reclip_text").val(value);
      }
    },
    submit:function(evt){
      evt.preventDefault();
      var text = $("#reclip_text").val();
      var main_tag = [];
      for(var i=1;i<7;i++){
	if(document.getElementById("main_tag_"+i).className == "size48 orange_48"){
	  main_tag.push($("#main_tag_"+i).html());
	}
      };
      var tag = _.without($("#obj_tag").val().split(","),"");
      tag = _.union(tag, main_tag);
      if($("#checkbox").attr("checked")){
	var params = {clip:{note: [{text:text}],tag:tag,"public":"false"}};
      }else{
	var params = {clip:{note: [{text:text}],tag:tag}};
      }
      if(this.model.get("model") == "clip"){
	App.vent.trigger("app.clipapp.reclip:submit", this.model, params);
      }else if (this.model.get("model") == "tag"){
	App.vent.trigger("app.clipapp.reclip_tag:submit", this.model, params);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.reclip:cancel");
    }
  });

  var reclipSave = function(reclipmodel,params){
    var clip = reclipmodel.get("clip");
    var clipid = "";
    if(clip){
      clipid = clip.user.id+":"+clip.id;
      clip.note = [{text:params.clip.text}];
      clip.tag = params.clip.tag;
      if(params.clip.public == "false")   clip.public = params.clip.public;
    }else{
      clipid = reclipmodel.get("id");
    }
    var model = new App.Model();
    model.set({id : reclipmodel.id});
    model.save(params,{
      url: P+"/clip/"+clipid+"/reclip",
      type: "POST",
      success: function(model, res){
	if(clip){
	  clip.reprint_count = clip.reprint_count?clip.reprint_count+1:1;
	  reclipmodel.set({clip:clip});
	  App.vent.trigger("app.clipapp.cliplist:showlist");
	}else{
	  var listmodel=App.listRegion.currentView.collection.get(reclipmodel.id);
	  var modifyclip=listmodel.get("clip");
	  modifyclip.reprint_count = modifyclip.reprint_count ? modifyclip.reprint_count+1 : 1;
	  listmodel.set({clip:modifyclip});
	  App.vent.trigger("app.clipapp.cliplist:showlist");
	}
	Reclip.close();
      },
      error:function(model, res){
	console.info(res);
      }
    });
  };

  var reclip_tag = function(reclipModel, params){
    var uid = reclipModel.get("user");
    var tag = reclipModel.get("tag");
    var model = new App.Model();
    model.save(params, {
      url: P+"/user/"+uid+"/reclip/tag/"+tag,
      type: "POST",
      success: function(model, res){
	Reclip.close();
      },
      error:function(model, res){
	Reclip.show(null, model, res);
      }
    });
  };

  Reclip.show = function(model, user, tag){
    if(model){
      model.set("model", "clip");
      console.info(model);
      var reclipView = new ReclipView({model : model});
      App.popRegion.show(reclipView);
      $('#obj_tag').tagsInput({
      //width: 'auto',
      //autocomplete_url:'test/fake_json_endpoint.html'
    });
    }else if (user && tag){
      var reclipModel = new ReclipModel();
      reclipModel.fetch({
	type: "GET",
	url: P+"/user/"+user+"/clip/tag/"+tag
      });
      reclipModel.onChange(function(reclipModel){
	if(!reclipModel.get("count")){
	  // 现在只是公用该事件，事件名称有待改进
	  App.vent.trigger("app.clipapp.message:alert","当前用户该tag下还没有数据");
	}else{
	  // 有count表示可以收到数据
	  reclipModel.set("model", "tag");
	  reclipModel.set("user", user);
	  reclipModel.set("tag", tag);
	  var reclipView = new ReclipView({model: reclipModel});
	  App.popRegion.show(reclipView);
	  $('#obj_tag').tagsInput({
	    //width: 'auto',
	    //autocomplete_url:'test/fake_json_endpoint.html'
	  });
	}
      });
    }
  };

  Reclip.close = function(){
    App.popRegion.close();
  };
  App.vent.bind("app.clipapp.reclip:submit", function(model ,params,clip){
    reclipSave(model, params);
  });

  App.vent.bind("app.clipapp.reclip_tag:submit", function(model, params){
    reclip_tag(model, params);
  });

  App.vent.bind("app.clipapp.reclip:cancel",function(){
    Reclip.close();
  });


    // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);