App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var tag_list = [];

  var ReclipModel = App.Model.extend({
    url: "/_/reclip",
    defaults: {
      tag:"",name:""
    }
  });

  var ReclipView = App.ItemView.extend({
    tagName : "div",
    className : "reclip-view",
    template : "#reclip-view-template",
    events : {
      "focus #obj_tag":"objtagOpen",
      "focus #reclip_text":"foucsAction",
      "blur #reclip_text":"blurAction",
      "click #submit_button" : "submit",
      "click #cancel_button" : "cancel",
      "click .main_tag":"maintagAction"
    },

    maintagAction:function(evt){
      var id = evt.target.id;
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	tag_list.push($("#"+id).val());
	if($("#collect_text").val() == "" || $("#collect_text").val() == "备注一下吧~"){
	  $("#collect_text").val($("#"+id).val());
	  //console.dir(tag_list);
	}else{
	  $("#collect_text").val(_.union($("#collect_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#collect_text").val(_.without($("#collect_text").val().split(","),$("#"+id).val()));
	//console.dir(tag_list);
      }
    },

    objtagOpen:function(evt){
      if($("#obj_tag").val() == "add a tag"){
	$("#obj_tag").val("");
      }
      $('#obj_tag').tagsInput({
	//width: 'auto',
	autocomplete_url:'test/fake_json_endpoint.html'
      });
    },

    foucsAction:function(evt){
      var value = "备注一下吧~";
      if($("#reclip_text").val() == value){
	$("#reclip_text").val("");
      }
    },

    blurAction:function(evt){
      var value = "备注一下吧~";
      if($("#reclip_text").val() == ""){
	$("#reclip_text").val(value);
      }
    },
    submit:function(e){
      e.preventDefault();
      var that = this;
      var id = this.model.id;
      // console.info(this.model.url);
      var text = $("#reclip_text").val();
      var tag = $("#obj_tag").val().split(",");
      var params = {clip:{note: [{text:text}],tag:tag}};
      reclipSave(id, params);
    },
    cancel : function(e){
      e.preventDefault();
      Reclip.close();
    }
  });
  var reclipSave = function(id,params){
    var reclip = new ReclipModel();
    reclip.save(params,{
      url: P+"/clip/"+id+"/reclip",
      type: "POST",
      success: function(model, res){
	Reclip.close();
	// App.vent.trigger("reclip-view:success");
      },
      error:function(model, res){
	Reclip.open(model, error);
	// App.vent.trigger("reclip-view:error", model, res);
      }
    });
  };

  // 有第一个参数 对clip进行收 否则运行错误提示错误信息
  Reclip.open = function(cid, model, error){
    if(cid){
      var reclipModel = new ReclipModel({id: cid});
    } else {
      var reclipModel = new ReclipModel({id: cid});
      if (model) reclipModel.set(model.toJSON());
      if (error) reclipModel.set("error", error);
    }
    reclipView = new ReclipView({model : reclipModel});
    App.popRegion.show(reclipView);
    tag_list = [];
  };

  Reclip.close = function(){
    App.popRegion.close();
  };

  /*
   App.vent.bind("reclip-view:success", function(){
     Reclip.close();
   });
   App.vent.bind("reclip-view:error", function(model, error){
     Reclip.open(model, error);
   });
   // TEST
   //App.bind("initialize:after", function(){ Reclip.open(); });
   */

  return Reclip;
})(App, Backbone, jQuery);