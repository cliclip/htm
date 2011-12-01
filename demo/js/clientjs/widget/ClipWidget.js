ClipWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	this.currentUrl ="";
	this.currentPage = 1;
	var clipWidget = this;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			//this.el.empty();
			//this.iniClipList();
			//this.render();
			location.href="#/clip/all/p1";
			 var view = this;
			$(document).scroll(function(evt){
				if(view.el[0].scrollHeight > 0 && (view.el[0].scrollHeight - document.body.scrollTop)<500){
					view.lazyLoad();
				}
			})
		},
		render:function(renderList){
			var collection;
			if(renderList){
				collection = renderList.toJSON();
			}else{
				collection = this.previewList.toJSON();
			}
			for(var i=0;i<collection.length;i++){
				if(collection[i].content.image){
					if(!isNaN(collection[i].content.image))
						//collection[i].content.image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name+"/image/"+collection[i].content.image+"/128";
						collection[i].content.image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name+"/image/"+collection[i].content.image;
				}
				var template = _.template($("#clipPreview_template").html(),collection[i]);
				this.el.append(template);
			}
		},
		clear:function(){
			this.previewList = null;
			this.el.empty();
		},
		events:{
			//"scroll" : "scrollMore"
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
		},
		lazyLoad:function(){
			console.info(clipWidget.currentUrl);
			console.info(clipWidget.currentPage);
			clipWidget.currentPage = parseInt(clipWidget.currentPage) + 1;
			clipWidget.parentApp.lazyLoad(clipWidget.currentUrl,clipWidget.currentPage);
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