//app.Recommapp.js

App.ClipApp.Recommend = (function(App,Backbone,$){
  var Recommend = {};
  var recommModel;
  var P = App.ClipApp.Url.base;
  // 用来列出可以转给那些用户
  var NameListModel=App.Model.extend({});
  var NameList=App.Collection.extend({
    model : NameListModel,
    url   : P+"/lookup/0..5"
  });

  //var RecommModel = App.Model.extend({});
  var RecommView = App.ItemView.extend({
    tagName:"div",
    className:"",
    template:"#recommend-view-template",
    events:{
      "click .list"     :  "getUserAction",
      "keydown  #name"          :  "getUser",
      "input #name"          :  "nameListAction",
      "click #name"          :  "nameListAction",
      "mouseover #name_list" :  "MouseOver",
      "mouseout #name_list"  :  "MouseOut",
      "focus #recommend_text":  "clearAction",
      "click #submit"        :  "recommendAction",
      "click #cancel"        : "cancelAction",
      "click .close_w"        : "cancelAction"
    },
    getUser:function(e){
      var uid="";
      var div=$(".action-info");
      console.info(e.keyCode);
      if(e.keyCode ==9 || e.keyCode == 13 ){  //当点击回车或tab键时执行下面方法
	if(div.length != 0){
	  $("#imgId").css("display","none");
	  _.each(div,function(e){
	    var li = e.children;
//	    console.log(li[0].id);
//     	    console.log($(li[0]).attr("title"));
//	    console.log($(li[0]).text());
//	    console.log($("#name").val());
	    if($("#name").val() == $(li[0]).text()){
	      this.$("#name").val($(li[0]).text());
	      $("#imgId").attr("src",App.util.face_url($(li[0]).attr("title")));
	      $("#imgId").css("display","block");
	      uid=li[0].id.split("_")[1];
	      this.$("#name_listDiv").empty();
	    }
	    });
	  this.model.set({uid:uid});
	}
      }
    },
    getUserAction:function(evt){
      // 这里是必须要触发才会取得uid
      var id=evt.target.id;
      var uid = id.split("_")[1];
      var name=document.getElementById(id).innerHTML;
      $("#imgId").css("display","none");
      this.$("#name").val(name);
      $("#imgId").attr("src",App.util.face_url(document.getElementById(id).title));
      $("#imgId").css("display","block");
      this.model.set({uid:uid});
      this.$("#name_listDiv").empty();
    },
    nameListAction:function(evt){
      var uid = "";
      $("#alert").css("display","none");
      $("#imgId").css("display","none");
      var str = this.$("#name").val();
      var clip = this.model.get("clip");
      if(clip){
	uid = clip.user.id;
      }else{
	uid = this.model.get("user");
      }
      var params = {q:str};
      App.vent.trigger("app.clipapp.recommend:lookup",params,uid);
    },
    MouseOver:function(evt){

    },
    MouseOut:function(evt){

    },
    recommendAction:function(e){
      e.preventDefault();
      var clipid = "";
      var text=$("#recommend_text").val();
      var clip = this.model.get("clip");
      if(clip){
	clipid = clip.user.id+":"+clip.id;
      }else{
	clipid = this.model.get("id");
      }
      var params = {
	text:text,
	clipid : clipid
      };
      var params1 = {clip:{note:[{text:text}]}};
      if(this.model.get("uid")){
	App.vent.trigger("app.clipapp.recommend:submit",this.model,params);
	if($("#reclip_box").attr("checked")){
	  App.vent.trigger("app.clipapp.reclip:submit", this.model,params1);
	}
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
    className:"list",
    itemView:NameListItemView
  });
  var showNameList=function(params,owner_id){
    var collection = new NameList({});
    collection.fetch({data:params});
    collection.onReset(function(list){
      var ownmodel=list.get(owner_id);
      list.remove(ownmodel);
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

  Recommend.show = function(clipModel,model,error){
    if(clipModel){
       recommModel = clipModel;
    }
    if (model) recommModel.set(model.toJSON());
    if (error) recommModel.set({"error":error});
    Recommend.nameListRegion = new App.Region({
      el:"#name_listDiv"
    });
    recommView=new RecommView({model:recommModel});
    App.popRegion.show(recommView);
    if(error){
      $("#alert").css("display","block");
    }else{
      $("#alert").css("display","none");
    }
  };

  // 在别地儿是否有用到
  Recommend.close = function(){
    Recommend.nameListRegion.close();
    App.popRegion.close();
  };


  App.vent.bind("app.clipapp.recommend:lookup",function(params,owner_id){
    showNameList(params,owner_id);
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

