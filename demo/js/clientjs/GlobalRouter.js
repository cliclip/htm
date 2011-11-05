/**
 * GlobalRouter
 * This Class dominates the global path and location 
 */
GlobalRouter = function(parentApp,options){
	this.parentApp = parentApp;
	this.options = options;
	_router = Backbone.Router.extend({
		routes:{
			"/list/all":"restoreAll",
		
			"/sort/reason/:param/p:page" : "sortByReason",
			"/sort/purpose/:param/p:page" : "sortByPurpose",
			"/sort/device/:param/p:page" : "sortByDevice",
			"/sort/city/:param/p:page" : "sortByCity",
			
			"/detail/:id" : "detailById",
			"/detailback/:id" : "detailBack",
			
			"/search/word/:keyword" : "queryByWord",
			"/search/date/:fdate/:tdate" : "queryByDate",
			"/search/time/:ftime/:ttime" : "queryByTime",
			"/search/reason/:reason1/:reason2" : "queryByReason",
			"/search/purpose/:purpose1/:purpose2" : "queryByPurpose",
			"/search/device/:device1/:device2" : "queryByDevice",
			"/search/city/:city1/:city2" : "queryByDevice"
		},
		restoreAll:function(){
			url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/all";
			this.listByImpl(url,1);
		},
		sortByReason:function(param,page){
			var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/reason/"+param+"/p"+page;
			this.listByImpl(url,page);
		},
		sortByPurpose:function(param,page){
			var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/purpose/"+param+"/p"+page;
			this.listByImpl(url,page);
		},
		sortByDevice:function(param,page){
			var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/device/"+param+"/p"+page;
			this.listByImpl(url,page);
		},
		sortByCity:function(param,page){
			var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/city/"+param+"/p"+page;
			this.listByImpl(url,page);
		},
		listByImpl:function(_url,page){
			var previewClipList = new PreviewList();
			previewClipList.url = _url;
			previewClipList.fetch({
				success:function(collection,resp){
					if(resp[0] == 0){
						if(page != 1)
							parentApp.view.clipWidget.addPreviewClipList(collection);
						else
							parentApp.view.clipWidget.loadPreviewClipList(collection);
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		},
		detailById:function(id){
			var clipDetail = new ClipDetail();
			clipDetail.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/"+id;
			clipDetail.fetch({
				success:function(model,resp){
					if(resp[0] == 0){
						parentApp.view.clipDetailWidget.loadDetail(id,model);
					}else{
						//server response exception
					}
				},
				error:function(collection,resp){
					//client request error
				}
			});
		},	
		detailBack:function(id){
			parentApp.view.clipDetailWidget.cancelDetail(id);
		},
		queryByWord:function(keyword){
			params = {
				word : keyword
			};
			this.queryImpl(params);
		},
		queryByDate:function(fdate,tdate){
			params = {
				date : [fdate,tdate]
			};
			this.queryImpl(params);
		},
		queryByTime:function(ftime,ttime){
			params = {
				time : [ftime,ttime]
			};
			this.queryImpl(params);
		},
		queryByReason:function(reason1,reason2){
			params = {
				reason : [reason1,reason2]
			};
			this.queryImpl(params);
		},
		queryByPurpose:function(purpose1,purpose2){
			params = {
				purpose : [purpose1,purpose2]
			};
			this.queryImpl(params);
		},
		queryByDevice:function(device1,device2){
			params = {
				device : [device1,device2]
			};
			this.queryImpl(params);
		},
		queryByCity:function(city1,city2){
			params = {
				city : [city1,city2]
			};
			this.queryImpl(params);
		},
		queryImpl:function(params){
			RequestUtil.postFunc({
				url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/query",
				data:params,
				successCallBack:function(response){
					console.info(response);
				},
				errorCallBack:function(response){
					console.info(response);
				}
			})
		}
		
	});
	this.router = new _router();
	
};
