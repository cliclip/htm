(function(){

  var callbacks = {};
  window.cache = {};
  var time = 100;
  var NOOP = function(){};
  var P = "/_3_";
  var _P = "..";
  //*.json.js文件中调用此方法，传入数据
  window.load = function(key, val){
    // console.info(key,val);
    cache[key] =/my_clips/.test(key) && _.isArray(val) ? val.reverse() : val;
    var s = document.getElementById(key);
    if(s) document.getElementsByTagName('HEAD')[0].removeChild(s);
    _.each(callbacks[key],function(e){
	clearTimeout(e.timeout);
	e.success(key,val);
    });
    delete callbacks[key];
  };

  // 根据url，cookie ，App.local.js 获取用户id
  function get_uid(url){
    var uid = url.match(/user\/[0-9]+/) ? url.match(/user\/[0-9]+/)[0].split('/')[1]: null;
    var uid_clip = url.match(/clip\/[0-9]+:[0-9]+/) ? url.match('clip\/[0-9]+')[0].split('/')[1] : null;
    var uid_cookie = document.cookie.match(/[0-9]+:/) ? document.cookie.match(/[0-9]+:/)[0][0]:null;
    var uid_local = App.Local? App.Local.uid :null;
    return uid || uid_clip || uid_cookie || uid_local;
  }

  // 根据url 取得文件名称及目录
  function get_key(url){
    // console.info(url);
    var key = "";
    var uid = get_uid(url);
    if(/user\/(\d+)\?/.test(url)){
      key = "/" + uid + "/info.json.js";
    }else if(/user\/[0-9]+\/query/.test(url)){
      key = "/" + uid + "/my_clips.json.js";
    }else if(/meta/.test(url)){
      key = "/" + uid +"/meta";
    }else if(/clip/.test(url)){
      var str = url.match(/[0-9]+:[0-9]+/g);
      var path = str[str.length-1].split(':');
      key = "/" + uid +  "/clip_"+path[1] +".text.js";
    }else if(/help_zh/.test(url)){
      key = "help_zh.json.js";
    }else if(/help_en/.test(url)){
      key = "help_en.json.js";
    }else{
      console.info("this url is not process:"+url);
      key = url;
    }
    return key;
  }

  // 根据协议类型为url添加前缀
  function get_file(key){
    return App.util.isLocal() ? _P + key : P + key;
    //TODO help 的目录存在问题
  }

  // 加载js文件（ 添加script标签引入文件）
  function _js_load(key) {
    var file = get_file(key);
    var s = document.getElementById(key);
    if(!s){
      var oHead = document.getElementsByTagName('HEAD').item(0);
      var oScript= document.createElement("script");
      oScript.type = "text/javascript";
      oScript.src = file;
      oScript.id = key;
      oScript.charset = "utf-8";
      oHead.appendChild( oScript);
    }
  }

  // js_load(key, {success:function(key,val){}, error:function(key,err){}})
  // js 文件加载成功后，将数据存入缓存
  function js_load(key,options){
    // console.info(key,cache[key],options);
    var val = cache[key];
    if (val){
      options.success(key,val);
    } else {
      _js_load(key);
      callbacks[key] = callbacks[key]?callbacks[key]:[];
      options.timeout = setTimeout(function(){timeout(key);}, time);
      callbacks[key].push(options);
    }
  };

  // 加载失败 timeout
  function timeout(key){
    //delete options.timeout;
    var s = document.getElementById(key);
    if(s) document.getElementsByTagName('HEAD')[0].removeChild(s);
    // console.info(callbacks[key]);
    _.each(callbacks[key],function(e){
      clearTimeout(e.timeout);
      e.error(key,['timeout',key]);
    });
    delete callbacks[key];
  }

  // 根据clip的id 或 uid 拼接获取user信息的key
  function getUsersKey(ids){
    var keys = [];
    _.each(ids ,function(id){
      var _id = /:/.test(id) ? id.split(":")[0] : id;
      keys.push("/" + _id + "/info.json.js");
    });
    return keys.slice(0,4);
  }

  // 根据userkeys 批量获取user信息
  var loadRoute = loadUsers;
  function loadUsers(route, options){
    var keys = getUsersKey(route);
    mgetModel(keys, loadOneUser, options);
    function loadOneUser(key,callback){
      js_load(key,{
	success:function(key,data){
	  data = {face:data.face,name:data.name,id:data.id};
	  callback(null,data);
	}, error: function(key, err){
	  callback(err);
	}
      });
    }
  }

  function getModel(key, options){
    if(/meta/.test(key)) {
      js_load(key.replace("meta","my_clips.json.js"), {
	error: options.error,
	success: function(key,data){
	  var tags = [];
	  _.each(data,function(clip){
	    clip.tag ? tags.push(clip.tag) : function(){};
	  });
	  tags = _.uniq(tags);
	  options.success([0,{tag:tags}]);
	}
      });
    } else if (/clip_[0-9]+\.text/.test(key)) {
      var ckey = key;
      var pkey = key.replace("text","json");
      js_load(pkey, {
	success : function(key, pdata){
	  js_load(ckey, {
	    success : function(key, cdata){
	      var clip = _.clone(pdata);
	      var uid = clip.user.id ? clip.user.id : clip.user;
	      clip.content = cdata;
	      // clip.content = expandConImgUrl(cdata,clip.user,clip.id);
	      options._success = function(users){
		clip.users = users;
		options.success([0,clip]);
	      };
	      // TODO 区分本地还是在线
	      loadRoute(clip.route,options);
	    }, error : function(key,error){ options.error([1,error]); }
	  });
	}, error : function(key,error){ options.error([1,error]); }
      });
    }else if(/info/.test(key)) {
      js_load(key,{
	success:function(key,data){
	  if(data.face && /:/.test(data.face)){
	    //data.face = expandImgSrc(data.face);
	  }
	  options.success([0,data]);
	},error:function(key,error){ options.error([1,error]); }
      });
    }else{
      // console.info("a common key ::",key);
      js_load(key,{
	success:function(key,data){ options.success([0,data]); },
	error:function(key,error){ options.error([1,error]); }
      });
    }
  }

  /*
  //图片的url转化为实际url
  function expandImgSrc(src){
    // console.info("backbone-localstorage",src);
    return App.util.isLocal() && !/\.\./.test(src) ? src.replace(P,_P) : src;
  }
  */

  /**
   *将content中图片url转化为本地图片url
   * 只转化存在具体文件的img的url
   */
  /*
  function expandConImgUrl(content,user,id){
    var cid = id,uid = user;
    if(/:/.test(id)){
      uid = id.split(":")[0];
      cid = id.split(":")[1];
    }
    var prefix = App.util.isLocal() ? _P : P ;
    var pre =  prefix + "/" + uid + "/clip_" + cid + "_";
    var reg = /<img\ssrc=(\'|\")(\d+)\.(\w+)(\'|\")/g;
    var reg1 = /\"tmp_/g;
    var reg2 = /\'tmp_/g;
    content = content.replace(reg1, "\"" + P + "/tmp_");
    content = content.replace(reg2, "'" + P + "/tmp_");
    var imgs = content.match(reg);
    if(!imgs) return content;
    for(var i = 0; i<imgs.length; i++){
      var opt = imgs[i].split("='");
      content = content.replace(imgs[i], opt[0] + "='" + pre + opt[1]);
    }
    return content;
  }
  */
  /**
   *将preview中图片url转化为本地图片url
   * 只转化存在具体文件的img的url
   */
  /*
  function expandPreImgUrl(content,id,user){
    if(!content.image) return content;
    if(/tmp/.test(content.image.src)) return content;
    if(!/_270/.test(content.image.src)){
      content.image.src = content.image.src.replace(".","_270.");
    }
    var src = content.image.src;
    if(!/clip/.test(src)){
      var prefix = App.util.isLocal() ? _P : P ;
      if(/:/.test(id)){
	var opt = id.split(":");
	src = prefix + "/" + opt[0] + "/clip_" +opt[1] + "_" + src;
      }else {
	src = prefix + "/" + user + "/clip_" + id + "_" + src;
      }
    }
    content.image.src = src;
    return content;
  }
  */

  //根据查询条件过滤需要取得的cliplist
  function filter(key,url,data,options){

    var keys = [], ids = [], _filter = options.data;
    var len = url.match(/[0-9]+\.\.[0-9]+/) ? url.match(/[0-9]+\.\.[0-9]+/)[0].split("..") : null;
    _.each(data,function(e){
      if(_filter.tag && e.tag==_filter.tag[0] ||!_filter.tag){
	var ids =e.cid ?  e.cid.split(":") : [e.user,e.id];
	keys.push("/" + ids[0] + "/clip_"+ids[1]+".json.js");
      }
    });
    keys = _.uniq(keys).slice(len[0]-1,len[1]);
    mgetModel(keys, loadOnePreview, options);
    function loadOnePreview(key,callback){
      js_load(key,{
	success:function(key,data){
	  // data.content = expandPreImgUrl(data.content,data.id,data.user);
	  callback(null,data);
	}, error: function(key, err){
	  callback(err);
	}
      });
    };
  }

  function mgetModel(keys, iterator, options){
    async.map(keys, iterator, function(err, result){
      if(err) return options.error(err);
      options._success(result);
    });
  }

  var readModel = getModel;
  function readCollection(key, url, options){
    if(/my_clips/.test(key)){
      var _options = _.clone(options);
      _options._success = function(clips){ options.success([0,clips]); };
      _options.success=function(key,data){ filter(key,url,data,_options); };
      js_load(key,_options);
    }else {
      console.info("************************");
    }
  }
/*
  // A simple module to replace `Backbone.sync` with *localStorage*-based
  // persistence. Models are given GUIDS, and saved into a JSON object. Simple
  // as that.

  // Generate four random hex digits.
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  // Our Store is represented by a single JS object in *localStorage*. Create it
  // with a meaningful name, like the name you'd give a table.
  var Store = function(name) {
    this.name = name;
    var store = localStorage.getItem(this.name);
    this.data = (store && JSON.parse(store)) || {};
  };

  _.extend(Store.prototype, {
    // Save the current state of the **Store** to *localStorage*.
  save: function() {
    localStorage.setItem(this.name, JSON.stringify(this.data));
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(model) {
    if (!model.id) model.id = model.attributes.id = guid();
    this.data[model.id] = model;
    this.save();
    return model;
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model) {
    this.data[model.id] = model;
    this.save();
    return model;
  },

  // Retrieve a model from `this.data` by id.
  find: function(model) {
    return this.data[model.id];
  },

  // Return the array of all models currently in storage.
  findAll: function() {
    return _.values(this.data);
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model) {
    delete this.data[model.id];
    this.save();
    return model;
  }

  });
*/

  // Override `Backbone.sync` to use delegate to the model or collection's
  // *localStorage* property, which should be an instance of `Store`.
  Backbone.sync = function(method, model, options) {
    // console.info("=========backbone-localstorage::sync=======");
    var resp;
    //var store = model.localStorage || model.collection.localStorage;
    switch (method) {
      // case "read":resp = model.id?store.find(model):store.findAll();break;
      // case "create":resp = store.create(model);break;
      // case "update":resp = store.update(model);break;
      // case "delete":resp = store.destroy(model);break;
      case "read":
	if(model.models) { // load collection
	  // console.info("-----------read collection----------");
	  readCollection(get_key(options.url), options.url, options);
	}else{ // load model
	  // console.info("-----------read model----------");
	  readModel(get_key(options.url), options);
	}
	break;
    }
  };

})();
