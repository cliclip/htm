App.ClipApp.TagList=(function(App,Backbone,$){

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
      "mouseout  .li-list"       :  "MouseOut"
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


  var TagList = {};
  var myTag = App.util.getObjTags();
  TagList.myTag = myTag;
  TagList.show = function(tags,str){
    TagList.tagListRegion = new App.Region({el:".taglistDiv"});
    var obj_tags = [];
    var obj_tag = _.difference(TagList.myTag,tags);
    if(str){
      var len = str.length;
      _(obj_tag).each(function(tag){
	if(tag.substring(0,len) == str){
	  obj_tags.push(tag);
	}
      });
    }else{
      obj_tags = obj_tag;
    }
    var model = new TagListModel({taglist:obj_tags});
    var view = new TagListView({model:model});
    TagList.tagListRegion.show(view);
  };

  App.vent.bind("app.clipapp.bubb:mytag",function(tags){
    TagList.myTag  = _.difference(_.union(tags,myTag),App.util.getBubbs());
  });

  App.vent.bind("app.tagsinput:taglist",function(str){
    var obj_tag = _.compact($("#obj_tag").val().split(","));
    TagList.show(obj_tag,str);
  });

  App.vent.bind("app.clipapp.taglist:close",function(){
    if(TagList.tagListRegion){
      TagList.tagListRegion.close();
    }
  });

  App.vent.bind("app.clipapp.taglist:taglistRefresh",function(tags){
    if(tags){
      TagList.myTag  = _.difference(_.union(tags,TagList.myTag),App.util.getBubbs());
    }
  });

  App.bind("initialize:after", function(){
    if(App.util.getMyUid()){
      var tagModel =  new TagListModel({id:App.util.getMyUid()});
      tagModel.fetch();
      tagModel.onChange(function(model){
	TagList.myTag = _.difference(_.union(model.get("tag"),TagList.myTag),App.util.getBubbs());
      });
    }
  });

  return TagList;
})(App,Backbone,jQuery);