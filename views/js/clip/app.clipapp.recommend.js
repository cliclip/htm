//app.Recommapp.js

App.ClipApp.Recommend = (function(App,Backbone,$){
  var Recommend = {};
  var P = App.ClipApp.Url.base;
  // 用来列出可以转给那些用户
  var NameListModel=App.Model.extend({});
  var NameList=App.Collection.extend({
    model : NameListModel,
    url   : P+"/lookup/0..5"
  });

  var RecommModel = App.Model.extend({});
  var RecommView = App.ItemView.extend({
    tagName:"div",
    className:"recommend view",
    template:"#recommend-view-template",
    events:{
      "click #name_list"     :  "getUserAction",
      "input #name"          :  "nameListAction",
      "click #name"          :  "nameListAction",
      "mouseover #name_list" :  "MouseOver",
      "mouseout #name_list"  :  "MouseOut",
      "focus #recommend_text":  "clearAction",
      "click #recomm_button" :  "recommendAction",
      "click #cancel_button" : "cancelAction"
    },
    getUserAction:function(evt){
      // 这里是必须要触发才会取得uid
      var uid=evt.target.id;
      var name=document.getElementById(uid).innerHTML;
      this.$("#name").val(name);
      $("#imgId").attr("src",document.getElementById(uid).title);
      this.model.set({uid:uid});
      this.$("#name_listDiv").empty();
    },
    nameListAction:function(evt){
      var str = this.$("#name").val();
      var params = {q:str};
      App.vent.trigger("app.clipapp.recommend:lookup",params);
    },
    MouseOver:function(evt){

    },
    MouseOut:function(evt){

    },
    recommendAction:function(e){
      e.preventDefault();
      var params = {
	text:$("#recommend_text").val(),
	clipid :this.model.id
      };
      if(this.model.get("uid")){
	App.vent.trigger("app.clipapp.recommend:submit",this.model,params);
      }else{
	App.vent.trigger("app.clipapp.recommend:error",this.model,{"user":"请添加用户"});
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
    collection.fetch({data:params});
    collection.onReset(function(list){
      var namelistView = new NameListCollectionView({
	collection:list
      });
      Recommend.nameListRegion.show(namelistView);
    });
  };
  var recommendSave=function(model,params){
    model.save(params,{
      url:P+"/user/"+model.get("uid")+"/recomm",
      type:"POST",
      success:function(model,res){
	Recommend.close();
      },
      error:function(model,res){
	App.vent.trigger("app.clipapp.recommend:error", model, res);
      }
    });
  };

  Recommend.show = function(cid, model,error){
    var recommModel = new RecommModel({id: cid});
    if (model) recommModel.set(model.toJSON());
    if (error) recommModel.set({"error":error});
    Recommend.nameListRegion = new App.Region({
      el:"#name_listDiv"
    });
    recommView=new RecommView({model:recommModel});
    App.popRegion.show(recommView);
  };

  // 在别地儿是否有用到
  Recommend.close = function(){
    Recommend.nameListRegion.close();
    App.popRegion.close();
  };


  App.vent.bind("app.clipapp.recommend:lookup",function(params){
    showNameList(params);
  });

  App.vent.bind("app.clipapp.recommend:submit",function(model,params){
    recommendSave(model,params);
  });
  App.vent.bind("recommend-view:cancel",function(){
    Recommend.close();
  });


  // 可能要对error信息进行不同的处理
  App.vent.bind("app.clipapp.recommend:error",function(model,err){
    Recommend.show(null, model, err);
  });
  // TEST
 // App.bind("initialize:after", function(){ Recommend.show("1:1"); });

  return Recommend;

})(App,Backbone,jQuery);

