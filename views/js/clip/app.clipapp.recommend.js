//app.Recommapp.js

App.ClipApp.Recommend = (function(App,Backbone,$){

  // 用来列出可以转给那些用户
  var NameListModel=App.Model.extend({});
  var NameList=App.Collection.extend({
    model : NameListModel,
    url   : App.ClipApp.Url.base+"/lookup/0..5"
  });

  var RecommModel = App.Model.extend({
    url: function(){
      return App.ClipApp.Url.base+"/user/"+this.id+"/recomm";
    },
    validate: function(attrs){
      if(attrs.name == "" || !attrs.name){
	return {recomm_name: "is_null"};
      }
      if(attrs.id == "" || !attrs.id){
	return {recomm_name: "not_exist"};
      }
      return null;
    }
  });

  var RecommView = App.ItemView.extend({
    tagName:"div",
    className:"",
    template:"#recommend-view-template",
    tmpmodel:"",
    events:{
      "click .user" : "getUserAction",
      "input #recomm_name": "nameListAction",
      "click #recomm_name": "nameListAction",
      "focus #recomm_name": "cleanError",
      "focus #recomm_name": "nameListShow",
      "blur #recomm_name" : "nameBlur",
      "mouseover .user"   :  "MouseOver",
      "mouseout .user"    :  "MouseOut",
      "focus #recommend_text":  "clearAction",
      "blur  #recommend_text":  "textBlur",
      "click #submit"        :  "recommendAction",
      "click #cancel"        :  "cancelAction",
      "click .close_w"       :  "cancelAction"
    },
    getUserAction:function(e){
      $("#imgId").css("display","none");
      var face = $(e.currentTarget)[0].children[0].children[0].src;
      var name = $($(e.currentTarget)[0].children[1]).text();
      var uid =  $(e.currentTarget)[0].children[1].id.split("_")[1];
      this.$("#recomm_name").val(name);
      $("#imgId").attr("src",face);
      $("#imgId").css("display","block");
      this.model.set({uid:uid},{silent:true});
    },
    nameListAction:function(evt){
      $("#alert").css("display","none");
      $("#imgId").css("display","none");
      var str = this.$("#recomm_name").val().trim();
      var clip_owner = this.model.get("clipid").split(":")[0];//clip的拥有者
      var params = {q:str};
      //查询friend
      App.vent.trigger("app.clipapp.recommend:@lookup",params,clip_owner);
    },

    nameBlur:function(){
      var view = this;
      var clipid = this.model.get("clipid");
      setTimeout(function(){
	var data = {};
	_.each(this.$(":input").serializeArray(), function(obj){
	  data[obj.name] = obj.value;
	});
	var div=$(".action-info");
	if(div.length != 0){
	  $("#imgId").css("display","none");
	  _.each(div,function(e){
	    var li = e.children;
	    if(this.$("#recomm_name").val() == $(li[1]).text()){
	      this.$("#recomm_name").val($(li[1]).text());
	      $("#imgId").attr("src",li[0].children[0].src);
	      $("#imgId").css("display","block");
	      data.id=li[1].id.split("_")[1];
	    }
	  });
	  $(".name_list").hide();
	}
	// 先根据 data[name]找到uid，在进行model的新建和name的set
	view.tmpmodel = new RecommModel({clipid:clipid});
	view.tmpmodel.set(data, {
	  error: function(model, error){
	    view.showError(error);
	  }
	});
	$(".name_list").hide();
      },200);
    },
    nameListShow:function(e){
      var div=$(".action-info");
      if(div.length != 0){
	$(".name_list").show();
      }else{
	$(".name_list").hide();
      }
    },
    MouseOver:function(e){
      $(e.currentTarget).css("background-color","#888");
    },
    MouseOut:function(e){
       $(e.currentTarget).css("background-color","");
    },
    recommendAction:function(e){
      // 在点击转确定按钮时，model.id model.name都已经设置成功
      e.preventDefault();
      var view = this;
      setTimeout(function(){
	var clipid = view.model.get("clipid");
	var text=$("#recommend_text").val().trim();
	//recommend 需要的参数
	view.tmpmodel.save({text: text},{
	  type:"POST",
	  success:function(model,res){
	    Recommend.close();
	  },
	  error:function(model,res){
	    view.showError(res);
	  }
	});
      }, 200);
	//reclip 需要的参数
      if($("#reclip_box").attr("checked")){
	var params1 = {id : clipid, clip : {note : [{text : text}]}};
	App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
      }
    },
    clearAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultText ? "" :
      $(e.currentTarget).val() );
    },
    textBlur:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultText :
      $(e.currentTarget).val() );
    },
    cancelAction:function(e){
      App.vent.trigger("app.clipapp.recommend:@close");
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


  var Recommend = {};
  var mid,defaultText = "说点啥吧～";

  Recommend.show = function(cid,model_id){
    mid = model_id;
    var recommModel = new RecommModel({clipid:cid});
    var recommView=new RecommView({model:recommModel});
    App.popRegion.show(recommView);
    $(".small_pop").css("top", App.util.getPopTop("small"));
  };

  Recommend.close = function(){
    App.popRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.recommend:@lookup",function(params,owner_id){
    var collection = new NameList({});
    collection.fetch({data:params});
    collection.onReset(function(list){
      var ownmodel=list.get(owner_id);//过滤掉clip的所有者
      list.remove(ownmodel);
      var namelistView = new NameListCollectionView({
	collection:list
      });
      Recommend.nameListRegion = new App.Region({
	el:"#name_listDiv"
      });
      Recommend.nameListRegion.show(namelistView);
      var div=$(".action-info");
      if(div.length != 0){
	$(".name_list").show();
      }else{
	$(".name_list").hide();
      }
    });
  });

  App.vent.bind("app.clipapp.recommend:@close",function(){
    Recommend.close();
  });


  return Recommend;

})(App,Backbone,jQuery);

