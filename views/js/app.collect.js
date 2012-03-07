App.Collect = (function(App, Backbone, $){
  var Collect = {};
  var tag_list = [];
  var CollectModel = App.Model.extend({
  	url: "/_/collect",
    defaults: {
      tag:"",name:""
    }
  });

  var CollectView = App.ItemView.extend({
  	tagName : "div",
  	className : "collect-view",
  	template : "#collect-view-template",
  	events : {
	  "focus #obj_tag":"objtagOpen",
  	  "focus #collect_text":"foucsAction",
	  "blur #collect_text":"blurAction",
	  "click #collect_button" : "collectAction",
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
	  if($("#collect_text").val() == value){
	    $("#collect_text").val("");
	  }
	},

	blurAction:function(evt){
	  var value = "备注一下吧~";
	  if($("#collect_text").val() == ""){
	    $("#collect_text").val(value);
	  }
	},

	collectAction:function(e){
	  var that = this;
	  var id = "1:1";
	  var text = $("#collect_text").val();
	  var tag = $("#tag").val().split(",");
	  var clip = {note: [{text:text}],tag:tag};
	  e.preventDefault();
	  this.model.save({clip:clip},{
	    url: "/_2_/clip/"+id+"/reclip",
	    type: "POST",
	    success: function(model, res){
  	      App.vent.trigger("login-view:success");
  	    },
  	    error:function(model, res){
  	      App.vent.trigger("login-view:error", model, res);
  	    }
  	  });
  	},
  	cancel : function(e){
  	  e.preventDefault();
  	  App.vent.trigger("collect-view:cancel");
  	}
  });

  Collect.open = function(model, error){
  	var collectModel = new CollectModel();
  	if (model) collectModel.set(model.toJSON());
  	if (error) collectModel.set("error", error);
	collectView = new CollectView({model : collectModel});
	App.popRegion.show(collectView);
	tag_list = [];
  };

  Collect.close = function(){
  	App.popRegion.close();
  };

  App.vent.bind("collect-view:success", function(token){
  	// document.cookie.token = token;
  	Collect.close();
  });

  App.vent.bind("collect-view:error", function(model, error){
  	Collect.open(model, error);
  });

  App.vent.bind("collect-view:cancel", function(){
  	Collect.close();
  });

  // TEST
  App.bind("initialize:after", function(){ Collect.open(); });

  return Collect;
})(App, Backbone, jQuery);