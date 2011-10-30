ClipWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			this.el.empty();
			this.iniClipList();
			this.render();
		},
		render:function(renderList){
			var collection;
			if(renderList){
				collection = renderList.toJSON();
			}else{
				collection = this.previewList.toJSON();
			}
			for(var i=0;i<collection.length;i++){
				var template = _.template($("#clipPreview_template").html(),collection[i]);
				this.el.append(template);
			}
		},
		clear:function(){
			this.previewList = null;
			this.el.empty();
		},
		events:{
			
		},
		iniClipList:function(){
			view = this;
			this.previewList = new PreviewList();
			this.previewList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/all";
			this.previewList.fetch({
				success:function(collection,resp){
					if(resp[0] == 0){
						view.render();
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		}
	})
	this.view = new _view();
}
ClipWidget.prototype.render = function(options){
	this.view.render(options);
}
ClipWidget.prototype.loadPreviewClipList = function(previewList){
	this.view.clear();
	this.view.previewList = previewList;
	this.render();
}
ClipWidget.prototype.addPreviewClipList = function(addPreviewList){
	this.render(addPreviewList);
}