App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var defaultNote = "备注一下吧~";
  var P = App.ClipApp.Url.base;

  var ReclipModel = App.Model.extend({
    url: function(){
      return P+"/clip/"+this.id+"/reclip";
    }
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
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },

    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultNote ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultNote :
      $(e.currentTarget).val() );
    },
    submit:function(evt){
      evt.preventDefault();
      var params = loadData(this.$el);
      if(this.model.get("model") == "clip"){
	params["id"] = this.model.id;
	App.vent.trigger("app.clipapp.reclip:submit", params);
      }else if (this.model.get("model") == "tag"){
	App.vent.trigger("app.clipapp.reclip_tag:submit", this.model, params);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.reclip:close");
    }
  });

  function loadData(el){
    var text = "";
    if($("#reclip_text", el).val().trim()!=defaultNote){//过滤defaultNote默认值
      text = $("#reclip_text", el).val().trim();
    }
    var main_tag = [];
    for(var i=1;i<7;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($("#main_tag_"+i,el).html().trim());
      }
    };
    var tag = _.without($("#obj_tag",el).val().split(","),"");
    tag = _.union(tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{note: [{text:text}],tag:tag,"public":"false"}};
    }else{
      var params = {clip:{note: [{text:text}],tag:tag}};
    }
    return params;
  }

  var reclipSave = function(params){
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

  function showReclip(data){
    var model = new ReclipModel(data);
    var reclipView = new ReclipView({model : model});
    App.popRegion.show(reclipView);
    $('#obj_tag').tagsInput({
      //autocomplete_url:'test/fake_json_endpoint.html'
    });
  }

  Reclip.show = function(cid, user, tag){
    if(cid){
      showReclip({id:cid,model:"clip"});
    }else if (user && tag){
      var model = new ReclipModel(); //此model只用于取数据
      model.fetch({
	type: "GET",
	url: P+"/user/"+user+"/clip/tag/"+tag,
	success: function(model, res){
	  if(!model.get("count")){
	    // 现在只是公用该事件，事件名称有待改进
	    App.vent.trigger("app.clipapp.message:alert","当前用户该tag下还没有数据");
	  }else{
	    // 有count表示可以收到数据
	    showReclip({model:"tag",user:user,tag:tag,count:model.get("count")});
	  }
	},
	error:function(model, res){
	  console.info(res);
	}
      });
    }
  };

  Reclip.close = function(){
    App.popRegion.close();
  };
  App.vent.bind("app.clipapp.reclip:submit", function(params){
    var model = new ReclipModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.cliplist:reload",{type:"reclip"});
	Reclip.close();
      },
      error:function(model, res){
	console.info(res);
      }
    });
  });

  App.vent.bind("app.clipapp.reclip_tag:submit", function(model, params){
    reclip_tag(model, params);
  });

  App.vent.bind("app.clipapp.reclip:close",function(){
    Reclip.close();
  });


    // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);