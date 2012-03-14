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
      console.log(color);
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	tag_list.push($("#"+id).val());
	if($("#reclip_text").val() == "" || $("#reclip_text").val() == "备注一下吧~"){
	  $("#reclip_text").val($("#"+id).val());
	  //console.dir(tag_list);
	}else{
	  $("#reclip_text").val(_.union($("#reclip_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#reclip_text").val(_.without($("#reclip_text").val().split(","),$("#"+id).val()));
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
      var text = $("#reclip_text").val();
      var tag = $("#obj_tag").val().split(",");
      var params = {clip:{note: [{text:text}],tag:tag}};
      App.vent.trigger("app.clipapp.reclip:submit", that.model, params);
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
      },
      error:function(model, res){
	 Reclip.show(model.id, model, res);
      }
    });
  };




  Reclip.show = function(cid, model, error){
    var reclipModel = new ReclipModel({id: cid});
    if (model) reclipModel.set(model.toJSON());
    if (error) reclipModel.set("error", error);
    reclipView = new ReclipView({model : reclipModel});
    App.popRegion.show(reclipView);
  };

  Reclip.close = function(){
    App.popRegion.close();
  };
  App.vent.bind("app.clipapp.reclip:submit", function(model ,params){
    reclipSave(model, params);
  });
  App.vent.bind("app.clipapp.reclip:cancel",function(){
    Reclip.close();
  });


    // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);