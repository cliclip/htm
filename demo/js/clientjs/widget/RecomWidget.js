RecomWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "RecomWidget";
  this.currentUrl ="";
  this.currentStart = 0;
  this.currentEnd = 9;
  var recomWidget = this;
  var count = 1;
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      location.href="#user/1/recomm/0..9";
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
      var list = [{}];
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
	list[i]={};
	list[i].clip = collection[i];
	list[i].uid = 2;
	list[i].text = "这篇不错，你也看看……";
	list[i].date = "2012-02-24T03:48:55.658Z";
	var template = _.template($("#recommend_template").html(),{recomm:list[i]});
	this.el.append(template);
	//向此view 中添加一个view 用来显示用户名以及头像
      	var friendview = new FriendWidget(this.el,{});
	var clipview = new RecomClipWidget(this.el,list[i].clip);
	//clipview.initialize(list[i].clip);
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
      recomWidget.currentStart = parseInt(recomWidget.currentStart) + 10;
      recomWidget.currentEnd = parseInt(recomWidget.currentEnd) + 10;
      recomWidget.parentApp.lazyLoadRecom(recomWidget.currentUrl,recomWidget.currentStart, recomWidget.currentEnd);
    }
  });
  this.view = new _view();
};
RecomWidget.prototype.initialize = function(){
  this.view.initialize();
};
RecomWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.recomWidget = null;
};
RecomWidget.prototype.render = function(options){
  this.view.render(options);
};
RecomWidget.prototype.loadPreviewRecomList = function(previewList){
  this.view.clear();
  this.view.previewList = previewList;
  this.render();
};
RecomWidget.prototype.addPreviewRecomList = function(addPreviewList){
  this.render(addPreviewList);
};



RecomClipWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "RecomClipWidget";
  var recomWidget = this;
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      var view = this;
      this.render(options);
    },
    render:function(clip){
      var collection;
      if(clip){
	collection = clip;
      }else{

      };
      var template = _.template($("#clipPreview_template").html(),collection);
      this.el.append(template);
      //向此view 中添加一个view 用来显示用户名以及头像
      var friendview = new FriendWidget(this.el,{});
    },
    events:{
      //"scroll" : "scrollMore"
    }
  });
  this.view = new _view();
};
RecomClipWidget.prototype.initialize = function(clip){
  this.view.initialize(clip);
};
RecomClipWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.recomClipWidget = null;
};
RecomClipWidget.prototype.render = function(options){
  this.view.render(options);
};
