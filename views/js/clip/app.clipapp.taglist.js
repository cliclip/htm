App.ClipApp.TagList=(function(App,Backbone,$){

  var TagList = {};
  var TagListModel = App.Model.extend({
    url : function(){
      return  App.ClipApp.Url.base+"/user/"+this.id+"/meta/0..19";
    },
    defaults : {
      taglist : []
    }
  });

  var TagListView=App.ItemView.extend({
    tagName:"div",
    className:"taglist-view",
    template:"#taglist-view-template",
    events:{
      "click .li-list"          :  "getTagAction",
      "mouseover .li-list"      :  "MouseOver",
      "mouseout  .li-list"      :  "MouseOut"
    },
    getTagAction:function(e){
      var id=e.target.id;
      var tag=document.getElementById(id).innerHTML;
      App.vent.trigger("app.clipapp.taglist:gettag",tag);
    },
    MouseOver:function(e){
      var div = $(".taglistDiv").children().children();
      _(div).each(function(e){
	$(e).css("background-color","");
      });
      $(e.currentTarget).css("background-color","#888");
    },
    MouseOut:function(e){
      $(e.currentTarget).css("background-color","");
    }
  });

  var bubs = App.ClipApp.getDefaultBubbs();
  var baseTag = getDefaultTags();


  function getDefaultTags(){
    var lang = App.versions.getLanguage(); // 用户语言设置
    if(lang == "en"){
      return ["music","novel","film","technology","handy"];
    }else{
      return ["音乐", "小说", "电影", "港台","牛叉", "技术", "好用"];
    }
  };

  function setbaseTag(tags){
    baseTag = _.difference(_.union(tags,baseTag), bubs);
  };

  function resetBase(){
    var my = App.ClipApp.getMyUid();
    if(my){
      var tagModel =  new TagListModel({id: my});
      tagModel.fetch();
      tagModel.onChange(function(model){
	baseTag = _.difference(_.union(model.get("tag"), baseTag), bubs);
      });
    }
  };

  App.vent.bind("app.tagsinput:taglist",function(str){
    TagList.tagListRegion = new App.Region({el:".taglistDiv"});
    var myTags = [];
    var tags = _.compact($("#obj_tag").val().split(","));
    var obj_tag = _.difference(baseTag, tags);
    if(str){
      var len = str.length;
      _(obj_tag).each(function(tag){
	if(tag.substring(0,len) == str){
	  myTags.push(tag);
	}
      });
    }else{
      myTags = obj_tag;
    }
    var model = new TagListModel({taglist:myTags});
    var view = new TagListView({model:model});
    TagList.tagListRegion.show(view);
  });

  App.vent.bind("app.clipapp.taglist:close",function(){
    if(TagList.tagListRegion){
      TagList.tagListRegion.close();
    }
  });

  App.vent.bind("app.clipapp.clipadd:success", function(addmodel){
    setbaseTag(addmodel.get("tag"));
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    resetBase();
  });

  App.vent.bind("app.clipapp.login:success", function(){
    resetBase();
  });

  App.vent.bind("app.clipapp.clipmemo:success", function(){
    resetBase();
  });

  App.vent.bind("app.clipapp.recliptag:success", function(tag){
    setbaseTag(args.tag);
  });

  App.vent.bind("app.clipapp.reclip:success", function(args){
    setbaseTag(args.tag);
  });

  App.bind("initialize:after", function(){
    resetBase();
  });

  return TagList;
})(App,Backbone,jQuery);