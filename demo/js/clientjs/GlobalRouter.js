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
      "user/:uid/email/:address":"deleteEmail",
      "/active/:str":"activeEmail",
      "user/:uid/recomm/:start..:end":"restoreAllRecommend",
      "user/:uid/clip/:start..:end":"restoreAll",

      "user/:uid/tag/:param/:start..:end" : "sortByReason",
      "user/:uid/device/:param/:start..:end" : "sortByDevice",
      //当device是curl/7.19.7
      // new RegExp('^/clip/device/(^\/[.*?]\/p$)/p([/d]+)$') : "sortByDevice",
      "user/:uid/city/:param/:start..:end" : "sortByCity",

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
    restoreAll:function(uid, s, e){
//      console.dir({uid:uid, start:s, end:e});
      //url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/all";
      var url = "user/"+uid + "/clip/";
      this.listByImpl(url, s, e);
    },
    listByImpl:function(_url, s, e){
      var previewClipList = new PreviewList();
      previewClipList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL  + _url + s + ".." + e;
      previewClipList.fetch({
	success:function(collection,resp){

	  if(resp[0] == 0){
	    if(s != 0){
	      parentApp.clipWidget.addPreviewClipList(collection);
	    }
	    else{
	      parentApp.clipWidget.loadPreviewClipList(collection);
	      $("[href^='#"+_url+"']").children("div").addClass("active");
	    }
	    parentApp.clipWidget.currentUrl = _url;
	    parentApp.clipWidget.currentStart = s;
	    parentApp.clipWidget.currentEnd = e;
	  }else{
	    //server response exception
	  }
	},
	error:function(collection,resp){
	  //client request error
	}
      });
    },
    restoreAllRecommend:function(uid, s, e){
      //url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/all";
      var url = "user/"+uid + "/clip/";
      this.listByImpl_recom(url, s, e);
    },
    listByImpl_recom:function(_url, s, e){
      var previewRecomList = new PreviewList();
      previewRecomList.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL  + _url + s + ".." + e;
      previewRecomList.fetch({
	success:function(collection,resp){
	  if(resp[0] == 0){
	    if(s != 0)
	      parentApp.recomWidget.addPreviewRecomList(collection);
	    else{
	      parentApp.recomWidget.loadPreviewRecomList(collection);
	      $("[href^='#"+_url+"']").children("div").addClass("active");
	    }
	    parentApp.recomWidget.currentUrl = _url;
	    parentApp.recomWidget.currentStart = s;
	    parentApp.recomWidget.currentEnd = e;
	  }else{
	    //server response exception
	  }
	},
	error:function(collection,resp){
	  //client request error
	}
      });
    },
    sortByReason:function(param, uid, s, e){
      console.info("sortByReason");
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/reason/"+param+"/p"+page;
      var url = "user/" + uid + "/clip/reason/"+encodeURIComponent(param);
      this.listByImpl(url, s, e);
    },
    sortByPurpose:function(param,uid, s, e){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/purpose/"+param+"/p"+page;
      var url =  "user/" + uid + "/clip/purpose/"+encodeURIComponent(param);
      this.listByImpl(url, s, e);
    },
    sortByDevice:function(param, uid, s, e){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/device/"+param+"/p"+page;
      var url = "user/" + uid + "/clip/device/"+encodeURIComponent(param);
      this.listByImpl(url, s, e);
    },
    sortByCity:function(param, uid, s, e){
      //var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/clip/city/"+param+"/p"+page;
      var url =  "user/" + uid + "/clip/city/"+encodeURIComponent(param);
      this.listByImpl(url,page);
    },
    detailById:function(id){
      /**
       * 应该放在GlobalApp中,联系起clippreview来显示
       * */
      if(!parentApp.clipDetailWidget){
	parentApp.clipDetailWidget = new ClipDetailWidget($("#detailContact"));
      }
      if(!parentApp.commShowWidget){
	parentApp.commShowWidget = new CommShowWidget($("#popup_Contact"));
      }
      parentApp.popUp_detail({width:800,height:1000},parentApp.clipDetailWidget,parentApp.commentWidget);
      /**/
      var clipDetail = new ClipDetail();
      clipDetail.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id;
      clipDetail.fetch({
	success:function(model,resp){
	  if(resp[0] == 0){
	    parentApp.clipDetailWidget.loadDetail(id,model);
	  }else{
	    //server response exception
	  }
	},
	error:function(collection,resp){
	  //client request error
	}
      });
      comment = new Comment();
      comment.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "clip/"+id+"/comment";
      comment.fetch({
	success:function(model,resp){
	  if(resp[0] == 0){
	    parentApp.commShowWidget.loadComment(model,id);
	    /*model = model.toJSON();
	    for(var i=0; i<model.comment.length; i++){
	      parentApp.commentWidget.loadComment(model.comment[i].id,model.comment[i]);
	    }*/
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
	  // $("#email"+i).remove();
	  parentApp.userEmailWidget.loadEmailList();
	}else{
	  console.info("delEmail fail");
	}
      },
      errorCallBack:function(response){
	console.info(response);
      }
    });
  },
  activeEmail:function(str){
    RequestUtil.getFunc({
      url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "active/"+str,
      successCallBack:function(response){
	if(response[0] == 0){
	  parentApp.userEmailWidget.loadEmailList();
	}else{
	  console.info("activeEmail fail");
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
  //  parentApp.clipAddWidget.loadDetail();
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
    });
  }
  });
  this.router = new _router();
};
