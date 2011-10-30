SearchWidget = function(_container,options){
	this.container = _container;
	this.options = options;
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
			keyword = $("#keyword").val();
			location.href = "#/search/word/"+keyword;
		}
	})
	this.view = new _view();
}
SearchWidget.prototype.render = function(){
	this.view.render();
}