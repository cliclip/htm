//app.Recommapp.js

App.ClipApp.Recommend = (function(App,Backbone,$){
  // 用来列出可以转给那些用户
  var P = App.ClipApp.Url.base;
  var that;
  var uid = null; // 被推荐用户的id标识
  var NameListModel=App.Model.extend({});
  var NameList=App.Collection.extend({
    model : NameListModel,
    url   : App.ClipApp.Url.base+"/lookup/0..5"
  });

  var RecommModel = App.Model.extend({
    url:function(){
      return P+"/user/"+uid+"/recomm";
    },
    initialize:function(){
      uid = null;
    }
  });

  var RecommView = App.ItemView.extend({
    tagName:"div",
    className:"",
    template:"#recommend-view-template",
    events:{
      "click .user" : "getUserAction",
      "input #recomm_name"   : "nameListAction",
      //ie-7 8 input事件相当于focus事件，在输入文字过程中不会重复触发
      "click #recomm_name"   : "nameListAction",
      "focus #recomm_name"   : "nameListShow",
      "blur #recomm_name"    : "nameBlur",
      "keydown #recomm_name": "selectAction",
      "mouseover .user"      :  "MouseOver",
      "mouseout .user"       :  "MouseOut",
      "focus #recomm_text":  "clearAction",
      "blur  #recomm_text":  "textBlur",
      "click #submit"        :  "recommendAction",
      "click #cancel"        :  "cancelAction",
      "click .close_w"       :  "cancelAction"
    },
    initialize:function(){
      that = this;
      this.tmpmodel= new RecommModel();
      setTimeout(function(){
	this.$("#recomm_name").focus();
      },500);
    },
    getUserAction:function(e){
      $("#imgId").css("display","none");
      var face = $(e.currentTarget)[0].children[0].children[0].src;
      var name = $($(e.currentTarget)[0].children[1]).text();
      uid =  $(e.currentTarget)[0].children[1].id.split("_")[1];
      this.$("#recomm_name").val(name);
      this.$("#imgId").attr("src",face);
      this.$("#imgId").css("display","block");
    },
    nameListAction:function(evt){
      this.$("#imgId").css("display","none");
      var str = $.trim(this.$("#recomm_name").val());
      var clip_owner = this.model.get("clipid").split(":")[0];//clip的拥有者
      var params = {q:str};
      //查询friend
      App.vent.trigger("app.clipapp.recommend:@lookup",params,clip_owner);
    },
    nameBlur:function(){
      var view = this;
      setTimeout(function(){
	var data = view.getInput();
	if(!data.name || data.name == ""){
	  view.showError('recommend',{"recomm_name":"is_null"});
	}else{
	  var div=$(".action-info");
	  if(div.length != 0){
	    $("#imgId").css("display","none");
	    _.each(div,function(e){
	      var li = e.children;
	      if(data.name == $(li[1]).text()){
		uid = li[1].id.split("_")[1];
		// this.$("#recomm_name").val($(li[1]).text());
		this.$("#imgId").attr("src",li[0].children[0].src);
		this.$("#imgId").css("display","block");
	      }
	    });
	    this.$(".list").remove();
	  }
	  if(!uid){
	    view.showError('recommend',{"recomm_name":"not_exist"});
	  }
	}
	$(".name_list").hide();
      },200);
    },
    selectAction:function(event){
      if(event.keyCode == 40){ // DOWN
	var flag = true;
	var div = $("#name_listDiv").children().children();
	for(var i=0;i<div.length;i++){
	  if(flag && $(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	    $(div[i]).css("background-color","");
	    $(div[i+1]).css("background-color","#888");
	    $("#recomm_name").val($.trim($(div[i+1]).text()));
	    flag = false;
	  }
	}
	if(flag){
	  $(div[0]).css("background-color","#888");
	  $("#recomm_name").val($.trim($(div[0]).text()));
	}
      }else if(event.keyCode == 38){ // UP
	var flag = true;
	var div = $("#name_listDiv").children().children();
	for(var i=0;i<div.length;i++){
	  if(flag && $(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	    $(div[i]).css("background-color","");
	    $(div[i-1]).css("background-color","#888");
	    $("#recomm_name").val($.trim($(div[i-1]).text()));
	    flag = false;
	  }
	}
	if(flag){
	  $(div[div.length-1]).css("background-color","#888");
	  $("#recomm_name").val($.trim($(div[length-1]).text()));
	}
      }else if(event.keyCode == 13){ // enter
	var div = $("#name_listDiv").children().children();
	for(var i=0;i<div.length;i++){
	  if($(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	    $("#recomm_name").val($.trim($(div[i]).text()));
	    $("#recomm_text").focus();
	    return false;
	  }
	}
      }
    },
    nameListShow:function(e){
      uid = null;
      this.cleanError(e);
      $("#submit").attr("disabled",false);
      var div=$(".action-info");
      if(div.length != 0){
	$(".name_list").show();
      }else{
	$(".name_list").hide();
      }
    },
    MouseOver:function(e){
      var div = $("#name_listDiv").children().children();
      for(var i=0;i<div.length;i++){
	if($(div[i]).css("background-color") ==
	"rgb(136, 136, 136)"){
	  $(div[i]).css("background-color","");
	}
      }
      $(e.currentTarget).css("background-color","#888");
    },
    MouseOut:function(e){
       $(e.currentTarget).css("background-color","");
    },
    recommendAction:function(e){
      // 在点击转确定按钮时，model.id model.name都已经设置成功
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var view = this;
      setTimeout(function(){
	var clipid = view.model.get("clipid");
	var data = view.getInput();
	if(data.text == defaultText){data.text = "";}
	view.setModel('recommend',view.tmpmodel, {text: data.text, clipid: clipid});
	//recommend 需要的参数
	view.tmpmodel.save({},{
	  success:function(model,res){
	    Recommend.close();
	    App.vent.trigger("app.clipapp.message:success","recomm");
	  },
	  error:function(model,res){
	    view.showError('recommend',res);
	  }
	});
	//reclip 需要的参数
	if($("#reclip_box").attr("checked")){
	  var params1 = {id : clipid, clip : {note : [{text : data.text}]}};
	  App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
	}
      }, 300);
    },
    clearAction:function(e){
      this.cleanError(e);
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultText ? "" :
      $(e.currentTarget).val() );
    },
    textBlur:function(e){
      var view = this;
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultText :
      $(e.currentTarget).val() );
      var data = view.getInput();
      view.setModel('recommend',view.tmpmodel, {text: data.text});
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

  Recommend.show = function(cid,model_id,pub){
    var recommModel = new RecommModel({clipid:cid});
    var recommView=new RecommView({model:recommModel});
    //clip的拥有者
    var clip_owner = that.model.get("clipid").split(":")[0];
    if(pub == "false" && !App.util.self(clip_owner)){
      // 是非public并且不是clip_owner进行的操作
      App.vent.trigger("app.clipapp.message:chinese", {recommend: "no_pub"});
    }else{
      mid = model_id;
      App.popRegion.show(recommView);
      $(".small_pop").css("top", App.util.getPopTop("small"));
      //ie浏览器 input 事件存在bug 为元素绑定onpropertychange事件
      if(/msie/i.test(navigator.userAgent)){
	function nameListAction(evt){
	  that.$("#imgId").css("display","none");
	  var str = $.trim(that.$("#recomm_name").val());
	  var params = {q:str};
	  //查询friend
	  App.vent.trigger("app.clipapp.recommend:@lookup",params,clip_owner);
	}
	document.getElementById('recomm_name').onpropertychange=nameListAction;
      }
    }
  };

  Recommend.close = function(){
    App.popRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.recommend:@lookup",function(params,owner_id){
    var collection = new NameList();
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

  App.bind("initialize:after", function(){
  });


  return Recommend;

})(App,Backbone,jQuery);

