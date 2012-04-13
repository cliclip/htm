//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){
  var ClipMemo={},cid="";
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
      // 为了保证对称性，将this.model传给外部事件
      if(this.model.get("model") == "update"){
	App.vent.trigger("app.clipapp.memo:rememo", this.model, _data);
      }else if(this.model.get("model") == "add"){
	// 此处应该将注的内容放入 model中以便没有提交之前注可以直接使用
	App.vent.trigger("app.clipapp.memo:success", this.model, _data);
      }
    },
    cancleAction:function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.memo:cancel");
    }
  });

  // 此处只有区分 update 和 add
  ClipMemo.show = function(clipModel,type){
    var text = "";
    var pub="",tags=[],note=[];
    var clip = "";
    if(type == "update"){
      clip = clipModel.get("clip"); // 从preview中取
      cid = clipModel.id; // 无论是preview还是detail都是 uid:id
    }
    if(!clip)
    clip = clipModel.toJSON(); // clipModel来自detail或者来自add没有clip
    pub = clip["public"];
    tags = clip.tag;
    note = clip.note;
    if(typeof(note) == "string"){
      text = note;
    }else if(Array.isArray(note)){
      var ns = _(note).select(function(e){return e.text; })
	.map(function(e){ return e.text; });
	_(ns).each(function(n){ text += n+" "; });
    }else if(note){
      text = note.text; //来自于preview的数据
    }
    var tag_main = _.filter(tags,function(tag){return tag == "好看" || tag == "好听" || tag == "好吃" || tag == "好玩" || tag == "精辟" || tag == "酷" ;});
    var tag_obj = _.without(tags,tag_main);
    clipModel.set({note:text});
    if(type == "update"){
      clipModel.set({model:"update"});
    }else{
      clipModel.set({model:"add"});
    }
    var clipmemoView = new ClipMemoView({model:clipModel});
    App.popRegion.show(clipmemoView);
    if(pub == "false"){
      $("#memo_private").attr("checked","true");
    }
    if(!_.isEmpty(tag_main)){
      for(i=0;i < tag_main.length; i++){
	switch(tag_main[i]){
	  case "好看":document.getElementById("main_tag_1").className="size48 orange_48";break;
	  case "好听":document.getElementById("main_tag_2").className="size48 orange_48";break;
	  case "好吃":document.getElementById("main_tag_3").className="size48 orange_48";break;
	  case "好玩":document.getElementById("main_tag_4").className="size48 orange_48";break;
	  case "精辟":document.getElementById("main_tag_5").className="size48 orange_48";break;
	  case "酷":document.getElementById("main_tag_6").className="size48 orange_48";break;
	}
      }
    };
    if(!_.isEmpty(tag_obj)){
      $("#obj_tag").val(tag_obj.join(","));
    }
    $('#obj_tag').tagsInput({
      //autocomplete_url:'test/fake_json_endpoint.html'
    });
  };
  ClipMemo.close=function(){
    App.popRegion.close();
  };

  // 触发更新clip中的注的事件
  App.vent.bind("app.clipapp.memo:rememo", function(clipmemoModel,data){
    clipmemoModel.save(data,{
      url:App.ClipApp.Url.base+"/clip/"+clipmemoModel.id,
      type:"PUT",
      success:function(model,res){
	App.vent.trigger("app.clipapp.memo:success",model,data);
      },
      error:function(model,res){
	App.vent.trigger("app.clipapp.memo:error",model,res);
      }
    });
  });

  App.vent.bind("app.clipapp.memo:cancel",function(){
    ClipMemo.close();
  });

  App.vent.bind("app.clipapp.memo:success",function(model,data){
    var clip = model.get("clip");
    if(clip){
      clip.note = data.note; // 之前写的是note[0] ?
      clip.tag = data.tag;
      clip.public = data.public;
      model.set({clip:clip});
    }else{//此处的注为从detail点击触发的，注成功后，修改cliplist中对应的model
      var listmodel=App.listRegion.currentView.collection.get(cid);
      var modifyclip=listmodel.get("clip");
      modifyclip.note = data.note;
      modifyclip.tag = data.tag;
      modifyclip.public = data.public;
      listmodel.set({clip:modifyclip});
      model.set({note:data.note}); // 之前写的是data.text
      model.set({tag:data.tag});
      model.set({"public":data.public});
    }
    ClipMemo.close();
  });

  App.vent.bind("app.clipapp.memo:error",function(model,error){
    console.info(error);
  });

    //TEST
// App.bind("initialize:after", function(){ ClipMemo.show(); });
  return ClipMemo;
})(App,Backbone,jQuery);