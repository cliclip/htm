App.ClipApp.Reclip = (function(App, Backbone, $){

  var ReclipModel = App.Model.extend({
    url: function(){
      return App.ClipApp.Url.base+"/clip/"+this.id+"/reclip";
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
      params["id"] = this.model.id;
      App.vent.trigger("app.clipapp.reclip:@submit", params,mid);
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.reclip:@close");
    }
  });

  function loadData(el){
    var text = "";
    if($("#reclip_text", el).val().trim()!=defaultNote){//过滤defaultNote默认值
      text = $("#reclip_text", el).val().trim();
    }
    var main_tag = [];
    for(var i=0;i<6;i++){
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


  var Reclip = {};
  var mid, defaultNote = "备注一下吧~";

  Reclip.show = function(cid,model_id){
    mid = model_id;
    var model = new ReclipModel({id:cid});
    var reclipView = new ReclipView({model : model});
    App.popRegion.show(reclipView);
    $(".small_pop").css("top", App.util.getPopTop("small"));
    $('#obj_tag').tagsInput({
      //autocomplete_url:'test/fake_json_endpoint.html'
    });
  };

  Reclip.close = function(){
    App.popRegion.close();
    mid = null;
  };

  function reclipSave(params,mid){
    var model = new ReclipModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.cliplist:refresh",{type:"reclip",model_id:mid});
      },
      error:function(model, res){
	App.vent.trigger("app.clipapp.message:chinese",res);
      }
    });
  }

  App.vent.bind("app.clipapp.reclip:@submit", function(params,mid){
    reclipSave(params,mid);
    Reclip.close();
  });

  App.vent.bind("app.clipapp.reclip:sync", function(params,mid){
    reclipSave(params,mid);
  });

  App.vent.bind("app.clipapp.reclip:@close",function(){
    Reclip.close();
  });


    // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);