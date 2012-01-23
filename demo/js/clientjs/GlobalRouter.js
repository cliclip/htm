/**
 * GlobalRouter
 * This Class dominates the global path and location
 */
GlobalRouter = function(parentApp,options){
  this.parentApp = parentApp;
  this.options = options;
  _router = Backbone.Router.extend({
    routes:{
      "/home":"goHomePage",
      "/my/email/:address":"deleteEmail",
      "/clip/all/p:page":"restoreAll",

      "/clip/reason/:param/p:page" : "sortByReason",
      "/clip/purpose/:param/p:page" : "sortByPurpose",
      "/clip/device/:param/p:page" : "sortByDevice",
      //当device是curl/7.19.7
      // new RegExp('^/clip/device/(^\/[.*?]\/p$)/p([/d]+)$') : "sortByDevice",
      "/clip/city/:param/p:page" : "sortByCity",

      "/clip/delete/:id":"deleteClip",
      "/clip/edit/:id":"editClip",
      "/clip/add":"addClip",

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
    initialize:function(){
      // 如何传参数
      // this.route(new RegExp('^/clip/device/(^\/[.*?]\/p$)/p([/d]+)$'),"sortByDevice",this.sortByDevice(param,page));
    },
    goHomePage:function(){
      location.href = "www.clickdang.com:3000";
    },
    restoreAll:function(page){
      //url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/all";
      var url =  "my/clip/all";
      this.listByImpl(url,page);
    },
    sortByReason:function(param,page){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/reason/"+param+"/p"+page;
      var url = "my/clip/reason/"+encodeURIComponent(param);
      this.listByImpl(url,page);
    },
    sortByPurpose:function(param,page){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/purpose/"+param+"/p"+page;
      var url = "my/clip/purpose/"+encodeURIComponent(param);
      this.listByImpl(url,page);
    },
    sortByDevice:function(param,page){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/device/"+param+"/p"+page;
      var url = "my/clip/device/"+encodeURIComponent(param);
      this.listByImpl(url,page);
    },
    sortByCity:function(param,page){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/city/"+param+"/p"+page;
      var url = "my/clip/city/"+encodeURIComponent(param);
      this.listByImpl(url,page);
    },
    listByImpl:function(_url,page){
      $(".radioButtonContainer.radioButton.sortItem.active").removeClass("active");
      var previewClipList = new PreviewList();
      previewClipList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL  + _url+"/p"+page;
      previewClipList.fetch({
	success:function(collection,resp){
	  if(resp[0] == 0){
	    if(page != 1)
	      parentApp.clipWidget.addPreviewClipList(collection);
	    else{
	      parentApp.clipWidget.loadPreviewClipList(collection);
	      $("[href^='#"+_url+"']").children("div").addClass("active");
	    }
	    parentApp.clipWidget.currentUrl = _url;
	    parentApp.clipWidget.currentPage = page;
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
      clipDetail.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/clip/"+id;
      clipDetail.fetch({
	success:function(model,resp){
	  if(resp[0] == 0){
	    console.info(model);
	    parentApp.clipDetailWidget.loadDetail(id,model);
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
      parentApp.clipDetailWidget.cancelDetail(id);
    },
    deleteClip:function(id){
      RequestUtil.deleteFunc({
	url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/clip/"+id,
	//data:params,
	successCallBack:function(response){
	  if(response[0] == 0){
	    parentApp.clipDetailWidget.cancelDetail(id);
	    console.info($("#container_"+id));
	    $("#container_"+id).remove();
	  }else{

	  }

	},
      errorCallBack:function(response){
	console.info(response);
      }
    });
  },
  deleteEmail:function(email){
    var len = email.length;
    var address = email.slice(0,len-1);
    var i = email.slice(len-1,len);
    RequestUtil.deleteFunc({
      url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/email/"+address,
      //data:params,
      successCallBack:function(response){
	if(response[0] == 0){
	  $("#email"+i).remove();
	}else{
	  console.info("delEmail fail");
	}
      },
      errorCallBack:function(response){
	console.info(response);
      }
    });
  },
  editClip:function(id){
    //parentApp.client
  },
  addClip:function(){
    parentApp.clipAddWidget.loadDetail();
  },
  queryByWord:function(keyword){
    var params = {
      word : keyword
    };
    this.queryImpl(params);
  },
  queryByDate:function(fdate,tdate){
    var params = {
      date : [fdate,tdate]
    };
    this.queryImpl(params);
  },
  queryByTime:function(ftime,ttime){
    var params = {
      time : [ftime,ttime]
    };
    this.queryImpl(params);
  },
  queryByReason:function(reason1,reason2){
    var params = {
      reason : [reason1,reason2]
    };
    this.queryImpl(params);
  },
  queryByPurpose:function(purpose1,purpose2){
    var params = {
      purpose : [purpose1,purpose2]
    };
    this.queryImpl(params);
  },
  queryByDevice:function(device1,device2){
    var params = {
      device : [device1,device2]
    };
    this.queryImpl(params);
  },
  queryByCity:function(city1,city2){
    var params = {
      city : [city1,city2]
    };
    this.queryImpl(params);
  },
  queryImpl:function(params){
    RequestUtil.postFunc({
      url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "my/clip/query",
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
