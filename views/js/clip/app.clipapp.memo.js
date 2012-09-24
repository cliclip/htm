//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){

  var MemoModel = App.Model.extend({});
  var P = App.ClipApp.Url.base;
  // 把没有必要的事件改为函数调用
  /*
   * 使用事件的场景：
   * 1，与自己以外的其他部分通讯，不要打破包装原则
   * 2，需要多于一个以上的处理
   * 3，在 view 里，与 view 之外的部分通讯，比如，需要知道 region （1的延伸）
   */
  var MemoView=App.DialogView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .size48"          :"tagToggle",
      //"keydown #organize_text" :"shortcut_ok",
      //"focus #organize_text"   :"noteFocus",
      //"blur #organize_text"    :"noteBlur",
      "click #organize_button" :"okClick",
      "click #cancel_button"   :"cancelClick",
      "click .masker"          :"masker", // 点击detail下的层，便隐藏
      "click .close_w"         :"cancelClick"
    },
    initialize:function(){
      this.bind("@ok", ok);
      this.bind("@closeView", close);
    },
    tagToggle:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    /*noteFocus:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultNote ? "" :
      $(e.currentTarget).val() );
    },
    noteBlur:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultNote :
      $(e.currentTarget).val() );
    },*/
    okClick:function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var data = loadData(this.$el);
      // clip在update时需要clip的id
      // data["id"] = this.model.id;
      if($(".error").length == 0){
	this.trigger("@ok", data, this.model.id);
      }else{
	$(e.currentTarget).attr("disabled",false);
      }
    },
    shortcut_ok : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#organize_button").click();
	return false;
      }else{
	return true;
      }
    },
    masker:function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelClick(e);
      }
    },
    cancelClick:function(e){
      e.preventDefault();
      var n_data = loadData(this.$el);
      this.trigger("@closeView",n_data);
    }
  });

  function loadData(el){
    var _data = {};
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i, el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i, el).html()));
      }
    };
    var obj_tag = $("#obj_tag", el).val().split(",");
    _data.tag = _.compact(_.union(main_tag,obj_tag));

    /* 注释的note部分
    var text = ""; //过滤defaultNote默认值
    if($.trim($("#organize_text", el).val())!=defaultNote){
      text = $.trim($("#organize_text", el).val());
    }
    _data.note = [{text: text}];
    */
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
    var bubs = App.ClipApp.getDefaultBubbs();
    //var note = clip.note?clip.note:"";
    //var text = "";
    tags = _(tags).map(function(e){return e.toLocaleLowerCase();});
    /*
    if(!_.isEmpty(note)){
      var _ns = _(note).select(function(e){return e.text; });
      if(!_.isEmpty(_ns)){
	var ns = _(_ns).map(function(e){ return e.text; });
	_(ns).each(function(n){ text += n+" "; });
      }
    }
    */
    o_data = {tag:tags,"public":pub};
    var tag_main = _(_(bubs).map(function(e){
      return { tag:e, checked:(_.indexOf(tags,e) != -1) };
    })).value();
    var tag_obj = _.difference(tags, bubs);
    return {id:id,main_tag:tag_main,obj_tag:tag_obj,pub:pub};
  };

  // 触发更新clip中的注的事件
  var ok = function(data, cid){
    if(memoType == "update"){
      var model = new MemoModel(data);
      model.save({}, {
	type:'PUT',
	url: App.ClipApp.encodeURI(P+"/clip/"+cid),
	success: function(model, res){
	  ClipMemo.close();
	  App.vent.trigger("app.clipapp.clipmemo:success", model, cid);
	},
	error:function(model,res){}
      });
    }else if(memoType == "add"){
      ClipMemo.close();
      App.vent.trigger("app.clipapp.clipadd:memo", data);
    }
  };

  var close = function(n_data){
    ClipMemo.close(n_data);
  };

  var ClipMemo = {};
  var memoType,defaultNote = _i18n('clipmemo.memo'),o_data;
  function showMemo(data){
    var memoModel = new MemoModel(data);//此model作显示用
    var memoView = new MemoView({model:memoModel});
    App.popRegion.show(memoView);
    $('#obj_tag').tagsInput({});
  }

  // 此处只有区分 update 和 add
  ClipMemo.show = function(args){
    memoType = _.isObject(args) ? "add" : "update";
    if(memoType == "update"){
      var cid = args;
      var detailModel = new App.Model.DetailModel({id:cid});
      detailModel.fetch({
	success:function(model,res){
	  var data = getData(model.toJSON());// 从detail中取得的model
	  //console.log(data);
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

  ClipMemo.close=function(n_data){
    var flag = true;
    if(!n_data){
      App.popRegion.close();
    }else{
      if(o_data['public'] != 'false'){
	o_data['public'] = 'true';
      }
      //flag = flag && ($.trim(o_data.note)==$.trim(n_data.note[0].text));
      flag = flag && n_data.tag.length==o_data.tag.length && _.difference(n_data.tag,o_data.tag).length==0;
      flag = flag && n_data['public'] == o_data['public'];
      if(flag){
	App.popRegion.close();
      }else{
	App.ClipApp.showAlert("memo_save", null, function(){
	  App.popRegion.close();
	});
      }
    }
  };

  // TEST
  // App.bind("initialize:after", function(){ ClipMemo.show(); });
  return ClipMemo;
})(App,Backbone,jQuery);