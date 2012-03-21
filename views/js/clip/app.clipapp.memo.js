//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){
  var ClipMemo={};

  var ClipMemoModel=App.Model.extend({});
  var ClipMemoView=App.ItemView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .main_tag"        :"maintagAction",
      "focus #organize_text"   :"focusAction",
      "blur #organize_text"    :"blurAction",
      "click #organize_button" :"clipmemoAction",
      "click #cancel_button"   :"cancleAction"
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      var color = $("#"+id).css("backgroundColor");
      if(color != "rgb(255, 0, 0)"){
	$("#"+id).css("backgroundColor","red");
      }else if(color == "rgb(255, 0, 0)"){
	$("#"+id).css("backgroundColor","");
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
      var _data = {};
      var main_tag = [];
      for(var i=1;i<6;i++){
	if($("#main_tag_"+i).css("backgroundColor") == "rgb(255, 0, 0)"){
	  main_tag.push($("#main_tag_"+i).val());
	}
      };
      var obj_tag = $("#obj_tag").val().split(",");
      var tag_list = _.union(main_tag,obj_tag);
      //console.log(tag_list);
      if($("#memo_private").attr("checked")){
	_data={note:[{text: $("#organize_text").val()}],tag:tag_list,"public":"false"};
      }else{
	_data={note:[{text: $("#organize_text").val()}],tag:tag_list,"public":"true"};
      }
      e.preventDefault();
      this.model.save(_data,{
	url:P+"/clip/"+this.options.clipid,
	type:"PUT",
	success:function(model,res){
	  App.vent.trigger("app.clipapp.memo:success");
	},
	error:function(model,res){
	  App.vent.trigger("app.clipapp.memo:error",model,res);
	}
      });
    },
    cancleAction:function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.memo:cancel");
    }
  });


  ClipMemo.show = function(cid,tags,note,pub){
    var tag_main = _.filter(tags,function(tag){return tag == "好看" || tag == "好听" || tag == "好吃" || tag == "好玩" || tag == "酷" ;});
    var tag_obj = _.without(tags,tag_main);
    var clipmemoModel = new ClipMemoModel();
    clipmemoModel.set({main_tag:tag_main,obj_tag:tag_obj,note:note});
    var clipmemoView = new ClipMemoView({model:clipmemoModel,clipid:cid});
    App.popRegion.show(clipmemoView);
    if(pub == "false"){
      document.getElementById("memo_private").checked=true;
    }
    $('#obj_tag').tagsInput({
      //width: 'auto',
      autocomplete_url:'test/fake_json_endpoint.html'
    });
  };
  ClipMemo.close=function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.memo:cancel",function(){
    ClipMemo.close();
  });
  App.vent.bind("app.clipapp.memo:success",function(){
    ClipMemo.close();
  });
  App.vent.bind("app.clipapp.memo:error",function(model,error){
    console.info(error);
  });
    //TEST
// App.bind("initialize:after", function(){ ClipMemo.show(); });
  return ClipMemo;
})(App,Backbone,jQuery);