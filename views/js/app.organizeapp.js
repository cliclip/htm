//app.Organizeapp.js
var P="/_2_";
App.OrganizeApp=(function(App,Backbone,$){
  var OrganizeApp={};


  var OrganizeModel=App.Model.extend({});
  var OrganizeView=App.ItemView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .main_tag"        :"maintagAction",
      "focus #obj_tag"         :"objtagOpen",
      "focus #organize_text"   :"focusAction",
      "blur #organize_text"    :"blurAction",
      "click #organize_button" :"organizeAction",
      "click #cancel_button"   :"cancleAction"
    },
    maintagAction:function(evt){
      var id = evt.target.id;
      var tag_list = [];
      var color = document.getElementById(id).style.backgroundColor;
      if(!color){
	document.getElementById(id).style.backgroundColor="red";
	tag_list.push($("#"+id).val());
	if($("#organize_text").val() == "" || $("#organize_text").val() == "备注一下吧~"){
	  $("#organize_text").val($("#"+id).val());
	  //console.dir(tag_list);
	}else{
	  $("#organize_text").val(_.union($("#organize_text").val().split(","),$("#"+id).val()));
	}
      }else if(color == "red"){
	document.getElementById(id).style.backgroundColor="";
	tag_list = _.without(tag_list,$("#"+id).val());
	$("#organize_text").val(_.without($("#organize_text").val().split(","),$("#"+id).val()));
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

    organizeAction:function(e){
      var _data={note:[{text: $("#organize_text").val()}],tag:$("#obj_tag").val().split(",")};
      e.preventDefault();
      document.cookie ="token=1:ad44a7c2bc290c60b767cb56718b46ac";
      console.info("!!!!!!!!!!!");
      console.info(this);
      this.model.save(_data,{
	url:P+"/clip/"+this.options.clipid,
	type:"PUT",
	success:function(model,res){
	  App.vent.trigger("organize-view:success");
	},
	error:function(model,res){
	  App.vent.trigger("organize-view:error",model,res);
	}
      });
      if($("#checkbox").attr("checked")){
	console.log("不公开~");
      }
    },
    cancleAction:function(e){
      e.preventDefault();
      App.vent.trigger("organize-view:cancel");
    }
  });


  OrganizeApp.open = function(cid){
    var organizeModel = new OrganizeModel();
    OrganizeApp.objtagRegion= new App.RegionManager({
      el:"#objtag_templateDiv"
    });
    var organizeView = new OrganizeView({model:organizeModel,clipid:cid});
    console.info(organizeView);
    App.popRegion.show(organizeView);
  };
  OrganizeApp.close=function(){
    App.popRegion.close();
  };

  App.vent.bind("organize-view:cancel",function(){
    OrganizeApp.close();
  });
  App.vent.bind("organize-view:success",function(){
    OrganizeApp.close();
  });
  App.vent.bind("organzie-view:error",function(model,error){
    console.info(error);
   // RecommApp.open(model,err);
  });
    //TEST
// App.bind("initialize:after", function(){ OrganizeApp.open(); });
  return OrganizeApp;
})(App,Backbone,jQuery);