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

  var TagList = {};
  var bubs = App.util.getBubbs();
  var baseTag = App.util.getObjTags();

  TagList.show = function(str){
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
  };

  TagList.setbaseTag = function(tags){
    baseTag = _.difference(_.union(tags,baseTag), bubs);
  };

  TagList.close = function(){
    if(TagList.tagListRegion){
      TagList.tagListRegion.close();
    }
  };


  App.bind("initialize:after", function(){
    var my = App.util.getMyUid();
    if(my){
      var tagModel =  new TagListModel({id: my});
      tagModel.fetch();
      tagModel.onChange(function(model){
	baseTag = _.difference(_.union(model.get("tag"), baseTag), bubs);
      });
    }
  });

  return TagList;
})(App,Backbone,jQuery);