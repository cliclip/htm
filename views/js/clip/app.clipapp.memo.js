//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){

  var MemoModel = App.Model.extend({});

  // 把没有必要的事件改为函数调用
  /*
   * 使用事件的场景：
   * 1，与自己以外的其他部分通讯，不要打破包装原则
   * 2，需要多于一个以上的处理
   * 3，在 view 里，与 view 之外的部分通讯，比如，需要知道 region （1的延伸）
   */
  var MemoView=App.ItemView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .size48"          :"tagToggle",
      "focus #organize_text"   :"noteFocus",
      "blur #organize_text"    :"noteBlur",
      "click #organize_button" :"okClick",
      "click #cancel_button"   :"cancelClick",
      "click .close_w"         :"cancelClick"
    },
    tagToggle:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    noteFocus:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultNote ? "" :
      $(e.currentTarget).val() );
    },
    noteBlur:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultNote :
      $(e.currentTarget).val() );
    },
    okClick:function(e){
      e.preventDefault();
      var data = loadData(this.$el);
      // clip在update时需要clip的id
      data["id"] = this.model.id;
      App.vent.trigger("app.clipapp.memo:@ok", data);
    },
    cancelClick:function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.memo:@close");
    }
  });

  function loadData(el){
    var main_tag = [];

    for(var i=0;i<6;i++){
      if($("#main_tag_"+i, el).attr("class") == "size48 orange_48"){
	main_tag.push($("#main_tag_"+i, el).html().trim());
      }
    };
    var obj_tag = $("#obj_tag", el).val().split(",");
    var tag_list = _.union(main_tag,obj_tag);
    tag_list = _.compact(tag_list); // 去除掉数组中的空值
    var text = "";
    if($("#organize_text", el).val().trim()!=defaultNote){//过滤defaultNote默认值
      text = $("#organize_text", el).val().trim();
    }
    var _data = {note:[{text:text}],tag:tag_list};
    if($("#memo_private", el).attr("checked")){
      _data["public"] = "false";
    }else{
      _data["public"] = "true";
    }
    return _data;
  };

  function getData(clip){
    var id = clip.id;
    var pub = clip["public"];
    var tags = clip.tag?clip.tag:[];
    var note = clip.note?clip.note:"";
    var text = "";
    //console.info(tags);
    if(!_.isEmpty(note)){
      var ns = _(note).select(function(e){return e.text; })
	.map(function(e){ return e.text; });
	_(ns).each(function(n){ text += n+" "; });
    }
    var tag_main = _(_(App.util.getBubbs()).map(function(e){
    return { tag:e, checked:(_.indexOf(tags,e) != -1) };
    })).value();
    var tag_obj = _.difference(tags,App.util.getBubbs());
    return {id:id,note:text,main_tag:tag_main,obj_tag:tag_obj,pub:pub};
  };

  var ClipMemo = {};
  var memoType,defaultNote = "备注一下吧~";
  function showMemo(data){
    var memoModel = new MemoModel(data);//此model作显示用
    var memoView = new MemoView({model:memoModel});
    App.popRegion.show(memoView);
    $('#obj_tag').tagsInput({
      //autocomplete_url:'test/fake_json_endpoint.html'
    });
  }

  // 此处只有区分 update 和 add
  ClipMemo.show = function(args){
    memoType = (_.isObject(args)) ? "add" : "update";
    if(memoType == "update"){
      var cid = args;
      var detailModel = new App.Model.DetailModel({id:cid});
      detailModel.fetch({
	success:function(model,res){
	  var data = getData(model.toJSON());// 从detail中取得的model
	  showMemo(data);
	},
	error:function(model,res){}
      });
    }else if(memoType == "add"){
      var clip = args;
      var data = getData(clip);
      // var data = getData(model.get("clip"));//从clip add 中取得的model
      showMemo(data);
    }
  };

  ClipMemo.close=function(){
    App.popRegion.close();
  };

  // 触发更新clip中的注的事件
  App.vent.bind("app.clipapp.memo:@ok", function(data){
    if(memoType == "update"){
      var model = new App.Model.DetailModel(data);
      model.save({}, {
	success: function(model, res){
	  App.vent.trigger("app.clipapp.bubb:refresh",App.util.getMyUid(),null,data.tag);
	  ClipMemo.close();
	},
	error:function(model,res){
	  App.vent.trigger("app.clipapp.memo:@error",model,res);
	}
      });
    }else if(memoType == "add"){
      App.vent.trigger("app.clipapp.clip:update", data);
      ClipMemo.close();
    }
  });

  App.vent.bind("app.clipapp.memo:@close",function(){
    ClipMemo.close();
  });

  App.vent.bind("app.clipapp.memo:@error",function(model,error){
    console.info(error);
  });

  // TEST
  // App.bind("initialize:after", function(){ ClipMemo.show(); });
  return ClipMemo;
})(App,Backbone,jQuery);