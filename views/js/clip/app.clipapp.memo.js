//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){
  var ClipMemo={};
  var memotype = "";
  App.Model.DetailModel = App.Model.extend({
    url: function(){
      return P+"/clip/"+this.id;
    },
    parse: function(resp){
      resp.id = resp.user+":"+resp.id;
      return resp;
    }
  });

  var ClipMemoView=App.ItemView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .size48"        :"maintagAction",
      "focus #organize_text"   :"focusAction",
      "blur #organize_text"    :"blurAction",
      "click #organize_button" :"clipmemoAction",
      "click #cancel_button"   :"cancleAction",
      "click .close_w"         :"cancleAction"
    },
    maintagAction:function(evt){
      var id = evt.currentTarget.id;
      var style =document.getElementById(id).className;
      if(style == "size48 white_48"){
	document.getElementById(id).className="size48 orange_48";
      }else if(style == "size48 orange_48"){
	document.getElementById(id).className="size48 white_48";
      }
    },
    focusAction:function(evt){
      var value = "备注一下吧~";
      if($("#organize_text").val() == value){
	$("#organize_text").val("");
      }
    },
    blurAction:function(evt){
      var value = "备注一下吧~";
      if($("#organize_text").val() == ""){
	$("#organize_text").val(value);
      }
    },
    clipmemoAction:function(e){
      e.preventDefault();
      var _data = {};
      var main_tag = [];
      for(var i=1;i<7;i++){
	if(document.getElementById("main_tag_"+i).className == "size48 orange_48"){
	  main_tag.push($("#main_tag_"+i).html());
	}
      };
      var obj_tag = $("#obj_tag").val().split(",");
      var tag_list = _.union(main_tag,obj_tag);
      tag_list = _.compact(tag_list); // 去除掉数组中的空值
      if($("#memo_private").attr("checked")){
	_data={note:[{text: $("#organize_text").val()}],tag:tag_list,"public":"false"};
      }else{
	_data={note:[{text: $("#organize_text").val()}],tag:tag_list,"public":"true"};
      }
      if(memotype == "update"){
	// clip在update时需要clip的id
	App.vent.trigger("app.clipapp.memo:rememo",this.model.id, _data);
      }else if(memotype == "add"){
	// 此处trigger的success事件是为了关闭 注的对话框。
	App.vent.trigger("app.clipapp.memo:success", _data);
      }
    },
    cancleAction:function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.memo:cancel");
    }
  });

  // 此处只有区分 update 和 add
  ClipMemo.show = function(cid,type,model){
    memotype = type;
    var memoModel = "";
    var clipmemoModel = "";
    var clipmemoView = "";
    var data = {};
    if(type == "update"){
      memoModel = new App.Model.DetailModel({id:cid});
      memoModel.fetch({
	success:function(model,res){
	  data = getData(model);
	  clipmemoModel = new App.Model.DetailModel(data);//此model作显示用
	  clipmemoModel.set({id:cid});
	  clipmemoView = new ClipMemoView({model:clipmemoModel});
	  App.popRegion.show(clipmemoView);
	  $('#obj_tag').tagsInput({
	    //autocomplete_url:'test/fake_json_endpoint.html'
	  });
	},
	error:function(model,res){}
      });
    }else if(type=="add"){
      data = getData(model);
      //console.info(data);
      clipmemoModel = new App.Model(data);//在clip  add时显示
      clipmemoView = new ClipMemoView({model:clipmemoModel});
      App.popRegion.show(clipmemoView);
      $('#obj_tag').tagsInput({
	//autocomplete_url:'test/fake_json_endpoint.html'
      });
    }
  };
  ClipMemo.close=function(){
    App.popRegion.close();
  };

  var getData = function(model){
    var text = "";
    var main_tag = {};
    var clip = "";
    clip = model.get("clip");
    if(!clip) clip = model.toJSON();
    pub = clip["public"];
    tags = clip.tag?clip.tag:[];
    note = clip.note?clip.note:"";
    if(!_.isEmpty(note)){
      var ns = _(note).select(function(e){return e.text; })
	.map(function(e){ return e.text; });
	_(ns).each(function(n){ text += n+" "; });
    }
    var tag_main = _.filter(tags,function(tag){return tag == "好看" || tag == "好听" || tag == "好吃" || tag == "好玩" || tag == "精辟" || tag == "酷" ;});
    if(!_.isEmpty(tag_main)){
      for(i=0;i < tag_main.length; i++){
	main_tag[tag_main[i]] = true;
      }
    }
    var tag_obj = _.without(tags,"好看","好听","好吃","好玩","精辟","酷");
    var _data = {note:text,main_tag:main_tag,obj_tag:tag_obj,pub:pub};
    return _data;
  };

  // 触发更新clip中的注的事件
  App.vent.bind("app.clipapp.memo:rememo", function(cid,data){
    var model = new App.Model.DetailModel(data);
    model.set({id:cid});
    model.save({},{
      success: function(model, res){
	App.vent.trigger("app.clipapp.memo:success");
      },
      error:function(model,res){
	App.vent.trigger("app.clipapp.memo:error",clipmemoModel,res);
      }
    });
  });

  App.vent.bind("app.clipapp.memo:cancel",function(){
    ClipMemo.close();
  });

  App.vent.bind("app.clipapp.memo:success",function(data){
    App.vent.trigger("app.clipapp.clip:update", data);
    ClipMemo.close();
  });

  App.vent.bind("app.clipapp.memo:error",function(model,error){
    console.info(error);
  });

    //TEST
// App.bind("initialize:after", function(){ ClipMemo.show(); });
  return ClipMemo;
})(App,Backbone,jQuery);