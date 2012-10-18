var callbacks = {};
var cache = {};
var time = 5000;

function load(key, val){
  //console.info("load is running..........");
  //console.info(callbacks[key]);
  cache[key] = val;
  var s = document.getElementById(key);
  if(s) document.getElementsByTagName('HEAD')[0].removeChild(s);
  _.each(callbacks[key],function(e){
      clearTimeout(e.timeout);
      e.success(key,val);
  });
  delete callbacks[key];
}

(function(){

  function get_key(url){
    var key = "";
    if(/my\/info/.test(url)){
      key = "info";
    }else if(/query/.test(url)){
      key = "my_clips";
    }else if(/meta/.test(url)){
      key = "meta";
    }else if(/comment/.test(url)){
      var str = url.match(/[0-9]+:[0-9]+/g);
      var path = str[1].split(':');
      key = "comment_"+path[1];
    }else if(/clip/.test(url)){
      var str = url.match(/[0-9]+:[0-9]+/g);
      // console.info(str[str.length-1]);
      var path = str[1].split(':');
      key = "clip_"+path[1] +"_detail";
    }else if(/help_zh/.test(url)){
      key = "help_zh";
    }else if(/help_en/.test(url)){
      key = "help_en";
    }else{
      console.info("this url is not process:"+url);
      key = url;
    }
    return key;
  }

  function get_file(key){
    var file = '';
    var uid = App.Local.uid;
    if(key == "info"){
      file = "../"+uid+"/info.json.js";
    }else if(key == "my_clips"){
      file = "../"+uid+"/my_clips.json.js";
    }else if(/clip_[0-9]+_detail/.test(key)){
      var list = key.split('_');
      var path = list[1];
      file = "../"+uid+"/clip_"+path +".text.js";
    }else if(/clip_[0-9]+_preview/.test(key)){
      var id = key.split('_');
      file = "../"+uid+"/clip_" + id[1] + ".json.js";
    }else if(/help_/.test(key)){
      file = "help/" + key + ".json.js";
    }else{
      console.info("this key is not process:"+key);
    }
    return file;
  }

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
  function js_load(key,options){
    //console.info(key,cache[key],options);
    var val = cache[key];
    if (val){
      options.success(key,val);
    } else {
      _js_load(key);
      //console.info("js_load:::::::",key,options);
      callbacks[key] = callbacks[key]?callbacks[key]:[];
      options.timeout = setTimeout(function(){timeout(key);}, time);
      callbacks[key].push(options);
      //console.info("callbacks[]:::::::",key,callbacks[key]);
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

  //详情中图片的url转化为本地url
  function expandConImgUrl(content){
    var img_name = "";
    console.info(content);
    var reg = /\[img\].*?\/image\/.*?\[\/img\]/gi;
    var src = content.match(reg);
    var list = [];
    if(src){
      for(var i=0;i<src.length;i++) {
	img_name = src[i].split("image")[1];
	img_name = "[img]../"+ App.Local.uid + img_name;
	content = content.replace(src[i],img_name);
      }
    }
    return content;
  }

  function getModel(key, options){
    if(/meta/.test(key)) {
      js_load("my_clips", {
	error: options.error,
	success: function(key,data){
	  //console.info(cache);
	  //console.info("----meta----",key,cache[key]);
	  var tags = [];
	  _.each(data[1],function(clip){
	    clip.tag ? tags.push(clip.tag) : function(){};
	  });
	  tags = _.uniq(tags);
	  // console.info(tags,options);
	  // cache["meta"] = [0,{tag:tags}];
	  options.success([0,{tag:tags}]);
	}
      });
    } else if (/clip_[0-9]+_detail/.test(key)) {
      var ckey = key;
      var pkey = key.replace("detail","preview");
      js_load(pkey, {
	success : function(key, pdata){
	  js_load(ckey, {
	    success : function(key, cdata){
	      var clip = _.clone(pdata);
	      clip.users = [];
	      clip.content = expandConImgUrl(cdata.content);
	      console.info(clip);
	      options.success([0,clip]);
	    }, error : options.error
	  });
	}, error : options.error
      });
    }else if(/comment/.test(key)){

    }else{
      //js_load(key, options);
      js_load(key,{
	success:function(key,data){
	  options.success(data);
	},
	error:function(key,error){
	  options.error(error);
	}
      });
    }
  }

  //将preview中图片url转化为本地图片url
  function expandPreImgUrl(content){
    var img_name = "";
    if(content.image && !/http:/.test(content.image)&&!/\.\.\/[0-9]+\/clip/.test(content.image)){
      img_name = content.image.split("image")[1];
      //img_name = img_name.replace(".","_270.");
      content.image = "../"+ App.Local.uid + img_name;
    }
    return content;
  }

  //根据查询条件过滤需要取得的cliplist
  function filter(key,url,data,options){
    var keys = [];
    var ids = [];
    //console.info("--------filter::options-------",options.data);
    var _filter = options.data;
    //var _tag = _filter.tag[0] ? _filter.tag : null;
    _.each(data[1],function(e){
      if(_filter.tag && e.tag==_filter.tag[0] ||!_filter.tag){
	var ids = e.cid.split(":");
	keys.push("clip_"+ids[1]+"_preview");
      }
    });
    var len = url.match(/[0-9]+\.\.[0-9]+/)[0].split("..");
    // console.info(len,url);
    keys = _.uniq(keys);
    keys = keys.slice(len[0]-1,len[1]);
    mgetModel(keys,options);
  }

  function loadOne(key,callback){
    js_load(key,{
      success:function(key,data){
	data.content =  expandPreImgUrl(data.content);
	callback(null,data);
      }, error: function(key, err){
	callback(err);
      }
    });
  };

  function mgetModel(keys,options){
    async.map(keys,loadOne,function(err,result){
      if(err) return options.error(err);
      var data = _.sortBy(result,function(e){return e.id;});
      options._success([0,data]);
    });
  }

  var readModel = getModel;
  function readCollection(key, url, options){	//key == "my_clips";
    var re = /(\d+)\.\.(\d+)/;
    var result = url.match(re);//»ñÈ¡·ÖÒ³Ìõ¼þ
    var _options = _.clone(options);
    _options._success = options.success;
    _options.success=function(key,data){
      filter(key,url,data,_options);
    };
    js_load(key,_options);
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
	  //console.info("-----------read collection----------");
	  var key = "my_clips"; // my_clips
	  var url = options.url;
	  readCollection(key, url, options);
	}else{ // load model
	  //console.info("-----------read model----------");
	  var key = get_key(options.url);
	  readModel(key, options);
	}
	break;
    }

    if (resp) {
      // options.success(resp);
    } else {
      // options.error("Record not found");
    }
  };

})();
/*
	function mgetModel(keys, options){
		//console.info(keys,"mgetModel............",options);
		var result =[];// {};
		var error = {};
		var reduce_s = function(key,d){
			//console.info(key,keys);
			d.content =  preImageUrl(d.content);
			result[key] = d;
			result.push(d);
			keys = _.without(keys, [key])//É¾³ýkeysÖÐµÄkeyÔªËØ
			reduce_end();
		};
		var reduce_e = function(key,e){
			error[key] = e;
			_.without(keys, [key])//É¾³ýkeysÖÐµÄkeyÔªËØ
			reduce_end();
		}
		var reduce_end = function(){
			// console.info(keys);
			if(keys.length!=0){return;}
			if (!_.isEmpty(error)){
				options.error(error);
			} else {
				//var data = _.values(result);
				var data = _.sortBy(result,function(e){return e.id;})
				options._success([0,data]);
			}
		}
		_.each(keys,function(key){
			js_load(key,{success:reduce_s,error:reduce_e});
		});
	};
	*/