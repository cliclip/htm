ClipDetailWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){

		},
		render:function(_model){
			var model;
			if(_model){
				model = _model.toJSON();
			}else{
				model = this.model.toJSON();
			}
			var template = _.template($("#detail_template").html(),model);
			this.el.append(template);
		},
		animateIn:function(){
			view = this;
			this.el.children(".content-container").animate({"width":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.render();
				//view.el.animate({"opacity":1,"width":600},"slow","swing");
				view.el.children(".detail-container").animate({"opacity":1,"width":600},"slow","swing");
			});
		},
		animateOut:function(){
			view = this;
			this.el.children(".detail-container").animate({"width":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.el.children(".content-container").css("display","");
				view.el.children(".content-container").animate({"opacity":1,"width":600},"slow","swing");
			});
		},
		events:{
			
		}
	})
	this.view = new _view();
}
ClipDetailWidget.prototype.render = function(options){
	this.view.render(options);
}
ClipDetailWidget.prototype.loadDetail = function(id,model){
	this.view.el = $("#container_"+id);
	this.view.model = model;
	this.view.animateIn();
}
ClipDetailWidget.prototype.cancelDetail = function(id){
	this.view.el = $("#container_"+id);
	this.view.animateOut();
}