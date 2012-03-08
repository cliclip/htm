//app.Recommapp.js
var P="/_2_";
App.ClipApp.Recommend = (function(App,Backbone,$){
  var Recommend = {};

  // 用来列出可以转给那些用户
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
      showNameList(params);
      // App.vent.trigger("user:lookup:show",params);
    },
    MouseOver:function(evt){

    },
    MouseOut:function(evt){

    },
    recommendAction:function(e){
      e.preventDefault();
      var _data = {
	text:$("#recommend_text").val(),
	clipid :"1:1"
      };
      uid=this.model.get("uid");
      if(uid){
	var that = this;
	this.model.save(_data,{
	  url:P+"/user/"+uid+"/recomm",
	  type:"POST",
	  success:function(model,res){
	    Recommend.close();
	    // App.vent.trigger("recommend-view:success");
	  },
	  error:function(model,res){
	    App.vent.trigger("recommend-view:error", model, res);
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
      Recommend.close();
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
    // document.cookie = "token=2:080912641ed0b4c793d0d3b8cda2c6b6";
    collection.fetch({data:params});
    collection.onReset(function(list){
      var namelistView = new NameListCollectionView({
	collection:list
      });
      Recommend.nameListRegion.show(namelistView);
    });
  };

  Recommend.open = function(cid, model,error){
    if(cid){
      var recommModel = new RecommModel({id: cid});
    } else {
      var recommModel = new RecommModel();
      if (model) recommModel.set(model.toJSON());
      // can't use pre-model ,case it will post pre-model with old uid
      if (error) recommModel.set({"error":error});
    }
    Recommend.nameListRegion = new App.RegionManager({
      el:"#name_listDiv"
    });
    // App.popRegion.show(reclipView);
    recommView=new RecommView({model:recommModel});
    App.popRegion.show(recommView);
  };

  // 在别地儿是否有用到
  Recommend.close = function(){
    Recommend.nameListRegion.close();
    App.popRegion.close();
  };

  /*
  App.vent.bind("user:lookup:show",function(params){
    showNameList(params);
  });

  App.vent.bind("recommend-view:cancel",function(){
    Recommend.close();
  });
  App.vent.bind("recommend-view:success",function(){
    Recommend.close();
  });
  */
  // 可能要对error信息进行不同的处理
  App.vent.bind("recommend-view:error",function(model,err){
    Recommend.open(null, model, err);
  });
  // TEST
 // App.bind("initialize:after", function(){ Recommend.open(); });

  return Recommend;

})(App,Backbone,jQuery);

/*

recommModel.set({"error":error},{error:function(model,error){console.info(error);}});
      console.info(recommModel.has("error"));
      console.info(JSON.stringify(recommModel));*/