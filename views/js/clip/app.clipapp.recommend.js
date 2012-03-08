//app.Recommapp.js
var P="/_2_";
App.RecommApp = (function(App,Backbone,$){
  var RecommApp = {};

  var NameListModel=App.Model.extend({});
  var NameList=App.Collection.extend({
    model : NameListModel,
    url   : P+"/lookup/0..5"
  });


  var RecommModel = App.Model.extend({
 /*   validate:function(model){
      if(model.uid == undefined){
	return {"error":"please select a user!"};
      }
    }*/
  });
  var RecommView = App.ItemView.extend({
    tagName:"div",
    className:"recommend view",
    template:"#recommend-view-template",
    events:{
      "click #name_list"     :  "getUserAction",
      "input #name"          :  "nameListAction",
      "click #name"          :  "nameListAction",
      "click #recomm_button" :  "recommendAction",
      "mouseover #name_list" :  "MouseOver",
      "mouseout #name_list"  :  "MouseOut",
      "focus #recommend_text":  "clearAction",
      "click #cancel_button" : "cancelAction"
    },
    getUserAction:function(evt){
      var uid=evt.target.id;
      var name=document.getElementById(uid).innerHTML;
      this.$("#name").val(name);
      this.model.set({uid:uid});
      this.$("#name_listDiv").empty();
    },
    nameListAction:function(evt){
      var str = this.$("#name").val();
      var params = {q:str};
      App.vent.trigger("user:lookup:show",params);
    },
    MouseOver:function(evt){

    },
    MouseOut:function(evt){

    },
    recommendAction:function(e){
      var _data = {
	text:$("#recommend_text").val(),
	clipid :"1:1"
      };
      uid=this.model.get("uid");
      console.info(uid);
      if(uid){
	e.preventDefault();
	var that = this;
	console.info("coming");
	this.model.save(_data,{
	  url:P+"/user/"+uid+"/recomm",
	  type:"POST",
	  success:function(model,res){
	    App.vent.trigger("recommend-view:success");
	  },
	  error:function(model,res){
	    App.vent.trigger("recommend-view:error",model,res);
	  }
	});
      }else{
	App.vent.trigger("recommend-view:error",this.model,{"user":"请添加用户"});
      }
    },
    clearAction:function(evt){
      var value="说点啥吧～";
      if($("#recommend_text").val() == value){
	$("#recommend_text").val("");
      }
    },
    cancelAction:function(e){
      e.preventDefault();
      App.vent.trigger("recommend-view:cancel");
    }
  });


  var NameListItemView = App.ItemView.extend({
    tagName:"div",
    className:"action-info user",
    template:"#namelist-view-template"
  });
  var NameListCollectionView=App.CollectionView.extend({
    tagName:"div",
    itemView:NameListItemView
  });
  var showNameList=function(params){
    var collection = new NameList({});
    //document.cookie = "token=2:080912641ed0b4c793d0d3b8cda2c6b6";
    collection.fetch({data:params});
    collection.onReset(function(list){
      var namelistView = new NameListCollectionView({
	collection:list
      });
      RecommApp.nameListRegion.show(namelistView);
    });
  };


  RecommApp.open = function(model,error){
    var recommModel = new RecommModel();
    RecommApp.nameListRegion = new App.RegionManager({
      el:"#name_listDiv"
    });
   // if (model) recommModel.set(model.toJSON());can't use pre-model ,case it will post pre-model with old uid
    if (error) recommModel.set({"error":error});
    var recommView=new RecommView({model:recommModel});
    App.popRegion.show(recommView);
  };
  RecommApp.close = function(){
    RecommApp.nameListRegion.close();
    App.popRegion.close();
  };


  App.vent.bind("user:lookup:show",function(params){
    showNameList(params);
  });
  App.vent.bind("recommend-view:cancel",function(){
    RecommApp.close();
  });
  App.vent.bind("recommend-view:success",function(){
    RecommApp.close();
  });
  App.vent.bind("recommend-view:error",function(model,err){
    RecommApp.open(model,err);
  });
  // TEST
 // App.bind("initialize:after", function(){ RecommApp.open(); });

  return RecommApp;
})(App,Backbone,jQuery);

/*

recommModel.set({"error":error},{error:function(model,error){console.info(error);}});
      console.info(recommModel.has("error"));
      console.info(JSON.stringify(recommModel));*/