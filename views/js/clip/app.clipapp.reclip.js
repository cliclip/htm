App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var tag_list = [];
  var P = App.ClipApp.Url.base;

  var ReclipModel = App.Model.extend({
    defaults: {
      count: ""
    },
    url: "/_/reclip"
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
      console.log(id);
      console.log($("#"+id).html());
     // document.getElementById(id).className="size48 blue_48";
      var style =document.getElementById(id).className;
      console.log(style);
      if(style != "size48 orange_48"){
	document.getElementById(id).className="size48 orange_48";
	tag_list.push($("#"+id).html());
	if($("#reclip_text").val() == "" || $("#reclip_text").val() == "备注一下吧~"){
	  $("#reclip_text").val($("#"+id).html());
	 // console.dir(tag_list);
	}else{
	  $("#reclip_text").val(_.union($("#reclip_text").val().split(","),$("#"+id).html()));
	}
      }else if(style == "size48 orange_48"){
	document.getElementById(id).className="size48 white_48";
	tag_list = _.without(tag_list,$("#"+id).html());
	$("#reclip_text").val(_.without($("#reclip_text").val().split(","),$("#"+id).html()));
	//console.dir(tag_list);
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
    submit:function(e){
      e.preventDefault();
      var that = this;
      var text = $("#reclip_text").val();
      var tag = _.without($("#obj_tag").val().split(","),"add a tag","");
      tag = _.union(tag, tag_list);
      if($("#checkbox").attr("checked")){
	var params = {clip:{note: [{text:text}],tag:tag,"public":"true"}};
      }else{
	var params = {clip:{note: [{text:text}],tag:tag}};
      }
      if(this.model.get("model") == "clip"){
	App.vent.trigger("app.clipapp.reclip:submit", that.model, params);
      }else if (this.model.get("model") == "tag"){
	App.vent.trigger("app.clipapp.reclip_tag:submit", that.model, params);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.reclip:cancel");
    }
  });

  var reclipSave = function(reclipmodel,params){
    reclipmodel.save(params,{
      url: P+"/clip/"+reclipmodel.id+"/reclip",
      type: "POST",
      success: function(model, res){
	Reclip.close();
	location.reload();
      },
      error:function(model, res){
	Reclip.show(model.id, null, null, model, res);
      }
    });
  };

  var reclip_tag = function(reclipModel, params){
    var uid = reclipModel.get("user");
    var tag = reclipModel.get("tag");
    console.log(params);
    reclipModel.save(params, {
      url: P+"/user/"+uid+"/reclip/tag/"+tag,
      type: "POST",
      success: function(model, res){
	Reclip.close();
	location.reload();
      },
      error:function(model, res){
	Reclip.show(null, model, res);
      }
    });
  };

  Reclip.show = function(cid, user, tag, model, error){
    var reclipModel = new ReclipModel();
    if (model) reclipModel.set(model.toJSON());
    if (error) reclipModel.set("error", error);
    if(cid){
      reclipModel.id = cid;
      reclipModel.set("model", "clip");
      var reclipView = new ReclipView({model : reclipModel});
      App.popRegion.show(reclipView);
      $('#obj_tag').tagsInput({
	//width: 'auto',
	autocomplete_url:'test/fake_json_endpoint.html'
      });
    }else if (user && tag){
      reclipModel.fetch({
	type: "GET",
	url: P+"/user/"+user+"/clip/tag/"+tag
      });
      reclipModel.onChange(function(reclipModel){
	reclipModel.set("model", "tag");
	reclipModel.set("user", user);
	reclipModel.set("tag", tag);
	var reclipView = new ReclipView({model: reclipModel});
	App.popRegion.show(reclipView);
	$('#obj_tag').tagsInput({
	  //width: 'auto',
	  autocomplete_url:'test/fake_json_endpoint.html'
	});
      });
    }
  };

  Reclip.close = function(){
    App.popRegion.close();
  };
  App.vent.bind("app.clipapp.reclip:submit", function(model ,params){
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