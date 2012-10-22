var callbacks = {};
var cache = {};
var time = 5000;
var NOOP = function(){};
function load(key, val){
  cache[key] =/my_clips/.test(key) ? val.reverse() : val;
  var s = document.getElementById(key);
  if(s) document.getElementsByTagName('HEAD')[0].removeChild(s);
  _.each(callbacks[key],function(e){
      clearTimeout(e.timeout);
      e.success(key,val);
  });
  delete callbacks[key];
}

(function(){
  function get_uid(url){
    var uid = url.match(/user\/[0-9]+/) ? url.match(/user\/[0-9]+/)[0].split('/')[1]: null;
    var uid_clip = url.match(/clip\/[0-9]+:[0-9]+/) ? url.match('clip\/[0-9]+')[0].split('/')[1] : null;
    var uid_cookie = document.cookie.match(/[0-9]+:/) ? document.cookie.match(/[0-9]+:/)[0][0]:null;
    var uid_local = App.Local? App.Local.uid :null;
    return uid || uid_clip || uid_cookie || uid_local;
  }

  function get_key(url){
    // console.info(url);
    var key = "";
    var uid = get_uid(url);
    if(/info/.test(url)){
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
    return location.protocol == "http:" ? "/_2_" + key : ".." + key;
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
    _.each(callbacks[key],function(e){
      clearTimeout(e.timeout);
      e.error(key,'timeout');
    });
    delete callbacks[key];
  }

  function expandImgSrc(src){
    return location.protocol != "http:" && !/\.\./.test(src) ? src.replace("/_2_","..") : src;
  }

  //详情中图片的url转化为实际url
  var expandConImgUrl = expandImgSrc;
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
  function loadUsers(keys, options){
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
    mgetModel(keys, loadOneUser, options);
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
	      clip.content = expandConImgUrl(cdata);
	      var keys = getUsersKey(clip.route);//获取路线图
	      options._success = function(users){
		clip.users = users;
		options.success([0,clip]);
	      };
	      loadRoute(keys,options);
	    }, error : function(key,error){ options.error([1,error]); }
	  });
	}, error : function(key,error){ options.error([1,error]); }
      });
    }else if(/info/.test(key)) {
      js_load(key,{
	success:function(key,data){
	  if(data.face && /:/.test(data.face)){
	    var prefix = location.protocol == "http:" ? "/_2_/" : "../";
	    var opt = data.face.split(":");
	    data.face = prefix + opt[0] + "/face." + opt[1].split(".")[1];
	    // console.info(data.face,opt);
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

  //将preview中图片url转化为本地图片url
  function expandPreImgUrl(content){
    if(content.image&&!/_270/.test(content.image.src)){
      var img_src = content.image.src.replace(".","_270.");
      content.image.src = expandImgSrc(content.image.src);
    }
    return content;
  }

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
	  data.content = expandPreImgUrl(data.content);
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

  // Override `Backbone.sync` to use delegate to the model or collection's
  // *localStorage* property, which should be an instance of `Store`.
  Backbone.sync = function(method, model, options) {
    //console.info("=========backbone-localstorage::sync=======");

    var resp;
    //var store = model.localStorage || model.collection.localStorage;
    switch (method) {
      // case "read":resp = model.id ? store.find(model) : store.findAll(); break;
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
