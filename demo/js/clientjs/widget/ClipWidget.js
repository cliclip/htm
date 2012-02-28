ClipWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "ClipWidget";
  this.currentUrl ="";
  this.currentStart = 0;
  this.currentEnd = 9;
  var clipWidget = this;
  var count = 1;
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      //this.el.empty();
      //this.iniClipList();
      //this.render();
      location.href="#user/1/clip/0..9";
      var view = this;
      //事件的绑定，当滚动条发生变化时触发
      $(document).scroll(function(evt){
	var scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
	if(view.el[0].scrollHeight > 0 && (view.el[0].scrollHeight - scrollTop)<500){
	  view.lazyLoad();
	}
      });
    },
    render:function(renderList){
      var collection;
      if(renderList){
	collection = renderList.toJSON();
      }else{
	collection = this.previewList.toJSON();
      }
      for(var i=0;i<collection.length;i++){
	var pattern = /^[a-z0-9]{32}/;
	if(collection[i].content.image && pattern.test(collection[i].content.image)){
	  collection[i].content.image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "user/1/image/"+collection[i].content.image ;
	}
	//为collection绑定临时数据
	collection[i].reply_count = 10;
	collection[i].reprint_count = 20;
	var template = _.template($("#clipPreview_template").html(),collection[i]);
	this.el.append(template);
	//向此view 中添加一个view 用来显示用户名以及头像
      	var subwidget = new FriendWidget(this.el,{i:count++});
      }
    },
    clear:function(){
      this.previewList = null;
      this.el.empty();
    },
    events:{
      //"scroll" : "scrollMore"
    },
    lazyLoad:function(){
      clipWidget.currentStart = parseInt(clipWidget.currentStart) + 10;
      clipWidget.currentEnd = parseInt(clipWidget.currentEnd) + 10;
      clipWidget.parentApp.lazyLoad(clipWidget.currentUrl,clipWidget.currentStart, clipWidget.currentEnd);
    }
  });
  this.view = new _view();
};
ClipWidget.prototype.initialize = function(){
  this.view.initialize();
};
ClipWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.clipWidget = null;
};
ClipWidget.prototype.render = function(options){
  this.view.render(options);
};
ClipWidget.prototype.loadPreviewClipList = function(previewList){
  this.view.clear();
  this.view.previewList = previewList;
  this.render(previewList);
};
ClipWidget.prototype.addPreviewClipList = function(addPreviewList){
  this.render(addPreviewList);
};
