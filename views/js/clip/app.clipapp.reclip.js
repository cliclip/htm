App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var tag_list = [];
  var P = App.ClipApp.Url.base;
  var flag = false;

  var ReclipModel = App.Model.extend({
    defaults: {
      count: ""
    }
  });
  var ReclipView = App.ItemView.extend({
    tagName : "div",
    className : "reclip-view",
    template : "#reclip-view-template",
    events : {
      "focus #obj_tag"     :"objtagOpen",
      "focus #reclip_text" :"foucsAction",
      "blur #reclip_text"  :"blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      :"maintagAction",
      "click .close_w"     : "cancel"
    },
    maintagAction:function(evt){
      evt.preventDefault();
      var id = evt.target.id;
      var style =document.getElementById(id).className;
      if(style != "size48 orange_48"){
	document.getElementById(id).className="size48 orange_48";
      }else if(style == "size48 orange_48"){
	document.getElementById(id).className="size48 white_48";
      }
    },
    objtagOpen:function(evt){
      evt.preventDefault();
      if($("#obj_tag").val() == "add a tag"){
	$("#obj_tag").val("");
      }
    },

    foucsAction:function(evt){
      evt.preventDefault();
      var value = "备注一下吧~";
      if($("#reclip_text").val() == value){
	$("#reclip_text").val("");
      }
    },

    blurAction:function(evt){
      evt.preventDefault();
      var value = "备注一下吧~";
      if($("#reclip_text").val() == ""){
	$("#reclip_text").val(value);
      }
    },
    submit:function(evt){
      evt.preventDefault();
      var clip = this.model.get("clip");
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
	if(clip){
	  clip.note = [{text:text}];
	  clip.tag = tag;
	  clip.public = "false";
	}
	var params = {clip:{note: [{text:text}],tag:tag,"public":"false"}};
      }else{
	if(clip){
	  clip.note = [{text:text}];
	  clip.tag = tag;
	}
	var params = {clip:{note: [{text:text}],tag:tag}};
      }
      if(this.model.get("model") == "clip"){
	App.vent.trigger("app.clipapp.reclip:submit", this.model, params,clip);
      }else if (this.model.get("model") == "tag"){
	App.vent.trigger("app.clipapp.reclip_tag:submit", this.model, params,clip);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.reclip:cancel");
    }
  });

  var reclipSave = function(reclipmodel,params,clip){
    var clipid = "";
    if(clip){
      clipid = reclipmodel.id;
    }else{
      clipid = reclipmodel.get("user")+":"+reclipmodel.id;
    }
    reclipmodel.save(params,{
      url: P+"/clip/"+clipid+"/reclip",
      type: "POST",
      success: function(model, res){
	if(flag){
	  if(clip){
	    clip.reprint_count = clip.reprint_count?clip.reprint_count+1:1;
	    model.set({clip:clip});
	  }
	  App.vent.trigger("app.clipapp.cliplist:showlist",null,"reclip");
	  Reclip.close();
	}
      },
      error:function(model, res){
	console.info(res);
      }
    });
  };

  var reclip_tag = function(reclipModel, params){
    var uid = reclipModel.get("user");
    var tag = reclipModel.get("tag");
    reclipModel.save(params, {
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
    console.info(model);
    flag = true;
    if(model){
      console.log(model);
      model.set("model", "clip");
      var reclipView = new ReclipView({model : model});
      App.popRegion.show(reclipView);
      $('#obj_tag').tagsInput({
	//width: 'auto',
	autocomplete_url:'test/fake_json_endpoint.html'
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
	  App.vent.trigger("app.clipapp.emailadd:success","当前用户该tag下还没有数据");
	}else{
	  // 有count表示可以收到数据
	  reclipModel.set("model", "tag");
	  reclipModel.set("user", user);
	  reclipModel.set("tag", tag);
	  var reclipView = new ReclipView({model: reclipModel});
	  App.popRegion.show(reclipView);
	  $('#obj_tag').tagsInput({
	    //width: 'auto',
	    autocomplete_url:'test/fake_json_endpoint.html'
	  });
	}
      });
    }
  };

  Reclip.close = function(){
    App.popRegion.close();
    flag = false;
  };
  App.vent.bind("app.clipapp.reclip:submit", function(model ,params,clip){
    reclipSave(model, params, clip);
  });

  App.vent.bind("app.clipapp.reclip_tag:submit", function(model, params,clip){
    reclip_tag(model, params, clip);
  });

  App.vent.bind("app.clipapp.reclip:cancel",function(){
    Reclip.close();
  });


    // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);