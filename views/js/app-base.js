// app-base.js

App = new Backbone.Marionette.Application();

App.Model = Backbone.Model.extend({
  constructor:function(){
    var args = Array.prototype.slice.call(arguments);
    Backbone.Model.prototype.constructor.apply(this, args);
    this.onChangeCallbacks = new Backbone.Marionette.Callbacks();
    this.on("change", this.runOnChangeCallbacks, this);
    this.on("alert", this.alert);
  },
  onChange: function(callback){
    // console.info(callback);
    this.onChangeCallbacks.add(callback);
  },
  runOnChangeCallbacks: function(){
    this.onChangeCallbacks.run(this, this);
  },
  alert: function(msg){
    if(msg.auth == "no_name"){
      App.ClipApp.showAlert(msg, null, function(){
	App.vent.trigger("app.clipapp.useredit:rename");
      });
    }else if(msg.auth == "not_login" || msg.auth == "not_self"){
      App.ClipApp.showLogin();
    }
  },
  // override to parse [0, res] | [1, err] structure
  sync: function(method, model, options){
    /*
    var methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'delete': 'DELETE',
      'read':   'GET'
    };
    console.log(method);
    options.data = model.toJSON();
    options.data._method = options.type || methodMap[method];
    options.type = 'GET';
    options.dataType = 'jsonp';
    options.processData = true;
    */
    var success = options.success;
    var error = options.error;
    options.success = function(resp, status, xhr){
      if(resp[0] == 0){
	// console.info("sync success:");console.dir(resp[1]);
	if(success) success.apply(model, [resp[1], status, xhr]);
      } else {
	if("auth" in resp[1]){
	  model.trigger("alert", resp[1]);
	}else{
	  if(error) error.apply(model, [resp[1], status, xhr]);
	}
      }
    };
    Backbone.sync.apply(Backbone, [method, model, options]);
  }
});

App.Collection = Backbone.Collection.extend({
  constructor: function(){
    var args = Array.prototype.slice.call(arguments);
    Backbone.Collection.prototype.constructor.apply(this, args);
    this.onResetCallbacks = new Backbone.Marionette.Callbacks();
    this.on("reset", this.runOnResetCallbacks, this);
  },
  onReset: function(callback){
    this.onResetCallbacks.add(callback);
  },
  runOnResetCallbacks: function(){
    this.onResetCallbacks.run(this, this);
  },
  // override to filter out duplicate model
  add: function(models, options){
    models = _.isArray(models) ? models.slice() : [models];
    var models2 = [];
    for (var i=0, length=models.length; i < length; i++){
      // todo 仅判断 id 与 collection 已有的重复，未判断与 models 里的其他重复
      var id = models[i].id;
      if(id != null && this._byId[id] != null){
      } else {
	models2.push(models[i]);
      }
    }
    Backbone.Collection.prototype.add.apply(this, [models2, options]);
  },
  // override to parse [0, res] | [1, err] structure
  sync: function(method, model, options){
    var success = options.success;
    var error = options.error;
    options.success = function(resp, status, xhr){
      if(resp[0] == 0){
	// console.log("collection.sync success:");console.dir(resp[1]);
	if(success){
	  success.apply(model, [resp[1], status, xhr]);
	}
      } else {
	if(error) error.apply(model, [resp[1], status, xhr]);
      }
    };
    Backbone.sync.apply(Backbone, [method, model, options]);
  }
});

App.ItemView = Backbone.Marionette.ItemView.extend({
  showError:function(tmpl,errorCode){ // 显示validate验证的错误提示
    for(var key in errorCode){
      var error = _i18n(tmpl+'.'+key+'.'+errorCode[key]);
      this.$("#"+key).addClass("error");
      this.$("#"+key).after("<span class='error'>"+error+"</span>");
      if(this.$("#"+key).attr("type") == "password")
	this.$("#"+key).val("");
    }
  },
  cleanError:function(e){ // 当用户进行鼠标聚焦时，清空错误提示
    var id = e.currentTarget.id;
    this.$("#"+id).siblings("span.error").remove();
    this.$("#"+id).removeClass("error");
  },
  getInput:function(){ // 获取页面输入框的值
    var data = {};
    _.each(this.$(":input").serializeArray(), function(obj){
      data[obj.name] = obj.value == "" ? undefined : obj.value;
    });
    return data;
  },
  setModel:function(tmpl, model, data){ // 封装了model.set和showError方法
    var view = this;
    model.set(data, {
      error: function(model, error){
	view.showError(tmpl,error);
      }
    });
  }
});
App.DialogView = App.ItemView.extend({
  onShow:function(){
    this.flag = false; // view的flag属性表示需要设定noscroll
    if(!$("body").hasClass("noscroll")){
      this.flag = true;
      $("body").addClass("noscroll");
    }
  },
  close:function(){
    // view.close的源代码
    this.trigger('item:before:close');
    Backbone.Marionette.ItemView.prototype.close.apply(this, arguments);
    this.trigger('item:closed');
    // 新添加的 去掉body的noscroll属性
    if(this.flag == true) {
      $("body").removeClass("noscroll");
    }
  }
});
App.Region = Backbone.Marionette.Region;
App.TemplateCache = Backbone.Marionette.TemplateCache;
App.CollectionView = Backbone.Marionette.CollectionView;
App.CompositeView = Backbone.Marionette.CompositeView;
App.Routing = (function(App, Backbone){
  var Routing = {};
  Routing.showRoute = function(){
    var route = getRoutePath(arguments);
    Backbone.history.navigate(route, false);
    var _gaq = _gaq||[];
    _gaq.push(['_trackPageview', "/#"+route]);
  };
  function getRoutePath(routeParts){
    var base = routeParts[0];
    var length = routeParts.length;
    var route = base;
    if (length > 1){
      for(var i = 1; i < length; i++) {
	var arg = routeParts[i];
	if (arg){
	  route = route + "/" + arg;
	}
      }
    }
    return route;
  }
  return Routing;
})(App, Backbone);

App.addRegions({
  mineRegion: "#mine",
  mysetRegion: "#myset",
  faceRegion: "#face",
  bubbRegion: "#bubb",
  listRegion: "#list",
  viewRegion: "#view",
  popRegion: "#pop",
  feedRegion: ".feed",
  feedbackRegion: "#feedback",
  setpopRegion:"#setpop",
  searchRegion:".search",
  followRegion:"#follow"
});

if(typeof console !="object"){
  var console = {
    log:function(){},
    info:function(){},
    dir:function(){}
  };
}

App.bind("initialize:before", function(){
  Modernizr.addTest('filereader', function () {
    return !!(window.File && window.FileList && window.FileReader);
  });
  Modernizr.addTest('cssfilters', function() {
    var el = document.createElement('div');
    el.style.cssText = Modernizr._prefixes.join('filter' + ':blur(2px); ');
    // return  !!el.style.length && ((document.documentMode === undefined || document.documentMode > 9));
    return !!el.style.length && ((document.documentMode === undefined || document.documentMode > 6));
  });
});

App.bind("initialize:after", function(){
  if(Backbone.history){
    Backbone.history.start();
  }
});
