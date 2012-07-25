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
      "click .masker"      : "masker",
      "click .close_w"     : "cancel"
    },
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },

    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('reclip.defaultNote')  ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('reclip.defaultNote') :
      $(e.currentTarget).val() );
    },

    submit:function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
      params["id"] = this.model.id;
      if($(".error").length == 0){
	App.vent.trigger("app.clipapp.reclip:@submit", params,mid);
      }else{
	$(e.currentTarget).attr("disabled",false);
      }
    },

    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },

    cancel : function(e){
      e.preventDefault();
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
      params["id"] = this.model.id;
      App.vent.trigger("app.clipapp.reclip:@close",params,mid);
    }
  });

  function loadData(el){
    var text = "";
    if($.trim($("#reclip_text", el).val())!=_i18n('reclip.defaultNote')){//过滤defaultNote默认值
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


  var Reclip = {},flag=false;
  var mid,o_pub;

  Reclip.show = function(cid,model_id,recommend,pub){
    mid = model_id;
    var rid = recommend.rid;
    var ruser = recommend.user;
    if(pub == "false" && ruser != cid.split(':')[0]){
      // 是没公开的，并且不是clip_owner进行的操作
      App.vent.trigger("app.clipapp.message:chinese", {reclip: "no_pub"});
    }else{
      var model = new ReclipModel({id:cid,rid:rid});
      var reclipView = new ReclipView({model : model});
      App.popRegion.show(reclipView);
      if(!$("body").hasClass("noscroll")){
	flag = true;
	$("body").addClass("noscroll");
      }
      o_pub = pub;
      if(pub == "false") $("#checkbox").attr("checked",true);
      $('#obj_tag').tagsInput({});
    }
  };

  Reclip.close = function(params){
    if(!params||(params.clip.note[0].text==""&&params.clip.tag.length==0&&params.clip['public']==o_pub)){
      App.popRegion.close();
      if(flag){ $("body").removeClass("noscroll"); }
      mid = null;
    }else{
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      App.vent.trigger("app.clipapp.message:alert", "reclip_save");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.popRegion.close();
	if(flag){ $("body").removeClass("noscroll"); }
	mid = null;
      });
    }
  };

  function reclipSave(params,mid){
    var model = new ReclipModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.vent.trigger("app.clipapp.message:success", {reclip:"success"});
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

  App.vent.bind("app.clipapp.reclip:@close",function(params,mid){
    Reclip.close(params,mid);
  });

   // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);