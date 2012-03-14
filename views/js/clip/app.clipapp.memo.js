//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){
  var ClipMemo={};
  var tag_list = [];

  var ClipMemoModel=App.Model.extend({});
  var ClipMemoView=App.ItemView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .main_tag"        :"maintagAction",
      "focus #obj_tag"         :"objtagOpen",
      "focus #organize_text"   :"focusAction",
      "blur #organize_text"    :"blurAction",
      "click #organize_button" :"clipmemoAction",
      "click #cancel_button"   :"cancleAction"
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      var color = $("#"+id).css("backgroundColor");
      if(color != "red"){
	$("#"+id).css("backgroundColor","red");
	tag_list.push($("#"+id).val());
	console.dir(tag_list);
	if($("#organize_text").val() == "" || $("#organize_text").val() == "备注一下吧~"){
	  $("#organize_text").val($("#"+id).val());
	}else{
	  $("#organize_text").val(_.union($("#organize_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "red"){
	$("#"+id).css("backgroundColor","");
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#organize_text").val(_.without($("#organize_text").val().split(","),$("#"+id).val()));
	console.dir(tag_list);
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
      var _data={note:[{text: $("#organize_text").val()}],tag:$("#obj_tag").val().split(",")};
      e.preventDefault();
      //document.cookie ="token=1:ad44a7c2bc290c60b767cb56718b46ac";
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
      if($("#memo_private").attr("checked")){
	console.log("不公开~");
      }
    },
    cancleAction:function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.memo:cancel");
    }
  });


  ClipMemo.show = function(cid){
    var clipmemoModel = new ClipMemoModel();
    var clipmemoView = new ClipMemoView({model:clipmemoModel,clipid:cid});
    App.popRegion.show(clipmemoView);
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