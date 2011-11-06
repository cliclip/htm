SortMetaWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){
			this.el.empty();	
			this.render();
		},
		render:function(){
			var allBtn = $("<div><span><a href='#/list/all'>全部</a></span></div>");
			allBtn.children("span").css("background-color","#cccccc");
			this.el.append(allBtn);
			this.reasonRender();
		},
		renderSort:function(collection,_title){
			if(!collection || !_title)
				return;
			var Template = _.template(
				$("#sort_template").html(),
				{title:_title,
				 url:collection.pluck("url"),
				 content:collection.pluck("content")
				});
			this.el.append(Template);
			var filterLinkColor =["#E73821","#188ECE","#EF2863","#FFEB08","#63BE10","#C6EF21","#FFC773","#F76984","#A5CF31"];
			$("span.filter-link").corner().each(function(index){
				$(this).css("background-color",filterLinkColor[index % 9]);
			});
		},
		reasonRender:function(){
			view = this;
			this.reasonList = new MetaList();
			this.reasonList.type = "reason";
			this.reasonList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/reason";
			this.reasonList.fetch({
				success:function(collection,resp){
					if(resp[0] == 0){
						view.renderSort(collection,"原因");
						view.purposeRender();
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		},
		purposeRender:function(){
			view = this;
			this.purposeList = new MetaList();
			this.purposeList.type = "purpose";
			this.purposeList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/purpose";
			this.purposeList.fetch({
				success:function(collection,resp){
					if(resp[0] == 0){
						view.renderSort(collection,"目的");
						view.deviceRender();
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		},
		deviceRender:function(){
			view = this;
			this.deviceList = new MetaList();
			this.deviceList.type = "device";
			this.deviceList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/device";
			this.deviceList.fetch({
				success:function(collection,resp){
					if(resp[0] == 0){
						view.renderSort(collection,"设备");
						view.cityRender();
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		},
		cityRender:function(){
			view = this;
			this.cityList = new MetaList();
			this.cityList.type = "city";
			this.cityList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/city";
			this.cityList.fetch({
				success:function(collection,resp){
					if(resp[0] == 0){
						view.renderSort(collection,"城市");
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		},
		events:{
			
		}
	})
	this.view = new _view();
}
SortMetaWidget.prototype.render = function(){
	this.view.render();
}