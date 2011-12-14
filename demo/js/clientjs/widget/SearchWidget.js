SearchWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	this.widgetType = "SearchWidget";
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
		
		},
		render:function(){
		
		},
		events:{
			"change #keyword":"queryByKeyword"
		},
		queryByKeyword:function(){
			var keyword = $("#keyword").val();
			location.href = "#/search/word/"+keyword;
		}
	})
	this.view = new _view();
}
SearchWidget.prototype.initialize = function(){
	this.view.initialize();
}
SearchWidget.prototype.terminalize = function(){
	this.parentApp.removeChild(this);
	this.parentApp.searchWidget = null;
}
SearchWidget.prototype.render = function(){
	this.view.render();
}