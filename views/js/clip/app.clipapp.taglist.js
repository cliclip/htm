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
      if (id)
        var tag=document.getElementById(id).innerHTML;
        App.vent.trigger("app.clipapp.taglist:gettag",tag);
        App.vent.trigger("app.clipapp.taglist:@close");
    },
    MouseOver:function(e){
      $(e.currentTarget).css("background-color","#888");
    },
    MouseOut:function(e){
       $(e.currentTarget).css("background-color","");
    }
  });


  var TagList = {};
  var Region ;
  TagList.show = function(region,tags,str){
    TagList.tagListRegion = new App.Region({el:".taglistDiv"});
    var len = str.length;
    var obj_tags = [];
    var obj_tag = _.difference(TagList.myTag,tags);
    if(str){
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
    //region.show(view);
  };

  App.vent.bind("app.clipapp.bubb:mytag",function(tags){
    TagList.myTag  = _.difference(tags,App.util.getBubbs());
  });

  App.vent.bind("app.clipapp.taglist:show",function(region,tags,str){
    TagList.show(region,tags,str);
  });
  App.vent.bind("app.clipapp.taglist:@close",function(){
    if(TagList.tagListRegion){
      TagList.tagListRegion.close();
    }
  });

  App.bind("initialize:after", function(){
    if(App.util.getMyUid()){
       var tagModel =  new TagListModel({id:App.util.getMyUid()});
       tagModel.fetch();
       tagModel.onChange(function(model){
	 TagList.myTag = _.difference(model.get("tag"),App.util.getBubbs());
       });
    }
  });

  return TagList;
})(App,Backbone,jQuery);