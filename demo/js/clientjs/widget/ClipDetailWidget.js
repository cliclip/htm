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
			
			for(var i=0;i<model.content.length;i++){
				if(model.content[i].image && !isNaN(model.content[i].image))
					model.content[i].image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name+"/image/"+model.content[i].image;
			}
			var template = _.template($("#detail_template").html(),model);
			this.el.append(template);
		},
		animateIn:function(){
			view = this;
			this.el.children(".preview-item").animate({"height":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.render();
				var h = view.el.children(".detail-container")[0].scrollHeight;
				view.el.children(".detail-container").animate({"height":h,"opacity":1},"slow","swing",function(){
					var hh = $(this)[0].scrollHeight;
					if(h < hh);
						$(this).animate({height:hh},"slow","swing");
				});

			});
			
		},
		animateOut:function(){
			view = this;
			this.el.children(".detail-container").animate({"height":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.el.children(".detail-container").remove();
				view.el.children(".preview-item").css("display","");
				var h = view.el.children(".preview-item")[0].scrollHeight;
				view.el.children(".preview-item").animate({"opacity":1,"height":h},"slow","swing");
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