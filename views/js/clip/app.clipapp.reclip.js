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
    submit:function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
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
    if($.trim($("#reclip_text", el).val())!=defaultNote){//过滤defaultNote默认值
      text = $.trim($("#reclip_text", el).val());
    }
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i,el).html()));
      }
    };
    var obj_tag = _.without($("#obj_tag",el).val().split(","),"");
    obj_tag = _(obj_tag).map(function(e){return e.toLocaleLowerCase();});
    var tag = _.union(obj_tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{note: [{text:text}],tag:tag,"public":"false"}};
    }else{
      var params = {clip:{note: [{text:text}],tag:tag}};
    }
    return params;
  }


  var Reclip = {};
  var mid, defaultNote = "备注一下吧~";

  Reclip.show = function(cid,model_id,rid,pub){
    mid = model_id;
    var model = new ReclipModel({id:cid,rid:rid});
    var reclipView = new ReclipView({model : model});
    App.popRegion.show(reclipView);
    $(".small_pop").css("top", App.util.getPopTop("small"));
    if(pub == "false") $("#checkbox").attr("checked",true);
    $('#obj_tag').tagsInput({});
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
	App.vent.trigger("app.clipapp.message:success", "reclip");
	App.vent.trigger("app.clipapp.cliplist:refresh",{type:"reclip",model_id:mid});
	App.vent.trigger("app.clipapp.taglist:taglistRefresh",params.clip.tag);
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