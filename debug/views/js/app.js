// Backbone.Marionette v0.7.0
//
// Copyright (C)2011 Derick Bailey, Muted Solutions, LLC
// Distributed Under MIT License
//
// Documentation and Full License Available at:
// http://github.com/derickbailey/backbone.marionette
Backbone.Marionette = (function(Backbone, _, $){
  var Marionette = {};

  Marionette.version = "0.7.0";

  // Marionette.View
  // ---------------

  // The core view type that other Marionette views extend from.
  Marionette.View = Backbone.View.extend({
    // Get the template or template id/selector for this view
    // instance. You can set a `template` attribute in the view
    // definition or pass a `template: "whatever"` parameter in
    // to the constructor options. The `template` can also be
    // a function that returns a selector string.
    getTemplateSelector: function(){
      var template;

      // Get the template from `this.options.template` or
      // `this.template`. The `options` takes precedence.
      if (this.options && this.options.template){
        template = this.options.template;
      } else {
        template = this.template;
      }

      // check if it's a function and execute it, if it is
      if (_.isFunction(template)){
        template  = template.call(this);
      }

      return template;
    },

    // Default `close` implementation, for removing a view from the
    // DOM and unbinding it. Regions will call this method
    // for you. You can specify an `onClose` method in your view to
    // add custom code that is called after the view is closed.
    close: function(){
      this.beforeClose && this.beforeClose();

      this.unbindAll();
      this.remove();

      this.onClose && this.onClose();
      this.trigger('close');
      this.unbind();
    }
  });

  // Item View
  // ---------

  // A single item view implementation that contains code for rendering
  // with underscore.js templates, serializing the view's model or collection,
  // and calling several methods on extended views, such as `onRender`.
  Marionette.ItemView = Marionette.View.extend({
    constructor: function(){
      var args = slice.call(arguments);
      Marionette.View.prototype.constructor.apply(this, args);

      _.bindAll(this, "render");

      this.initialEvents();
    },

    // Configured the initial events that the item view
    // binds to. Override this method to prevent the initial
    // events, or to add your own initial events.
    initialEvents: function(){
      if (this.collection){
        this.bindTo(this.collection, "reset", this.render, this);
      }
      if(this.model){
	this.bindTo(this.model, "change", this.render,this);
      }
    },

    // Serialize the model or collection for the view. If a model is
    // found, `.toJSON()` is called. If a collection is found, `.toJSON()`
    // is also called, but is used to populate an `items` array in the
    // resulting data. If both are found, defaults to the model.
    // You can override the `serializeData` method in your own view
    // definition, to provide custom serialization for your view's data.
    serializeData: function(){
      var data;

      if (this.model) { data = this.model.toJSON(); }
      else if (this.collection) {
        data = { items: this.collection.toJSON() };
      }

      return data;
    },

    // Render the view, defaulting to underscore.js templates.
    // You can override this in your view definition.
    render: function(){
      var that = this;
      var deferredRender = $.Deferred();
      var template = this.getTemplateSelector();
      var deferredData = this.serializeData();

      this.beforeRender && this.beforeRender();
      this.trigger("item:before:render", that);
      $.when(deferredData).then(function(data) {
        var asyncRender = Marionette.Renderer.render(template, data);
        $.when(asyncRender).then(function(html){
          that.$el.html(html);
          that.onRender && that.onRender();
          that.trigger("item:rendered", that);
          that.trigger("render", that);
          deferredRender.resolve();
        });
      });

      return deferredRender.promise();
    },

    // Override the default close event to add a few
    // more events that are triggered.
    close: function(){
      this.trigger('item:before:close');
      Marionette.View.prototype.close.apply(this, arguments);
      this.trigger('item:closed');
    }
  });

  // Collection View
  // ---------------

  // A view that iterates over a Backbone.Collection
  // and renders an individual ItemView for each model.
  Marionette.CollectionView = Marionette.View.extend({
    constructor: function(){
      Marionette.View.prototype.constructor.apply(this, arguments);

      _.bindAll(this, "addItemView", "render");
      this.initialEvents();
    },

    // Configured the initial events that the collection view
    // binds to. Override this method to prevent the initial
    // events, or to add your own initial events.
    initialEvents: function(){
      if (this.collection){
        this.bindTo(this.collection, "add", this.addChildView, this);
        this.bindTo(this.collection, "remove", this.removeItemView, this);
        this.bindTo(this.collection, "reset", this.render, this);
      }
    },

    // Handle a child item added to the collection
    addChildView: function(item){
      var ItemView = this.getItemView();
      return this.addItemView(item, ItemView);
    },

    // Loop through all of the items and render
    // each of them with the specified `itemView`.
    render: function(){
      var that = this;
      var deferredRender = $.Deferred();
      var promises = [];
      var ItemView = this.getItemView();

      this.beforeRender && this.beforeRender();
      this.trigger("collection:before:render", this);

      this.closeChildren();
      this.collection && this.collection.each(function(item){
        var promise = that.addItemView(item, ItemView);
        promises.push(promise);
      });

      deferredRender.done(function(){
        this.onRender && this.onRender();
        this.trigger("collection:rendered", this);
      });

      $.when(promises).then(function(){
        deferredRender.resolveWith(that);
      });

      return deferredRender.promise();
    },

    // Retrieve the itemView type, either from `this.options.itemView`
    // or from the `itemView` in the object definition. The "options"
    // takes precedence.
    getItemView: function(){
      var itemView = this.options.itemView || this.itemView;

      if (!itemView){
        var err = new Error("An `itemView` must be specified");
        err.name = "NoItemViewError";
        throw err;
      }

      return itemView;
    },

    // Render the child item's view and add it to the
    // HTML for the collection view.
    addItemView: function(item, ItemView){
      var that = this;

      var view = this.buildItemView(item, ItemView);
      this.storeChild(view);
      this.trigger("item:added", view);

      var viewRendered = view.render();
      $.when(viewRendered).then(function(){
        that.appendHtml(that, view);
      });

      return viewRendered;
    },

    // Build an `itemView` for every model in the collection.
    buildItemView: function(item, ItemView){
      var view = new ItemView({
        model: item
      });
      return view;
    },

    // Remove the child view and close it
    removeItemView: function(item){
      var view = this.children[item.cid];
      if (view){
        view.close();
        delete this.children[item.cid];
      }
      this.trigger("item:removed", view);
    },

    // Append the HTML to the collection's `el`.
    // Override this method to do something other
    // then `.append`.
    appendHtml: function(collectionView, itemView){
      collectionView.$el.append(itemView.el);
    },

    // Store references to all of the child `itemView`
    // instances so they can be managed and cleaned up, later.
    storeChild: function(view){
      if (!this.children){
        this.children = {};
      }
      this.children[view.model.cid] = view;
    },

    // Handle cleanup and other closing needs for
    // the collection of views.
    close: function(){
      this.trigger("collection:before:close");
      this.closeChildren();
      Marionette.View.prototype.close.apply(this, arguments);
      this.trigger("collection:closed");
    },

    closeChildren: function(){
      if (this.children){
        _.each(this.children, function(childView){
          childView.close();
        });
      }
    }
  });

  // Composite View
  // --------------

  // Used for rendering a branch-leaf, hierarchical structure.
  // Extends directly from CollectionView and also renders an
  // an item view as `modelView`, for the top leaf
  Marionette.CompositeView = Marionette.CollectionView.extend({
    constructor: function(options){
      Marionette.CollectionView.apply(this, arguments);
      this.itemView = this.getItemView();
    },

    // Retrieve the `itemView` to be used when rendering each of
    // the items in the collection. The default is to return
    // `this.itemView` or Marionette.CompositeView if no `itemView`
    // has been defined
    getItemView: function(){
      return this.itemView || this.constructor;
    },

    // Renders the model once, and the collection once. Calling
    // this again will tell the model's view to re-render itself
    // but the collection will not re-render.
    render: function(){
      var that = this;
      var compositeRendered = $.Deferred();

      var modelIsRendered = this.renderModel();
      $.when(modelIsRendered).then(function(html){
        that.$el.html(html);
        that.trigger("composite:model:rendered");
        that.trigger("render");

        var collectionIsRendered = that.renderCollection();
        $.when(collectionIsRendered).then(function(){
	setTimeout(function(){
	  compositeRendered.resolve();
	},0);

        });
      });

      compositeRendered.done(function(){
        that.trigger("composite:rendered");
      });

      return compositeRendered.promise();
    },

    // Render the collection for the composite view
    renderCollection: function(){
      var collectionDeferred = Marionette.CollectionView.prototype.render.apply(this, arguments);
      collectionDeferred.done(function(){
        this.trigger("composite:collection:rendered");
      });
      return collectionDeferred.promise();
    },

    // Render an individual model, if we have one, as
    // part of a composite view (branch / leaf). For example:
    // a treeview.
    renderModel: function(){
      var data = {};
      if (this.model){
        data = this.model.toJSON();
      }

      var template = this.getTemplateSelector();
      return Marionette.Renderer.render(template, data);
    }
  });

  // Region
  // ------

  // Manage the visual regions of your composite application. See
  // http://lostechies.com/derickbailey/2011/12/12/composite-js-apps-regions-and-region-managers/
  Marionette.Region = function(options){
    this.options = options || {};

    _.extend(this, options);

    if (!this.el){
      var err = new Error("An 'el' must be specified");
      err.name = "NoElError";
      throw err;
    }
  };

  _.extend(Marionette.Region.prototype, Backbone.Events, {

    // Displays a backbone view instance inside of the region.
    // Handles calling the `render` method for you. Reads content
    // directly from the `el` attribute. Also calls an optional
    // `onShow` and `close` method on your view, just after showing
    // or just before closing the view, respectively.
    show: function(view, appendMethod){
      this.ensureEl();

      this.close();
      this.open(view, appendMethod);

      this.currentView = view;
    },

    ensureEl: function(){
      if (!this.$el || this.$el.length == 0){
        this.$el = this.getEl(this.el);
      }
    },

    // Override this method to change how the region finds the
    // DOM element that it manages. Return a jQuery selector object.
    getEl: function(selector){
        return $(selector);
    },

    // Internal method to render and display a view. Not meant
    // to be called from any external code.
    open: function(view, appendMethod){
      var that = this;
      appendMethod = appendMethod || "html";

      $.when(view.render()).then(function () {
        that.$el[appendMethod](view.el);
        view.onShow && view.onShow();
        view.trigger("show");
        that.trigger("view:show", view);
      });
    },

    // Close the current view, if there is one. If there is no
    // current view, it does nothing and returns immediately.
    close: function(){
      var view = this.currentView;
      if (!view){ return; }

      view.close && view.close();
      this.trigger("view:closed", view);

      delete this.currentView;
    },

    // Attach an existing view to the region. This
    // will not call `render` or `onShow` for the new view,
    // and will not replace the current HTML for the `el`
    // of the region.
    attachView: function(view){
      this.currentView = view;
    }
  });

  // Layout
  // ------

  // Formerly known as Composite Region.
  //
  // Used for managing application layouts, nested layouts and
  // multiple regions within an application or sub-application.
  //
  // A specialized view type that renders an area of HTML and then
  // attaches `Region` instances to the specified `regions`.
  // Used for composite view management and sub-application areas.
  Marionette.Layout = Marionette.ItemView.extend({
    constructor: function () {
      this.vent = new Backbone.Marionette.EventAggregator();
      Backbone.Marionette.ItemView.apply(this, arguments);
      this.regionManagers = {};
    },

    render: function () {
      this.initializeRegions();
      return Backbone.Marionette.ItemView.prototype.render.call(this, arguments);
    },

    close: function () {
      this.closeRegions();
      Backbone.Marionette.ItemView.prototype.close.call(this, arguments);
    },

    initializeRegions: function () {
      var that = this;
      _.each(this.regions, function (selector, name) {
        var regionManager = new Backbone.Marionette.Region({
            el: selector,

            getEl: function(selector){
              return that.$(selector);
            }
        });
        that.regionManagers[name] = regionManager;
        that[name] = regionManager;
      });
    },

    closeRegions: function () {
      var that = this;
      _.each(this.regionManagers, function (manager, name) {
        manager.close();
        delete that[name];
      });
      this.regionManagers = {};
    }
  });

  // AppRouter
  // ---------

  // Reduce the boilerplate code of handling route events
  // and then calling a single method on another object.
  // Have your routers configured to call the method on
  // your object, directly.
  //
  // Configure an AppRouter with `appRoutes`.
  //
  // App routers can only take one `controller` object.
  // It is reocmmended that you divide your controller
  // objects in to smaller peices of related functionality
  // and have multiple routers / controllers, instead of
  // just one giant router and controller.
  //
  // You can also add standard routes to an AppRouter.

  Marionette.AppRouter = Backbone.Router.extend({

    constructor: function(options){
      Backbone.Router.prototype.constructor.call(this, options);

      if (this.appRoutes){
        var controller = this.controller;
        if (options && options.controller) {
          controller = options.controller;
        }
        this.processAppRoutes(controller, this.appRoutes);
      }
    },

    processAppRoutes: function(controller, appRoutes){
      var method, methodName;
      var route, routesLength;
      var routes = [];
      var router = this;

      for(route in appRoutes){
        routes.unshift([route, appRoutes[route]]);
      }

      routesLength = routes.length;
      for (var i = 0; i < routesLength; i++){
        route = routes[i][0];
        methodName = routes[i][1];
        method = _.bind(controller[methodName], controller);
        router.route(route, methodName, method);
      }
    }
  });

  // Composite Application
  // ---------------------

  // Contain and manage the composite application as a whole.
  // Stores and starts up `Region` objects, includes an
  // event aggregator as `app.vent`
  Marionette.Application = function(options){
    this.initCallbacks = new Marionette.Callbacks();
    this.vent = new Marionette.EventAggregator();
    _.extend(this, options);
  };

  _.extend(Marionette.Application.prototype, Backbone.Events, {
    // Add an initializer that is either run at when the `start`
    // method is called, or run immediately if added after `start`
    // has already been called.
    addInitializer: function(initializer){
      this.initCallbacks.add(initializer);
    },

    // kick off all of the application's processes.
    // initializes all of the regions that have been added
    // to the app, and runs all of the initializer functions
    start: function(options){
      this.trigger("initialize:before", options);
      this.initCallbacks.run(this, options);
      this.trigger("initialize:after", options);

      this.trigger("start", options);
    },

    // Add regions to your app.
    // Accepts a hash of named strings or Region objects
    // addRegions({something: "#someRegion"})
    // addRegions{{something: Region.extend({el: "#someRegion"}) });
    addRegions: function(regions){
      var regionValue, regionObj;

      for(var region in regions){
        if (regions.hasOwnProperty(region)){
          regionValue = regions[region];

          if (typeof regionValue === "string"){
            regionObj = new Marionette.Region({
              el: regionValue
            });
          } else {
            regionObj = new regionValue;
          }

          this[region] = regionObj;
        }
      }
    }
  });

  // BindTo: Event Binding
  // ---------------------

  // BindTo facilitates the binding and unbinding of events
  // from objects that extend `Backbone.Events`. It makes
  // unbinding events, even with anonymous callback functions,
  // easy.
  //
  // Thanks to Johnny Oshika for this code.
  // http://stackoverflow.com/questions/7567404/backbone-js-repopulate-or-recreate-the-view/7607853#7607853
  Marionette.BindTo = {
    // Store the event binding in array so it can be unbound
    // easily, at a later point in time.
    bindTo: function (obj, eventName, callback, context) {
      context = context || this;
      obj.on(eventName, callback, context);

      if (!this.bindings) this.bindings = [];

      this.bindings.push({
        obj: obj,
        eventName: eventName,
        callback: callback,
        context: context
      });
    },

    // Unbind all of the events that we have stored.
    unbindAll: function () {
      _.each(this.bindings, function (binding) {
        binding.obj.off(binding.eventName, binding.callback);
      });

      this.bindings = [];
    }
  };

  // Callbacks
  // ---------

  // A simple way of managing a collection of callbacks
  // and executing them at a later point in time, using jQuery's
  // `Deferred` object.
  Marionette.Callbacks = function(){
    this.deferred = $.Deferred();
    this.promise = this.deferred.promise();
  };

  _.extend(Marionette.Callbacks.prototype, {

    // Add a callback to be executed. Callbacks added here are
    // guaranteed to execute, even if they are added after the
    // `run` method is called.
    add: function(callback){
      this.promise.done(function(context, options){
        callback.call(context, options);
      });
    },

    // Run all registered callbacks with the context specified.
    // Additional callbacks can be added after this has been run
    // and they will still be executed.
    run: function(context, options){
      this.deferred.resolve(context, options);
    }
  });

  // Event Aggregator
  // ----------------

  // A pub-sub object that can be used to decouple various parts
  // of an application through event-driven architecture.
  Marionette.EventAggregator = function(options){
    _.extend(this, options);
  };

  _.extend(Marionette.EventAggregator.prototype, Backbone.Events, Marionette.BindTo, {
    // Assumes the event aggregator itself is the
    // object being bound to.
    bindTo: function(eventName, callback, context){
      Marionette.BindTo.bindTo.call(this, this, eventName, callback, context);
    }
  });

  // Template Cache
  // --------------

  // Manage templates stored in `<script>` blocks,
  // caching them for faster access.
  Marionette.TemplateCache = {
    templates: {},
    loaders: {},

    // Get the specified template by id. Either
    // retrieves the cached version, or loads it
    // from the DOM.
    get: function(templateId){
      var that = this;
      var templateRetrieval = $.Deferred();
      var cachedTemplate = this.templates[templateId];

      if (cachedTemplate){
        templateRetrieval.resolve(cachedTemplate);
      } else {
        var loader = this.loaders[templateId];
        if(loader) {
          templateRetrieval = loader;
        } else {
          this.loaders[templateId] = templateRetrieval;

          this.loadTemplate(templateId, function(template){
            delete that.loaders[templateId];
            that.templates[templateId] = template;
            templateRetrieval.resolve(template);
          });
        }

      }

      return templateRetrieval.promise();
    },

    // Load a template from the DOM, by default. Override
    // this method to provide your own template retrieval,
    // such as asynchronous loading from a server.
    loadTemplate: function(templateId, callback){
      var template = $(templateId).html();
      callback.call(this, template);
    },

    // Clear templates from the cache. If no arguments
    // are specified, clears all templates:
    // `clear()`
    //
    // If arguments are specified, clears each of the
    // specified templates from the cache:
    // `clear("#t1", "#t2", "...")`
    clear: function(){
      var length = arguments.length;
      if (length > 0){
        for(var i=0; i<length; i++){
          delete this.templates[arguments[i]];
        }
      } else {
        this.templates = {};
      }
    }
  };

  // Renderer
  // --------

  // Render a template with data by passing in the template
  // selector and the data to render.
  Marionette.Renderer = {

    // Render a template with data. The `template` parameter is
    // passed to the `TemplateCache` object to retrieve the
    // actual template. Override this method to provide your own
    // custom rendering and template handling for all of Marionette.
    render: function(template, data){
      var that = this;
      var asyncRender = $.Deferred();

      var templateRetrieval = Marionette.TemplateCache.get(template);

      $.when(templateRetrieval).then(function(template){
        var html = that.renderTemplate(template, data);
        asyncRender.resolve(html);
      });

      return asyncRender.promise();
    },

    // Default implementation uses underscore.js templates. Override
    // this method to use your own templating engine.
    renderTemplate: function(template, data){
      if (!template || template.length === 0){
        var msg = "A template must be specified";
        var err = new Error(msg);
        err.name = "NoTemplateError";
        throw err;
      }

      var html = _.template(template, data);
      return html;
    }

  }

  // Helpers
  // -------

  // For slicing `arguments` in functions
  var slice = Array.prototype.slice;

  // Copy the `extend` function used by Backbone's classes
  var extend = Marionette.View.extend;
  Marionette.Region.extend = extend;
  Marionette.Application.extend = extend;

  // Copy the features of `BindTo` on to these objects
  _.extend(Marionette.View.prototype, Marionette.BindTo);
  _.extend(Marionette.Application.prototype, Marionette.BindTo);
  _.extend(Marionette.Region.prototype, Marionette.BindTo);

  return Marionette;
})(Backbone, _, window.jQuery || window.Zepto || window.ender);

;
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

window._gaq = [];
_gaq.push(['_setAccount', 'UA-34226123-1']);
_gaq.push(['_setDomainName', 'cliclip.com']);
_gaq.push(['_addOrganic', 'google', 'as_q']);
_gaq.push(['_addOrganic', 'baidu', 'word']);
_gaq.push(['_addOrganic', 'baidu', 'w']);
_gaq.push(['_addOrganic', 'baidu', 'q1']);
_gaq.push(['_addOrganic', 'baidu', 'q2']);
_gaq.push(['_addOrganic', 'baidu', 'q3']);
_gaq.push(['_addOrganic', 'baidu', 'q4']);
_gaq.push(['_addOrganic', 'baidu', 'q5']);
_gaq.push(['_addOrganic', 'baidu', 'q6']);
_gaq.push(['_addOrganic', 'soso', 'w']);
_gaq.push(['_addOrganic', 'youdao', 'q']);
_gaq.push(['_addOrganic', 'sogou', 'query']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*
(function(App, Backbone, $){

  App.vent.bind("app.clipapp.ga:track_homepage",function(){
    var now =new Date().getTime();
    var page_load_time=now-window.performance.timing.fetchStart;
    var hourInMillis = 1000 * 60 * 60;
    if(0 < page_load_time && page_load_time < hourInMillis){ // avoid sending bad data
      _gaq.push(['_trackTiming', '/#', "Load Home_page", page_load_time]);
    }
  });

})(App, Backbone, jQuery);
*/
/*!
 * Modernizr v2.6.2pre
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.6.2pre',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body ? body : document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = "";
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      !body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#modernizr:after{content:"',smile,'";visibility:hidden}'].join(''), function( node ) {
          bool = node.offsetHeight >= 1;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /*! HTML5 Shiv v3.6 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed */
    ;(function(window, document) {
    /*jshint evil:true */
      /** Preset options */
      var options = window.html5 || {};

      /** Used to skip problem elements */
      var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

      /** Not all elements can be cloned in IE (this list can be shortend) **/
      var saveClones = /^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i;

      /** Detect whether the browser supports default html5 styles */
      var supportsHtml5Styles;

      /** Name of the expando, to work with multiple documents or to re-shiv one document */
      var expando = '_html5shiv';

      /** The id for the the documents expando */
      var expanID = 0;

      /** Cached data for each document */
      var expandoData = {};

      /** Detect whether the browser supports unknown elements */
      var supportsUnknownElements;

      (function() {
        try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
        } catch(e) {
          supportsHtml5Styles = true;
          supportsUnknownElements = true;
        }

      }());

      /*--------------------------------------------------------------------------*/

      /**
       * Creates a style sheet with the given CSS text and adds it to the document.
       * @private
       * @param {Document} ownerDocument The document.
       * @param {String} cssText The CSS text.
       * @returns {StyleSheet} The style element.
       */
      function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
      }

      /**
       * Returns the value of `html5.elements` as an array.
       * @private
       * @returns {Array} An array of shived element node names.
       */
      function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
      }

        /**
       * Returns the data associated to the given document
       * @private
       * @param {Document} ownerDocument The document.
       * @returns {Object} An object of data.
       */
      function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
      }

      /**
       * returns a shived element for the given nodeName and document
       * @memberOf html5
       * @param {String} nodeName name of the element
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived element.
       */
      function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
        }
        if (!data) {
            data = getExpandoData(ownerDocument);
        }
        var node;

        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }

        // Avoid adding some elements to fragments in IE < 9 because
        // * Attributes like `name` or `type` cannot be set/changed once an element
        //   is inserted into a document/fragment
        // * Link elements with `src` attributes that are inaccessible, as with
        //   a 403 response, will cause the tab/window to crash
        // * Script elements appended to fragments will execute when their `src`
        //   or `text` property is set
        return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
      }

      /**
       * returns a shived DocumentFragment for the given document
       * @memberOf html5
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived DocumentFragment.
       */
      function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;
        for(;i<l;i++){
            clone.createElement(elems[i]);
        }
        return clone;
      }

      /**
       * Shivs the `createElement` and `createDocumentFragment` methods of the document.
       * @private
       * @param {Document|DocumentFragment} ownerDocument The document.
       * @param {Object} data of the document.
       */
      function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
          //abort shiv
          if (!html5.shivMethods) {
              return data.createElem(nodeName);
          }
          return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
          'var n=f.cloneNode(),c=n.createElement;' +
          'h.shivMethods&&(' +
            // unroll the `createElement` calls
            getElements().join().replace(/\w+/g, function(nodeName) {
              data.createElem(nodeName);
              data.frag.createElement(nodeName);
              return 'c("' + nodeName + '")';
            }) +
          ');return n}'
        )(html5, data.frag);
      }

      /*--------------------------------------------------------------------------*/

      /**
       * Shivs the given document.
       * @memberOf html5
       * @param {Document} ownerDocument The document to shiv.
       * @returns {Document} The shived document.
       */
      function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
          data.hasCSS = !!addStyleSheet(ownerDocument,
            // corrects block display not defined in IE6/7/8/9
            'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
            // adds styling not present in IE6/7/8/9
            'mark{background:#FF0;color:#000}'
          );
        }
        if (!supportsUnknownElements) {
          shivMethods(ownerDocument, data);
        }
        return ownerDocument;
      }

      /*--------------------------------------------------------------------------*/

      /**
       * The `html5` object is exposed so that more elements can be shived and
       * existing shiving can be detected on iframes.
       * @type Object
       * @example
       *
       * // options can be changed before the script is included
       * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
       */
      var html5 = {

        /**
         * An array or space separated string of node names of the elements to shiv.
         * @memberOf html5
         * @type Array|String
         */
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

        /**
         * A flag to indicate that the HTML5 style sheet should be inserted.
         * @memberOf html5
         * @type Boolean
         */
        'shivCSS': (options.shivCSS !== false),

        /**
         * Is equal to true if a browser supports creating unknown/HTML5 elements
         * @memberOf html5
         * @type boolean
         */
        'supportsUnknownElements': supportsUnknownElements,

        /**
         * A flag to indicate that the document's `createElement` and `createDocumentFragment`
         * methods should be overwritten.
         * @memberOf html5
         * @type Boolean
         */
        'shivMethods': (options.shivMethods !== false),

        /**
         * A string to describe the type of `html5` object ("default" or "default print").
         * @memberOf html5
         * @type String
         */
        'type': 'default',

        // shivs the document according to the specified `html5` object options
        'shivDocument': shivDocument,

        //creates a shived element
        createElement: createElement,

        //creates a shived documentFragment
        createDocumentFragment: createDocumentFragment
      };

      /*--------------------------------------------------------------------------*/

      // expose html5
      window.html5 = html5;

      // shiv the document
      shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

/*##############################################################################
 * #    ____________________________________________________________________
 * #   /                                                                    \
 * #  |               ____  __      ___          _____  /     ___    ___     |
 * #  |     ____       /  \/  \  ' /   \      / /      /__   /   \  /   \    |
 * #  |    / _  \     /   /   / / /    /  ___/  \__   /     /____/ /    /    |
 * #  |   / |_  /    /   /   / / /    / /   /      \ /     /      /____/     |
 * #  |   \____/    /   /    \/_/    /  \__/  _____/ \__/  \___/ /           |
 * #  |                                                         /            |
 * #  |                                                                      |
 * #  |   Copyright (c) 2007                             MindStep SCOP SARL  |
 * #  |   Herve Masson                                                       |
 * #  |                                                                      |
 * #  |      www.mindstep.com                              www.mjslib.com    |
 * #  |   info-oss@mindstep.com                           mjslib@mjslib.com  |
 * #   \____________________________________________________________________/
 * #
 * #  Version: 1.0.0
 * #
 * #  (Svn version: $Id: jquery.printf.js 3434 2007-08-27 09:31:20Z herve $)
 * #
 * #----------[This product is distributed under a BSD license]-----------------
 * #
 * #  Redistribution and use in source and binary forms, with or without
 * #  modification, are permitted provided that the following conditions
 * #  are met:
 * #
 * #     1. Redistributions of source code must retain the above copyright
 * #        notice, this list of conditions and the following disclaimer.
 * #
 * #     2. Redistributions in binary form must reproduce the above copyright
 * #        notice, this list of conditions and the following disclaimer in
 * #        the documentation and/or other materials provided with the
 * #        distribution.
 * #
 * #  THIS SOFTWARE IS PROVIDED BY THE MINDSTEP CORP PROJECT ``AS IS'' AND
 * #  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * #  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * #  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL MINDSTEP CORP OR CONTRIBUTORS
 * #  BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * #  OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * #  OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * #  BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * #  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * #  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * #  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * #
 * #  The views and conclusions contained in the software and documentation
 * #  are those of the authors and should not be interpreted as representing
 * #  official policies, either expressed or implied, of MindStep Corp.
 * #
 * ################################################################################
 * #
 * #       This is a jQuery [jquery.com] plugin that implements printf' like functions
 * #       (Examples and documentation at: http://mjslib.com)
 * #
 * #       @author: Herve Masson
 * #       @version: 1.0.0 (8/27/2007)
 * #       @requires jQuery v1.1.2 or later
 * #
 * #       (Based on the legacy mjslib.org framework)
 * #
 * ##############################################################################*/

(function($) {


           /*
	    *         **      Just an equivalent of the corresponding libc function
	    *         **
	    *         **      var str=jQuery.sprintf("%010d %-10s",intvalue,strvalue);
	    *         **
	    *         */

           $.sprintf=function(fmt)
           {
	     return _sprintf_(fmt,arguments,1);
	             }


           /*
	    *         **      vsprintf takes an argument list instead of a list of arguments (duh!)
	    *         **      (useful when forwarding parameters from one of your functions to a printf call)
	    *         **
	    *         **      str=jQuery.vsprintf(parameters[,offset]);
	    *         **
	    *         **              The 'offset' value, when present, instructs vprintf to start at the
	    *         **              corresponding index in the parameter list instead, of 0
	    *         **
	    *         **      Example 1:
	    *         **
	    *         **              function myprintf(<printf like arguments>)
	    *         **              {
	    *         **                      var str=jQuery.vsprintf(arguments);
	    *         **                      ..
	    *         **              }
	    *         **              myprintf("illegal value : %s",somevalue);
	    *         **
	    *         **
	    *         **      Example 2:
	    *         **
	    *         **              function logit(level,<the rest is printf like arguments>)
	    *         **              {
	    *         **                      var str=jQuery.vsprintf(arguments,1);   // Skip prm #1
	    *         **                      ..
	    *         **              }
	    *         **              logit("error","illegal value : %s",somevalue);
	    *         **
	    *         */

   $.vsprintf=function(args,offset)
           {
	                     if(offset === undefined)
			                       {
						 offset=0;
						                 }
	     return _sprintf_(args[offset],args,offset+1);
	             }


           /*
	    *         **      logging using formatted messages
	    *         **      ================================
	    *         **
	    *         **      If you _hate_ debugging with alert() as much as I do, you might find the
	    *         **      following routines valuable.
	    *         **
	    *         **      jQuery.alertf("The variable 'str' contains: '%s'",str);
	    *         **              Show an alert message with a printf-like argument.
	    *         **
	    *         **      jQuery.logf("This is a log message, time is: %d",(new Date()).getTime());
	    *         **              Log the message on the console with the info level
	    *         **
	    *         **      jQuery.errorf("The given value (%d) is erroneous",avalue);
	    *         **              Log the message on the console with the error level
	    *         **
	    *         */

           $.alertf=function()
           {
	     return alert($.vsprintf(arguments));
	             }

           $.vlogf=function(args)
           {
	                     if("console" in window)
			                       {

						 console.info($.vsprintf(args));
						                 }
	             }

   $.verrorf=function(args)
           {

	     if("console" in window)
	                       {

				 console.error($.vsprintf(args));
				                 }
	             }

   $.errorf=function()
           {

	     $.verrorf(arguments);
	             }

   $.logf=function()
           {

	     $.vlogf(arguments);
	             }


           /*-------------------------------------------------------------------------------------------
	    *         **
	    *         **      Following code is private; don't use it directly !
	    *         **
	    *         **-----------------------------------------------------------------------------------------*/

   FREGEXP = /^([^%]*)%([-+])?(0)?(\d+)?(\.(\d+))?([doxXcsf])(.*)$/;
   HDIGITS = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

   function _empty(str)
           {

	     if(str===undefined || str===null)
	                       {

				 return true;
				                 }
	     return (str == "") ? true : false;
	             }

   function _int_(val)
           {

	     return Math.floor(val);
	             }

   function _printf_num_(val,base,pad,sign,width)
           {

	     val=parseInt(val,10);
	     if(isNaN(val))
	                       {

				 return "NaN";
				                 }
	     aval=(val<0)?-val:val;
	     var ret="";

	     if(aval==0)
	                       {

				 ret="0";
				                 }
	                     else
			                       {

						 while(aval>0)
						                           {

									     ret=HDIGITS[aval%base]+ret;
									     aval=_int_(aval/base);
									                             }
						                 }
	     if(val<0)
	                       {

				 ret="-"+ret;
				                 }
	     if(sign=="-")
	                       {

				 pad=" ";
				                 }
	     return _printf_str_(ret,pad,sign,width,-1);
	             }

   function _printf_float_(val,base,pad,sign,prec)
           {

	     if(prec==undefined)
	                       {

				 if(parseInt(val) != val)
				                           {

							                                     // No decimal part and no precision -> use int formatting
							     return ""+val;
							                             }
				 prec=5;
				                 }

	     var p10=Math.pow(10,prec);
	     var ival=""+Math.round(val*p10);
	     var ilen=ival.length-prec;
	     if(ilen==0)
	                       {

				 return "0."+ival.substr(ilen,prec);
				                 }
	     return ival.substr(0,ilen)+"."+ival.substr(ilen,prec);
	             }

   function _printf_str_(val,pad,sign,width,prec)
           {

	     var npad;

	     if(val === undefined)
	                       {

				 return "(undefined)";
				                 }
	     if(val === null)
	                       {

				 return "(null)";
				                 }
	     if((npad=width-val.length)>0)
	                       {

				 if(sign=="-")
				                           {

							     while(npad>0)
							                                       {

												 val+=pad;
												 npad--;
												                                 }
							                             }
				                         else
							                           {

										     while(npad>0)
										                                       {

															 val=pad+val;
															 npad--;
															                                 }
										                             }
				                 }
	     if(prec>0)
	                       {

				 return val.substr(0,prec);
				                 }
	     return val;
	             }

   function _sprintf_(fmt,av,index)
           {

	     var output="";
	     var i,m,line,match;

	     line=fmt.split("\n");
	     for(i=0;i<line.length;i++)
	                       {

				 if(i>0)
				                           {

							     output+="\n";
							                             }
				 fmt=line[i];
				 while(match=FREGEXP.exec(fmt))
				                           {

							     var sign="";
							     var pad=" ";

							     if(!_empty(match[1])) // the left part
                                {

				                                          // You can't add this blindly because mozilla set the value to <undefined> when
                                        // there is no match, and we don't want the "undefined" string be returned !
                                  output+=match[1];
				                                  }
							                                     if(!_empty(match[2])) // the sign (like in %-15s)
                                {
				  sign=match[2];
				                                  }
							                                     if(!_empty(match[3])) // the "0" char for padding (like in %03d)
                                {
				  pad="0";
				                                  }

							     var width=match[4];     // the with (32 in %032d)
							     var prec=match[6];      // the precision (10 in %.10s)
							     var type=match[7];      // the parameter type

							     fmt=match[8];

							     if(index>=av.length)
							                                       {

												 output += "[missing parameter for type '"+type+"']";
												 continue;
												                                 }

							     var val=av[index++];

							     switch(type)
							                                     {

											     case "d":
											       output += _printf_num_(val,10,pad,sign,width);
											       break;
											     case "o":
											       output += _printf_num_(val,8,pad,sign,width);
											       break;
											     case "x":
											       output += _printf_num_(val,16,pad,sign,width);
											       break;
											     case "X":
											       output += _printf_num_(val,16,pad,sign,width).toUpperCase();
											       break;
											     case "c":
											       output += String.fromCharCode(parseInt(val,10));
											       break;
											     case "s":
											       output += _printf_str_(val,pad,sign,width,prec);
											       break;
											     case "f":
											       output += _printf_float_(val,pad,sign,width,prec);
											       break;
											     default:
											       output += "[unknown format '"+type+"']";
											       break;
											                                       }
							                             }
				 output+=fmt;
				                 }
	     return output;
	             }

 })(jQuery);

/**
 * jQuery Masonry v2.1.03
 * A dynamic layout plugin for jQuery
 * The flip-side of CSS Floats
 * http://masonry.desandro.com
 *
 * Licensed under the MIT license.
 * Copyright 2011 David DeSandro
 */

/*jshint browser: true, curly: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: false */

(function( window, $, undefined ){

  'use strict';

  /*
   * smartresize: debounced resize event for jQuery
   *
   * latest version and complete README available on Github:
   * https://github.com/louisremi/jquery.smartresize.js
   *
   * Copyright 2011 @louis_remi
   * Licensed under the MIT license.
   */

  var $event = $.event,
      resizeTimeout;

  $event.special.smartresize = {
    setup: function() {
      $(this).bind( "resize", $event.special.smartresize.handler );
    },
    teardown: function() {
      $(this).unbind( "resize", $event.special.smartresize.handler );
    },
    handler: function( event, execAsap ) {
      // Save the context
      var context = this,
          args = arguments;

      // set correct event type
      event.type = "smartresize";

      if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
      resizeTimeout = setTimeout(function() {
        jQuery.event.handle.apply( context, args );
      }, execAsap === "execAsap"? 0 : 100 );
    }
  };

  $.fn.smartresize = function( fn ) {
    return fn ? this.bind( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
  };



// ========================= Masonry ===============================


  // our "Widget" object constructor
  $.Mason = function( options, element ){
    this.element = $( element );

    this._create( options );
    this._init();
  };

  $.Mason.settings = {
    isResizable: true,
    isAnimated: false,
    animationOptions: {
      queue: false,
      duration: 500
    },
    gutterWidth: 0,
    isRTL: false,
    isFitWidth: false,
    containerStyle: {
      position: 'relative'
    }
  };

  $.Mason.prototype = {

    _filterFindBricks: function( $elems ) {
      var selector = this.options.itemSelector;
      // if there is a selector
      // filter/find appropriate item elements
      return !selector ? $elems : $elems.filter( selector ).add( $elems.find( selector ) );
    },

    _getBricks: function( $elems ) {
      var $bricks = this._filterFindBricks( $elems )
        .css({ position: 'absolute' })
        .addClass('masonry-brick');
      return $bricks;
    },

    // sets up widget
    _create : function( options ) {

      this.options = $.extend( true, {}, $.Mason.settings, options );
      this.styleQueue = [];

      // get original styles in case we re-apply them in .destroy()
      var elemStyle = this.element[0].style;
      this.originalStyle = {
        // get height
        height: elemStyle.height || ''
      };
      // get other styles that will be overwritten
      var containerStyle = this.options.containerStyle;
      for ( var prop in containerStyle ) {
        this.originalStyle[ prop ] = elemStyle[ prop ] || '';
      }

      this.element.css( containerStyle );

      this.horizontalDirection = this.options.isRTL ? 'right' : 'left';

      this.offset = {
        x: parseInt( this.element.css( 'padding-' + this.horizontalDirection ), 10 ),
        y: parseInt( this.element.css( 'padding-top' ), 10 )
      };

      this.isFluid = this.options.columnWidth && typeof this.options.columnWidth === 'function';

      // add masonry class first time around
      var instance = this;
      setTimeout( function() {
        instance.element.addClass('masonry');
      }, 0 );

      // bind resize method
      if ( this.options.isResizable ) {
        $(window).bind( 'smartresize.masonry', function() {
          instance.resize();
        });
      }


      // need to get bricks
      this.reloadItems();

    },

    // _init fires when instance is first created
    // and when instance is triggered again -> $el.masonry();
    _init : function( callback ) {
      this._getColumns();
      this._reLayout( callback );
    },

    option: function( key, value ){
      // set options AFTER initialization:
      // signature: $('#foo').bar({ cool:false });
      if ( $.isPlainObject( key ) ){
        this.options = $.extend(true, this.options, key);
      }
    },

    // ====================== General Layout ======================

    // used on collection of atoms (should be filtered, and sorted before )
    // accepts atoms-to-be-laid-out to start with
    layout : function( $bricks, callback ) {

      // place each brick
      for (var i=0, len = $bricks.length; i < len; i++) {
        this._placeBrick( $bricks[i] );
      }

      // set the size of the container
      var containerSize = {};
      containerSize.height = Math.max.apply( Math, this.colYs );
      if ( this.options.isFitWidth ) {
        var unusedCols = 0;
        i = this.cols;
        // count unused columns
        while ( --i ) {
          if ( this.colYs[i] !== 0 ) {
            break;
          }
          unusedCols++;
        }
        // fit container to columns that have been used;
        containerSize.width = (this.cols - unusedCols) * this.columnWidth - this.options.gutterWidth;
      }
      this.styleQueue.push({ $el: this.element, style: containerSize });

      // are we animating the layout arrangement?
      // use plugin-ish syntax for css or animate
      var styleFn = !this.isLaidOut ? 'css' : (
            this.options.isAnimated ? 'animate' : 'css'
          ),
          animOpts = this.options.animationOptions;

      // process styleQueue
      var obj;
      for (i=0, len = this.styleQueue.length; i < len; i++) {
        obj = this.styleQueue[i];
        obj.$el[ styleFn ]( obj.style, animOpts );
      }

      // clear out queue for next time
      this.styleQueue = [];

      // provide $elems as context for the callback
      if ( callback ) {
        callback.call( $bricks );
      }

      this.isLaidOut = true;
    },

    // calculates number of columns
    // i.e. this.columnWidth = 200
    _getColumns : function() {
      var container = this.options.isFitWidth ? this.element.parent() : this.element,
          containerWidth = container.width();

                         // use fluid columnWidth function if there
      this.columnWidth = this.isFluid ? this.options.columnWidth( containerWidth ) :
                    // if not, how about the explicitly set option?
                    this.options.columnWidth ||
                    // or use the size of the first item
                    this.$bricks.outerWidth(true) ||
                    // if there's no items, use size of container
                    containerWidth;

      this.columnWidth += this.options.gutterWidth;

      this.cols = Math.floor( ( containerWidth + this.options.gutterWidth ) / this.columnWidth );
      this.cols = Math.max( this.cols, 1 );

    },

    // layout logic
    _placeBrick: function( brick ) {
      var $brick = $(brick),
          colSpan, groupCount, groupY, groupColY, j;

      //how many columns does this brick span
      colSpan = Math.ceil( $brick.outerWidth(true) /
        ( this.columnWidth + this.options.gutterWidth ) );
      colSpan = Math.min( colSpan, this.cols );

      if ( colSpan === 1 ) {
        // if brick spans only one column, just like singleMode
        groupY = this.colYs;
      } else {
        // brick spans more than one column
        // how many different places could this brick fit horizontally
        groupCount = this.cols + 1 - colSpan;
        groupY = [];

        // for each group potential horizontal position
        for ( j=0; j < groupCount; j++ ) {
          // make an array of colY values for that one group
          groupColY = this.colYs.slice( j, j+colSpan );
          // and get the max value of the array
          groupY[j] = Math.max.apply( Math, groupColY );
        }

      }

      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, groupY ),
          shortCol = 0;

      // Find index of short column, the first from the left
      for (var i=0, len = groupY.length; i < len; i++) {
        if ( groupY[i] === minimumY ) {
          shortCol = i;
          break;
        }
      }

      // position the brick
      var position = {
        top: minimumY + this.offset.y
      };
      // position.left or position.right
      position[ this.horizontalDirection ] = this.columnWidth * shortCol + this.offset.x;
      this.styleQueue.push({ $el: $brick, style: position });

      // apply setHeight to necessary columns
      var setHeight = minimumY + $brick.outerHeight(true),
          setSpan = this.cols + 1 - len;
      for ( i=0; i < setSpan; i++ ) {
        this.colYs[ shortCol + i ] = setHeight;
      }

    },


    resize: function() {
      var prevColCount = this.cols;
      // get updated colCount
      this._getColumns();
      if ( this.isFluid || this.cols !== prevColCount ) {
        // if column count has changed, trigger new layout
        this._reLayout();
      }
    },


    _reLayout : function( callback ) {
      // reset columns
      var i = this.cols;
      this.colYs = [];
      while (i--) {
        this.colYs.push( 0 );
      }
      // apply layout logic to all bricks
      this.layout( this.$bricks, callback );
    },

    // ====================== Convenience methods ======================

    // goes through all children again and gets bricks in proper order
    reloadItems : function() {
      this.$bricks = this._getBricks( this.element.children() );
    },


    reload : function( callback ) {
      this.reloadItems();
      this._init( callback );
    },


    // convienence method for working with Infinite Scroll
    appended : function( $content, isAnimatedFromBottom, callback ) {
      if ( isAnimatedFromBottom ) {
        // set new stuff to the bottom
        this._filterFindBricks( $content ).css({ top: this.element.height() });
        var instance = this;
        setTimeout( function(){
          instance._appended( $content, callback );
        }, 1 );
      } else {
        this._appended( $content, callback );
      }
    },

    _appended : function( $content, callback ) {
      var $newBricks = this._getBricks( $content );
      // add new bricks to brick pool
      this.$bricks = this.$bricks.add( $newBricks );
      this.layout( $newBricks, callback );
    },

    // removes elements from Masonry widget
    remove : function( $content ) {
      this.$bricks = this.$bricks.not( $content );
      $content.remove();
    },

    // destroys widget, returns elements and container back (close) to original style
    destroy : function() {

      this.$bricks
        .removeClass('masonry-brick')
        .each(function(){
          this.style.position = '';
          this.style.top = '';
          this.style.left = '';
        });

      // re-apply saved container styles
      var elemStyle = this.element[0].style;
      for ( var prop in this.originalStyle ) {
        elemStyle[ prop ] = this.originalStyle[ prop ];
      }

      this.element
        .unbind('.masonry')
        .removeClass('masonry')
        .removeData('masonry');

      $(window).unbind('.masonry');

    }

  };


  // ======================= imagesLoaded Plugin ===============================
  /*!
   * jQuery imagesLoaded plugin v1.1.0
   * http://github.com/desandro/imagesloaded
   *
   * MIT License. by Paul Irish et al.
   */


  // $('#my-container').imagesLoaded(myFunction)
  // or
  // $('img').imagesLoaded(myFunction)

  // execute a callback when all images have loaded.
  // needed because .load() doesn't work on cached images

  // callback function gets image collection as argument
  //  `this` is the container

  $.fn.imagesLoaded = function( callback ) {
    var $this = this,
        $images = $this.find('img').add( $this.filter('img') ),
        len = $images.length,
        blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        loaded = [];

    function triggerCallback() {
      callback.call( $this, $images );
    }

    function imgLoaded( event ) {
      var img = event.target;
      if ( $(img).attr("src") !== blank && $.inArray( img, loaded ) === -1 ){
        loaded.push( img );
        if ( --len <= 0 ){
          setTimeout( triggerCallback );
          $images.unbind( '.imagesLoaded', imgLoaded );
        }
      }
    }

    // if no images, trigger immediately
    if ( !len ) {
      triggerCallback();
    }

    $images.bind( 'load.imagesLoaded error.imagesLoaded',  imgLoaded ).each( function() {
      // cached images don't fire load sometimes, so we reset src.
      var src = $(this).attr("src");
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      // data uri bypasses webkit log warning (thx doug jones)
      $(this).attr("src",blank);
      $(this).attr("src",src);
    });

    return $this;
  };


  // helper function for logging errors
  // $.error breaks jQuery chaining
  var logError = function( message ) {
    if ( window.console ) {
      window.console.error( message );
    }
  };

  // =======================  Plugin bridge  ===============================
  // leverages data method to either create or return $.Mason constructor
  // A bit from jQuery UI
  //   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
  // A bit from jcarousel
  //   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

  $.fn.masonry = function( options ) {
    if ( typeof options === 'string' ) {
      // call method
      var args = Array.prototype.slice.call( arguments, 1 );

      this.each(function(){
        var instance = $.data( this, 'masonry' );
        if ( !instance ) {
          logError( "cannot call methods on masonry prior to initialization; " +
            "attempted to call method '" + options + "'" );
          return;
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
          logError( "no such method '" + options + "' for masonry instance" );
          return;
        }
        // apply method
        instance[ options ].apply( instance, args );
      });
    } else {
      this.each(function() {
        var instance = $.data( this, 'masonry' );
        if ( instance ) {
          // apply options & init
          instance.option( options || {} );
          instance._init();
        } else {
          // initialize new instance
          $.data( this, 'masonry', new $.Mason( options, this ) );
        }
      });
    }
    return this;
  };

})( window, jQuery );
/*

	jQuery Tags Input Plugin 1.3.3

	Copyright (c) 2011 XOXCO, Inc

	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input

	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

  var delimiter = new Array();
  var tags_callbacks = new Array();
  $.fn.doAutosize = function(o){
    var minWidth = $(this).data('minwidth'),
    maxWidth = $(this).data('maxwidth'),
    val = '',
    input = $(this),
    testSubject = $('#'+$(this).data('tester_id'));

    if (val === (val = input.val())) {return;}

    // Enter new content into testSubject
    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    testSubject.html(escaped);
    // Calculate new width + whether to change
    var testerWidth = testSubject.width(),
    newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
    currentWidth = input.width(),
    isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
			   || (newWidth > minWidth && newWidth < maxWidth);

    // Animate width
    if (isValidWidthChange) {
       input.width(newWidth);
     }
  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
    maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
    val = '',
    input = $(this),
    testSubject = $('<tester/>').css({
      position: 'absolute',
      top: -9999,
      left: -9999,
      width: 'auto',
      fontSize: input.css('fontSize'),
      fontFamily: input.css('fontFamily'),
      fontWeight: input.css('fontWeight'),
      letterSpacing: input.css('letterSpacing'),
      whiteSpace: 'nowrap'
    }),
    testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };

  $.fn.addTag = function(value,options) {
    options = jQuery.extend({focus:false,callback:true},options);
    this.each(function() {
      var id = $(this).attr('id');
      var tagslist = $(this).val().split(delimiter[id]);
      if (tagslist[0] == '') {
	tagslist = new Array();
      }
      value = jQuery.trim(value.toLocaleLowerCase());
      // console.log("value :: " + value);
      if (options.unique) {
	var skipTag = $(tagslist).tagExist(value);
	if(skipTag == true) {
	  //Marks fake input as not_valid to let styling it
    	  $('#'+id+'_tag').addClass('not_valid');
    	}
      } else {
	var skipTag = false;
      }
      if (value !='' && skipTag != true) {
        $('<span>').addClass('tag').append(
	  $('<span>').text(value),
	  "<a>&nbsp;&nbsp;&nbsp;</a>",
	  $('<a>', {
              href  : '#',
              title : 'Removing tag',
              text  : ' X'
	  }).addClass('del').click(function () {
	    return $('#' + id).removeTag(escape(value));
	  })
	).mouseover(function(e){
	  $($(e.currentTarget)[0].children[1]).hide();
	  $($(e.currentTarget)[0].children[2]).show();
	}).mouseout(function(e){
	  $($(e.currentTarget)[0].children[1]).show();
	  $($(e.currentTarget)[0].children[2]).hide();
	})
	.insertBefore('#' + id + '_addTag');
	tagslist.push(value);
	$('#'+id+'_tag').val('');
	if (options.focus) {
	  $('#'+id+'_tag').focus();
	} else {
	  $('#'+id+'_tag').blur();
	}
	$.fn.tagsInput.updateTagsField(this,tagslist);
	if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
	  var f = tags_callbacks[id]['onAddTag'];
	  f.call(this, value);
	}
	if(tags_callbacks[id] && tags_callbacks[id]['onChange']){
	  var i = tagslist.length;
	  var f = tags_callbacks[id]['onChange'];
	  f.call(this, $(this), tagslist[i-1]);
	}
      }
    });
    return false;
  };

  $.fn.removeTag = function(value) {
    value = unescape(value);
    this.each(function() {
      var id = $(this).attr('id');
      var old = $(this).val().split(delimiter[id]);
      $('#'+id+'_tagsinput .tag').remove();
      str = '';
      for (i=0; i< old.length; i++) {
	if (old[i]!=value) {
	  str = str + delimiter[id] +old[i];
	}
      }
      $.fn.tagsInput.importTags(this,str);
      if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
	var f = tags_callbacks[id]['onRemoveTag'];
	f.call(this, value);
      }
    });
    return false;
  };

  $.fn.tagExist = function(val) {
    return (jQuery.inArray(val, $(this)) >= 0); //true when tag exists, false when not
  };

  // clear all existing tags and import new ones from a string
  $.fn.importTags = function(str) {
    id = $(this).attr('id');
    $('#'+id+'_tagsinput .tag').remove();
    $.fn.tagsInput.importTags(this,str);
  };

  $.fn.tagsInput = function(options) {
    var settings = jQuery.extend({
      interactive:true,
      defaultText:_i18n('tag.add_tag'),
      //defaultText:'add a tag',
      minChars:0,
      maxChars:10,
      width:'270px',
      height:'75px',
      autocomplete: {selectFirst: false },
      'hide':true,
      'delimiter':',',
      'unique':true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

    this.each(function() {
      if (settings.hide) {$(this).hide();}
      var id = $(this).attr('id');

      var data = jQuery.extend({
	pid:id,
	real_input: '#'+id,
	holder: '#'+id+'_tagsinput',
	input_wrapper: '#'+id+'_addTag',
	fake_input: '#'+id+'_tag'
      },settings);
      delimiter[id] = data.delimiter;

      if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
	tags_callbacks[id] = new Array();
	tags_callbacks[id]['onAddTag'] = settings.onAddTag;
	tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
	tags_callbacks[id]['onChange'] = settings.onChange;
      }

      var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';

      if (settings.interactive) {
	markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" maxlength="10"/><div class="taglistDiv" style="display:none;" ></div>';
      }

      markup = markup + '</div><div class="tags_clear"></div></div>';

      $(markup).insertAfter(this);

      $(data.holder).css('width',settings.width);
      $(data.holder).css('min-height',settings.height);

      if ($(data.real_input).val()!='') {
	$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
      }
      if (settings.interactive) {
	$(data.fake_input).val($(data.fake_input).attr('data-default'));
	$(data.fake_input).css('color',settings.placeholderColor);
	$(data.fake_input).resetAutosize(settings);

	$(data.holder).bind('click',data,function(event) {
	    $(event.data.fake_input).focus();
	});
	if(false){//  /msie/i.test(navigator.userAgent)){
	  $(data.fake_input).bind('propertychange',data,function(event) {
	    //console.dir(event);
	    var str = $.trim($(data.fake_input).val());
	    App.vent.trigger("app.tagsinput:taglist",str);
	    if( $(".taglistDiv").children().children().length != 0){
	      $(".taglistDiv").show();
	    }else{
	      $(".taglistDiv").hide();
	    }
	  });
	}else{
	  $(data.fake_input).bind('input',data,function(event) {
	    var str = $.trim($(data.fake_input).val());
	    App.vent.trigger("app.tagsinput:taglist",str);
	    if( $(".taglistDiv").children().children().length != 0){
	      $(".taglistDiv").show();
	    }else{
	      $(".taglistDiv").hide();
	    }
	  });
	}

	$(data.fake_input).bind('click',data,function(event) {
	  var str = $.trim($(data.fake_input).val());
	  App.vent.trigger("app.tagsinput:taglist",str);
	});

	var hide_dropdownlist=true;
	$(".taglistDiv").bind('mouseover', function(event){
	  hide_dropdownlist=false;
	});

	$(".taglistDiv").bind('mouseout', function(event){
	  hide_dropdownlist=true;
	});

	$(data.fake_input).bind('blur',function(event) {
	  if (hide_dropdownlist) {
	    setTimeout(function(){
	      App.vent.trigger("app.clipapp.taglist:close");
	      $(".taglistDiv").hide();
	    },200);
	  } else {
	    //event.stopPropagation();
	    //hide_dropdownlist = true;
	    $(data.fake_input).focus();
	  }
	});

	App.vent.unbind("app.clipapp.taglist:gettag");// 解决请求多次的问题
	App.vent.bind("app.clipapp.taglist:gettag",function(tag){
	  if(tag){
	    $(data.real_input).addTag(tag,{focus:true,unique:(settings.unique)});
	    App.vent.trigger("app.tagsinput:taglist");
	  }
	});

	$(data.fake_input).bind('focus',data,function(event) {
	  $("#"+id+"_tag").siblings("span.error").remove();
	  $("#"+id+"_tag").removeClass("error");
	  if( $(".taglistDiv").children().children().length != 0){
	    $(".taglistDiv").show();
	  }else{
	    $(".taglistDiv").hide();
	  }
	});

	$(data.fake_input).bind('focus',data,function(event) {
	  if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) {
	    $(event.data.fake_input).val('');
	  }
	  $(event.data.fake_input).css('color','#000000');
	});

	if (settings.autocomplete_url != undefined) {
	  autocomplete_options = {source: settings.autocomplete_url};
	  for (attrname in settings.autocomplete) {
	    autocomplete_options[attrname] = settings.autocomplete[attrname];
	  }

	  if (jQuery.Autocompleter !== undefined) {
	    $(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
	    $(data.fake_input).bind('result',data,function(event,data,formatted) {
	      if (data) {
		$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
	      }
	    });
	  } else if (jQuery.ui.autocomplete !== undefined) {
	    $(data.fake_input).autocomplete(autocomplete_options);
	    $(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
	      $(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
	      return false;
	    });
	  }
	} else {
	  // if a user tabs out of the field, create a new tag
	  // this is only available if autocomplete is not used.
	  $(data.fake_input).bind('blur',data,function(event) {
	    var d = $(this).attr('data-default');
	    if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) {
	      var len = 0;
	      var tag = $(event.data.fake_input).val();
	      for(i=0;i<tag.length;i++){
		if(tag.charCodeAt(i)>256){
		  len   +=   2;
		}else{
		  len++;
		}
	      }
	      if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= len)) ){
		$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});}else{
		  var error = _i18n("tag.beyond");
		  $("#"+id+"_tag").after("<span class='error'>"+error+"</span>");
		  App.vent.trigger("app.clipapp.tagsinput:error");
	      }
	    } else {
	      $(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
	      $(event.data.fake_input).css('color',settings.placeholderColor);
	    }
	    return false;
	  });
	}
	// if user types a comma, create a new tag
	$(data.fake_input).bind('keypress',data,function(event) {
	  if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
	    var len = 0;
	    var tag = $(event.data.fake_input).val();
	    for(i=0;i<tag.length;i++){
	      if(tag.charCodeAt(i)>256){
		len   +=   2;
	      }else{
		len++;
	      }
	    }
	    if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= len)) ){
              $(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
	    }else{
	      var error = _i18n("tag.beyond");
	      $("#"+id+"_tag").after("<span class='error'>"+error+"</span>");
	    }
	    $(event.data.fake_input).resetAutosize(settings);
	    App.vent.trigger("app.tagsinput:taglist");
	    return false;
	  } else if (event.data.autosize) {
	    $(event.data.fake_input).doAutosize(settings);
	  }
	});
	 //Delete last tag on backspace
	 data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event){
	 if(event.keyCode == 8 && $(this).val() == ''){
/*	   event.preventDefault();
	   var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
	   var id = $(this).attr('id').replace(/_tag$/, '');
	   last_tag = last_tag.replace(/[\s]+x$/, '');
	   $('#' + id).removeTag(escape(last_tag));
	   $(this).trigger('focus');*/
	 }else if(event.keyCode == 38){ // Down
	   var flag = true;
	   var div = $(".taglistDiv").children().children();
	   for(var i=0;i<div.length;i++){
	     if(flag && $(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	     $(div[i]).css("background-color","");
	     $(div[i-1]).css("background-color","#888");
	     $(data.fake_input).val($(div[i-1]).text());
	     flag = false;
	     }
	   }
	   if(flag){
	     $(div[div.length-1]).css("background-color","#888");
	     $(data.fake_input).val($(div[length-1]).text());
	   }
	 }else if(event.keyCode == 40){ // UP
	   var flag = true;
	   var div = $(".taglistDiv").children().children();
	   for(var i=0;i<div.length;i++){
	     if(flag && $(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	     $(div[i]).css("background-color","");
	     $(div[i+1]).css("background-color","#888");
	     $(data.fake_input).val($(div[i+1]).text());
	     flag = false;
	     }
	   }
	   if(flag){
	     $(div[0]).css("background-color","#888");
	     $(data.fake_input).val($(div[0]).text());
	   }
	 }
       });

	 //$(data.fake_input).blur();

	 //Removes the not_valid class when user changes the value of the fake input
	 if(data.unique) {
	   $(data.fake_input).keydown(function(event){
	     if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
	       $(this).removeClass('not_valid');
	     }
	   });
	 }
       } // if settings.interactive
	 return false;
       });
       return this;
   };

   $.fn.tagsInput.updateTagsField = function(obj,tagslist) {
     var id = $(obj).attr('id');
       $(obj).val(tagslist.join(delimiter[id]));
   };

   $.fn.tagsInput.importTags = function(obj,val) {
     $(obj).val('');
     var id = $(obj).attr('id');
     var tags = val.split(delimiter[id]);
     for (i=0; i<tags.length; i++) {
       $(obj).addTag(tags[i],{focus:false,callback:false});
     }
     if(tags_callbacks[id] && tags_callbacks[id]['onChange']){
       var f = tags_callbacks[id]['onChange'];
       f.call(obj, obj, tags[i]);
     }
   };

})(jQuery);

/**
 * easyXDM
 * http://easyxdm.net/
 * Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function (window, document, location, setTimeout, decodeURIComponent, encodeURIComponent) {
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global JSON, XMLHttpRequest, window, escape, unescape, ActiveXObject */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var global = this;
var channelId = Math.floor(Math.random() * 10000); // randomize the initial id in case of multiple closures loaded 
var emptyFn = Function.prototype;
var reURI = /^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/; // returns groups for protocol (2), domain (3) and port (4) 
var reParent = /[\-\w]+\/\.\.\//; // matches a foo/../ expression 
var reDoubleSlash = /([^:])\/\//g; // matches // anywhere but in the protocol
var namespace = ""; // stores namespace under which easyXDM object is stored on the page (empty if object is global)
var easyXDM = {};
var _easyXDM = window.easyXDM; // map over global easyXDM in case of overwrite
var IFRAME_PREFIX = "easyXDM_";
var HAS_NAME_PROPERTY_BUG;
var useHash = false; // whether to use the hash over the query
var flashVersion; // will be set if using flash
var HAS_FLASH_THROTTLED_BUG;
var _trace = emptyFn;


// http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
function isHostMethod(object, property){
    var t = typeof object[property];
    return t == 'function' ||
    (!!(t == 'object' && object[property])) ||
    t == 'unknown';
}

function isHostObject(object, property){
    return !!(typeof(object[property]) == 'object' && object[property]);
}

// end

// http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
function isArray(o){
    return Object.prototype.toString.call(o) === '[object Array]';
}

// end
function hasFlash(){
    try {
        var activeX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        flashVersion = Array.prototype.slice.call(activeX.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/), 1);
        HAS_FLASH_THROTTLED_BUG = parseInt(flashVersion[0], 10) > 9 && parseInt(flashVersion[1], 10) > 0;
        activeX = null;
        return true;
    } 
    catch (notSupportedException) {
        return false;
    }
}

/*
 * Cross Browser implementation for adding and removing event listeners.
 */
var on, un;
if (isHostMethod(window, "addEventListener")) {
    on = function(target, type, listener){
        _trace("adding listener " + type);
        target.addEventListener(type, listener, false);
    };
    un = function(target, type, listener){
        _trace("removing listener " + type);
        target.removeEventListener(type, listener, false);
    };
}
else if (isHostMethod(window, "attachEvent")) {
    on = function(object, sEvent, fpNotify){
        _trace("adding listener " + sEvent);
        object.attachEvent("on" + sEvent, fpNotify);
    };
    un = function(object, sEvent, fpNotify){
        _trace("removing listener " + sEvent);
        object.detachEvent("on" + sEvent, fpNotify);
    };
}
else {
    throw new Error("Browser not supported");
}

/*
 * Cross Browser implementation of DOMContentLoaded.
 */
var domIsReady = false, domReadyQueue = [], readyState;
if ("readyState" in document) {
    // If browser is WebKit-powered, check for both 'loaded' (legacy browsers) and
    // 'interactive' (HTML5 specs, recent WebKit builds) states.
    // https://bugs.webkit.org/show_bug.cgi?id=45119
    readyState = document.readyState;
    domIsReady = readyState == "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (readyState == "loaded" || readyState == "interactive"));
}
else {
    // If readyState is not supported in the browser, then in order to be able to fire whenReady functions apropriately
    // when added dynamically _after_ DOM load, we have to deduce wether the DOM is ready or not.
    // We only need a body to add elements to, so the existence of document.body is enough for us.
    domIsReady = !!document.body;
}

function dom_onReady(){
    if (domIsReady) {
        return;
    }
    domIsReady = true;
    _trace("firing dom_onReady");
    for (var i = 0; i < domReadyQueue.length; i++) {
        domReadyQueue[i]();
    }
    domReadyQueue.length = 0;
}


if (!domIsReady) {
    if (isHostMethod(window, "addEventListener")) {
        on(document, "DOMContentLoaded", dom_onReady);
    }
    else {
        on(document, "readystatechange", function(){
            if (document.readyState == "complete") {
                dom_onReady();
            }
        });
        if (document.documentElement.doScroll && window === top) {
            var doScrollCheck = function(){
                if (domIsReady) {
                    return;
                }
                // http://javascript.nwbox.com/IEContentLoaded/
                try {
                    document.documentElement.doScroll("left");
                }
                catch (e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                dom_onReady();
            };
            doScrollCheck();
        }
    }
    
    // A fallback to window.onload, that will always work
    on(window, "load", dom_onReady);
}
/**
 * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
 * If functions are added after this event then they will be executed immediately.
 * @param {function} fn The function to add
 * @param {Object} scope An optional scope for the function to be called with.
 */
function whenReady(fn, scope){
    if (domIsReady) {
        fn.call(scope);
        return;
    }
    domReadyQueue.push(function(){
        fn.call(scope);
    });
}

/**
 * Returns an instance of easyXDM from the parent window with
 * respect to the namespace.
 *
 * @return An instance of easyXDM (in the parent window)
 */
function getParentObject(){
    var obj = parent;
    if (namespace !== "") {
        for (var i = 0, ii = namespace.split("."); i < ii.length; i++) {
            if (!obj) {
                throw new Error(ii.slice(0, i + 1).join('.') + ' is not an object');
            }
            obj = obj[ii[i]];
        }
    }
    if (!obj || !obj.easyXDM) {
        throw new Error('Could not find easyXDM in parent.' + namespace);
    }
    return obj.easyXDM;
}

/**
 * Removes easyXDM variable from the global scope. It also returns control
 * of the easyXDM variable to whatever code used it before.
 *
 * @param {String} ns A string representation of an object that will hold
 *                    an instance of easyXDM.
 * @return An instance of easyXDM
 */
function noConflict(ns){
    if (typeof ns != "string" || !ns) {
        throw new Error('namespace must be a non-empty string');
    }
    _trace("Settings namespace to '" + ns + "'");
    
    window.easyXDM = _easyXDM;
    namespace = ns;
    if (namespace) {
        IFRAME_PREFIX = "easyXDM_" + namespace.replace(".", "_") + "_";
    }
    return easyXDM;
}

/*
 * Methods for working with URLs
 */
/**
 * Get the domain name from a url.
 * @param {String} url The url to extract the domain from.
 * @return The domain part of the url.
 * @type {String}
 */
function getDomainName(url){
    if (!url) {
        throw new Error("url is undefined or empty");
    }
    return url.match(reURI)[3];
}

/**
 * Get the port for a given URL, or "" if none
 * @param {String} url The url to extract the port from.
 * @return The port part of the url.
 * @type {String}
 */
function getPort(url){
    if (!url) {
        throw new Error("url is undefined or empty");
    }
    return url.match(reURI)[4] || "";
}

/**
 * Returns  a string containing the schema, domain and if present the port
 * @param {String} url The url to extract the location from
 * @return {String} The location part of the url
 */
function getLocation(url){
    if (!url) {
        throw new Error("url is undefined or empty");
    }
    if (/^file/.test(url)) {
        throw new Error("The file:// protocol is not supported");
    }
    var m = url.toLowerCase().match(reURI);
    var proto = m[2], domain = m[3], port = m[4] || "";
    if ((proto == "http:" && port == ":80") || (proto == "https:" && port == ":443")) {
        port = "";
    }
    return proto + "//" + domain + port;
}

/**
 * Resolves a relative url into an absolute one.
 * @param {String} url The path to resolve.
 * @return {String} The resolved url.
 */
function resolveUrl(url){
    if (!url) {
        throw new Error("url is undefined or empty");
    }
    
    // replace all // except the one in proto with /
    url = url.replace(reDoubleSlash, "$1/");
    
    // If the url is a valid url we do nothing
    if (!url.match(/^(http||https):\/\//)) {
        // If this is a relative path
        var path = (url.substring(0, 1) === "/") ? "" : location.pathname;
        if (path.substring(path.length - 1) !== "/") {
            path = path.substring(0, path.lastIndexOf("/") + 1);
        }
        
        url = location.protocol + "//" + location.host + path + url;
    }
    
    // reduce all 'xyz/../' to just '' 
    while (reParent.test(url)) {
        url = url.replace(reParent, "");
    }
    
    _trace("resolved url '" + url + "'");
    return url;
}

/**
 * Appends the parameters to the given url.<br/>
 * The base url can contain existing query parameters.
 * @param {String} url The base url.
 * @param {Object} parameters The parameters to add.
 * @return {String} A new valid url with the parameters appended.
 */
function appendQueryParameters(url, parameters){
    if (!parameters) {
        throw new Error("parameters is undefined or null");
    }
    
    var hash = "", indexOf = url.indexOf("#");
    if (indexOf !== -1) {
        hash = url.substring(indexOf);
        url = url.substring(0, indexOf);
    }
    var q = [];
    for (var key in parameters) {
        if (parameters.hasOwnProperty(key)) {
            q.push(key + "=" + encodeURIComponent(parameters[key]));
        }
    }
    return url + (useHash ? "#" : (url.indexOf("?") == -1 ? "?" : "&")) + q.join("&") + hash;
}


// build the query object either from location.query, if it contains the xdm_e argument, or from location.hash
var query = (function(input){
    input = input.substring(1).split("&");
    var data = {}, pair, i = input.length;
    while (i--) {
        pair = input[i].split("=");
        data[pair[0]] = decodeURIComponent(pair[1]);
    }
    return data;
}(/xdm_e=/.test(location.search) ? location.search : location.hash));

/*
 * Helper methods
 */
/**
 * Helper for checking if a variable/property is undefined
 * @param {Object} v The variable to test
 * @return {Boolean} True if the passed variable is undefined
 */
function undef(v){
    return typeof v === "undefined";
}

/**
 * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
 * @return {JSON} A valid JSON conforming object, or null if not found.
 */
var getJSON = function(){
    var cached = {};
    var obj = {
        a: [1, 2, 3]
    }, json = "{\"a\":[1,2,3]}";
    
    if (typeof JSON != "undefined" && typeof JSON.stringify === "function" && JSON.stringify(obj).replace((/\s/g), "") === json) {
        // this is a working JSON instance
        return JSON;
    }
    if (Object.toJSON) {
        if (Object.toJSON(obj).replace((/\s/g), "") === json) {
            // this is a working stringify method
            cached.stringify = Object.toJSON;
        }
    }
    
    if (typeof String.prototype.evalJSON === "function") {
        obj = json.evalJSON();
        if (obj.a && obj.a.length === 3 && obj.a[2] === 3) {
            // this is a working parse method           
            cached.parse = function(str){
                return str.evalJSON();
            };
        }
    }
    
    if (cached.stringify && cached.parse) {
        // Only memoize the result if we have valid instance
        getJSON = function(){
            return cached;
        };
        return cached;
    }
    return null;
};

/**
 * Applies properties from the source object to the target object.<br/>
 * @param {Object} target The target of the properties.
 * @param {Object} source The source of the properties.
 * @param {Boolean} noOverwrite Set to True to only set non-existing properties.
 */
function apply(destination, source, noOverwrite){
    var member;
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            if (prop in destination) {
                member = source[prop];
                if (typeof member === "object") {
                    apply(destination[prop], member, noOverwrite);
                }
                else if (!noOverwrite) {
                    destination[prop] = source[prop];
                }
            }
            else {
                destination[prop] = source[prop];
            }
        }
    }
    return destination;
}

// This tests for the bug in IE where setting the [name] property using javascript causes the value to be redirected into [submitName].
function testForNamePropertyBug(){
    var form = document.body.appendChild(document.createElement("form")), input = form.appendChild(document.createElement("input"));
    input.name = IFRAME_PREFIX + "TEST" + channelId; // append channelId in order to avoid caching issues
    HAS_NAME_PROPERTY_BUG = input !== form.elements[input.name];
    document.body.removeChild(form);
    _trace("HAS_NAME_PROPERTY_BUG: " + HAS_NAME_PROPERTY_BUG);
}

/**
 * Creates a frame and appends it to the DOM.
 * @param config {object} This object can have the following properties
 * <ul>
 * <li> {object} prop The properties that should be set on the frame. This should include the 'src' property.</li>
 * <li> {object} attr The attributes that should be set on the frame.</li>
 * <li> {DOMElement} container Its parent element (Optional).</li>
 * <li> {function} onLoad A method that should be called with the frames contentWindow as argument when the frame is fully loaded. (Optional)</li>
 * </ul>
 * @return The frames DOMElement
 * @type DOMElement
 */
function createFrame(config){
    _trace("creating frame: " + config.props.src);
    if (undef(HAS_NAME_PROPERTY_BUG)) {
        testForNamePropertyBug();
    }
    var frame;
    // This is to work around the problems in IE6/7 with setting the name property. 
    // Internally this is set as 'submitName' instead when using 'iframe.name = ...'
    // This is not required by easyXDM itself, but is to facilitate other use cases 
    if (HAS_NAME_PROPERTY_BUG) {
        frame = document.createElement("<iframe name=\"" + config.props.name + "\"/>");
    }
    else {
        frame = document.createElement("IFRAME");
        frame.name = config.props.name;
    }
    
    frame.id = frame.name = config.props.name;
    delete config.props.name;
    
    if (config.onLoad) {
        on(frame, "load", config.onLoad);
    }
    
    if (typeof config.container == "string") {
        config.container = document.getElementById(config.container);
    }
    
    if (!config.container) {
        // This needs to be hidden like this, simply setting display:none and the like will cause failures in some browsers.
        apply(frame.style, {
            position: "absolute",
            top: "-2000px"
        });
        config.container = document.body;
    }
    
    // HACK for some reason, IE needs the source set
    // after the frame has been appended into the DOM
    // so remove the src, and set it afterwards
    var src = config.props.src;
    delete config.props.src;
    
    // transfer properties to the frame
    apply(frame, config.props);
    
    frame.border = frame.frameBorder = 0;
    frame.allowTransparency = true;
    config.container.appendChild(frame);
    
    // HACK see above
    frame.src = src;
    config.props.src = src;
    
    return frame;
}

/**
 * Check whether a domain is allowed using an Access Control List.
 * The ACL can contain * and ? as wildcards, or can be regular expressions.
 * If regular expressions they need to begin with ^ and end with $.
 * @param {Array/String} acl The list of allowed domains
 * @param {String} domain The domain to test.
 * @return {Boolean} True if the domain is allowed, false if not.
 */
function checkAcl(acl, domain){
    // normalize into an array
    if (typeof acl == "string") {
        acl = [acl];
    }
    var re, i = acl.length;
    while (i--) {
        re = acl[i];
        re = new RegExp(re.substr(0, 1) == "^" ? re : ("^" + re.replace(/(\*)/g, ".$1").replace(/\?/g, ".") + "$"));
        if (re.test(domain)) {
            return true;
        }
    }
    return false;
}

/*
 * Functions related to stacks
 */
/**
 * Prepares an array of stack-elements suitable for the current configuration
 * @param {Object} config The Transports configuration. See easyXDM.Socket for more.
 * @return {Array} An array of stack-elements with the TransportElement at index 0.
 */
function prepareTransportStack(config){
    var protocol = config.protocol, stackEls;
    config.isHost = config.isHost || undef(query.xdm_p);
    useHash = config.hash || false;
    _trace("preparing transport stack");
    
    if (!config.props) {
        config.props = {};
    }
    if (!config.isHost) {
        _trace("using parameters from query");
        config.channel = query.xdm_c;
        config.secret = query.xdm_s;
        config.remote = query.xdm_e;
        protocol = query.xdm_p;
        if (config.acl && !checkAcl(config.acl, config.remote)) {
            throw new Error("Access denied for " + config.remote);
        }
    }
    else {
        config.remote = resolveUrl(config.remote);
        config.channel = config.channel || "default" + channelId++;
        config.secret = Math.random().toString(16).substring(2);
        if (undef(protocol)) {
            if (getLocation(location.href) == getLocation(config.remote)) {
                /*
                 * Both documents has the same origin, lets use direct access.
                 */
                protocol = "4";
            }
            else if (isHostMethod(window, "postMessage") || isHostMethod(document, "postMessage")) {
                /*
                 * This is supported in IE8+, Firefox 3+, Opera 9+, Chrome 2+ and Safari 4+
                 */
                protocol = "1";
            }
            else if (config.swf && isHostMethod(window, "ActiveXObject") && hasFlash()) {
                /*
                 * The Flash transport superseedes the NixTransport as the NixTransport has been blocked by MS
                 */
                protocol = "6";
            }
            else if (navigator.product === "Gecko" && "frameElement" in window && navigator.userAgent.indexOf('WebKit') == -1) {
                /*
                 * This is supported in Gecko (Firefox 1+)
                 */
                protocol = "5";
            }
            else if (config.remoteHelper) {
                /*
                 * This is supported in all browsers that retains the value of window.name when
                 * navigating from one domain to another, and where parent.frames[foo] can be used
                 * to get access to a frame from the same domain
                 */
                config.remoteHelper = resolveUrl(config.remoteHelper);
                protocol = "2";
            }
            else {
                /*
                 * This is supported in all browsers where [window].location is writable for all
                 * The resize event will be used if resize is supported and the iframe is not put
                 * into a container, else polling will be used.
                 */
                protocol = "0";
            }
            _trace("selecting protocol: " + protocol);
        }
        else {
            _trace("using protocol: " + protocol);
        }
    }
    config.protocol = protocol; // for conditional branching
    switch (protocol) {
        case "0":// 0 = HashTransport
            apply(config, {
                interval: 100,
                delay: 2000,
                useResize: true,
                useParent: false,
                usePolling: false
            }, true);
            if (config.isHost) {
                if (!config.local) {
                    _trace("looking for image to use as local");
                    // If no local is set then we need to find an image hosted on the current domain
                    var domain = location.protocol + "//" + location.host, images = document.body.getElementsByTagName("img"), image;
                    var i = images.length;
                    while (i--) {
                        image = images[i];
                        if (image.src.substring(0, domain.length) === domain) {
                            config.local = image.src;
                            break;
                        }
                    }
                    if (!config.local) {
                        _trace("no image found, defaulting to using the window");
                        // If no local was set, and we are unable to find a suitable file, then we resort to using the current window 
                        config.local = window;
                    }
                }
                
                var parameters = {
                    xdm_c: config.channel,
                    xdm_p: 0
                };
                
                if (config.local === window) {
                    // We are using the current window to listen to
                    config.usePolling = true;
                    config.useParent = true;
                    config.local = location.protocol + "//" + location.host + location.pathname + location.search;
                    parameters.xdm_e = config.local;
                    parameters.xdm_pa = 1; // use parent
                }
                else {
                    parameters.xdm_e = resolveUrl(config.local);
                }
                
                if (config.container) {
                    config.useResize = false;
                    parameters.xdm_po = 1; // use polling
                }
                config.remote = appendQueryParameters(config.remote, parameters);
            }
            else {
                apply(config, {
                    channel: query.xdm_c,
                    remote: query.xdm_e,
                    useParent: !undef(query.xdm_pa),
                    usePolling: !undef(query.xdm_po),
                    useResize: config.useParent ? false : config.useResize
                });
            }
            stackEls = [new easyXDM.stack.HashTransport(config), new easyXDM.stack.ReliableBehavior({}), new easyXDM.stack.QueueBehavior({
                encode: true,
                maxLength: 4000 - config.remote.length
            }), new easyXDM.stack.VerifyBehavior({
                initiate: config.isHost
            })];
            break;
        case "1":
            stackEls = [new easyXDM.stack.PostMessageTransport(config)];
            break;
        case "2":
            stackEls = [new easyXDM.stack.NameTransport(config), new easyXDM.stack.QueueBehavior(), new easyXDM.stack.VerifyBehavior({
                initiate: config.isHost
            })];
            break;
        case "3":
            stackEls = [new easyXDM.stack.NixTransport(config)];
            break;
        case "4":
            stackEls = [new easyXDM.stack.SameOriginTransport(config)];
            break;
        case "5":
            stackEls = [new easyXDM.stack.FrameElementTransport(config)];
            break;
        case "6":
            if (!flashVersion) {
                hasFlash();
            }
            stackEls = [new easyXDM.stack.FlashTransport(config)];
            break;
    }
    // this behavior is responsible for buffering outgoing messages, and for performing lazy initialization
    stackEls.push(new easyXDM.stack.QueueBehavior({
        lazy: config.lazy,
        remove: true
    }));
    return stackEls;
}

/**
 * Chains all the separate stack elements into a single usable stack.<br/>
 * If an element is missing a necessary method then it will have a pass-through method applied.
 * @param {Array} stackElements An array of stack elements to be linked.
 * @return {easyXDM.stack.StackElement} The last element in the chain.
 */
function chainStack(stackElements){
    var stackEl, defaults = {
        incoming: function(message, origin){
            this.up.incoming(message, origin);
        },
        outgoing: function(message, recipient){
            this.down.outgoing(message, recipient);
        },
        callback: function(success){
            this.up.callback(success);
        },
        init: function(){
            this.down.init();
        },
        destroy: function(){
            this.down.destroy();
        }
    };
    for (var i = 0, len = stackElements.length; i < len; i++) {
        stackEl = stackElements[i];
        apply(stackEl, defaults, true);
        if (i !== 0) {
            stackEl.down = stackElements[i - 1];
        }
        if (i !== len - 1) {
            stackEl.up = stackElements[i + 1];
        }
    }
    return stackEl;
}

/**
 * This will remove a stackelement from its stack while leaving the stack functional.
 * @param {Object} element The elment to remove from the stack.
 */
function removeFromStack(element){
    element.up.down = element.down;
    element.down.up = element.up;
    element.up = element.down = null;
}

/*
 * Export the main object and any other methods applicable
 */
/** 
 * @class easyXDM
 * A javascript library providing cross-browser, cross-domain messaging/RPC.
 * @version 2.4.15.118
 * @singleton
 */
apply(easyXDM, {
    /**
     * The version of the library
     * @type {string}
     */
    version: "2.4.15.118",
    /**
     * This is a map containing all the query parameters passed to the document.
     * All the values has been decoded using decodeURIComponent.
     * @type {object}
     */
    query: query,
    /**
     * @private
     */
    stack: {},
    /**
     * Applies properties from the source object to the target object.<br/>
     * @param {object} target The target of the properties.
     * @param {object} source The source of the properties.
     * @param {boolean} noOverwrite Set to True to only set non-existing properties.
     */
    apply: apply,
    
    /**
     * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
     * @return {JSON} A valid JSON conforming object, or null if not found.
     */
    getJSONObject: getJSON,
    /**
     * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
     * If functions are added after this event then they will be executed immediately.
     * @param {function} fn The function to add
     * @param {object} scope An optional scope for the function to be called with.
     */
    whenReady: whenReady,
    /**
     * Removes easyXDM variable from the global scope. It also returns control
     * of the easyXDM variable to whatever code used it before.
     *
     * @param {String} ns A string representation of an object that will hold
     *                    an instance of easyXDM.
     * @return An instance of easyXDM
     */
    noConflict: noConflict
});

// Expose helper functions so we can test them
apply(easyXDM, {
    checkAcl: checkAcl,
    getDomainName: getDomainName,
    getLocation: getLocation,
    appendQueryParameters: appendQueryParameters
});
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global console, _FirebugCommandLine,  easyXDM, window, escape, unescape, isHostObject, undef, _trace, domIsReady, emptyFn, namespace */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var debug = {
    _deferred: [],
    flush: function(){
        this.trace("... deferred messages ...");
        for (var i = 0, len = this._deferred.length; i < len; i++) {
            this.trace(this._deferred[i]);
        }
        this._deferred.length = 0;
        this.trace("... end of deferred messages ...");
    },
    getTime: function(){
        var d = new Date(), h = d.getHours() + "", m = d.getMinutes() + "", s = d.getSeconds() + "", ms = d.getMilliseconds() + "", zeros = "000";
        if (h.length == 1) {
            h = "0" + h;
        }
        if (m.length == 1) {
            m = "0" + m;
        }
        if (s.length == 1) {
            s = "0" + s;
        }
        ms = zeros.substring(ms.length) + ms;
        return h + ":" + m + ":" + s + "." + ms;
    },
    /**
     * Logs the message to console.log if available
     * @param {String} msg The message to log
     */
    log: function(msg){
        // Uses memoizing to cache the implementation
        if (!isHostObject(window, "console") || undef(console.log)) {
            /**
             * Sets log to be an empty function since we have no output available
             * @ignore
             */
            this.log = emptyFn;
        }
        else {
            /**
             * Sets log to be a wrapper around console.log
             * @ignore
             * @param {String} msg
             */
            this.log = function(msg){
                console.log(location.host + (namespace ? ":" + namespace : "") + " - " + this.getTime() + ": " + msg);
            };
        }
        this.log(msg);
    },
    /**
     * Will try to trace the given message either to a DOMElement with the id "log",
     * or by using console.info.
     * @param {String} msg The message to trace
     */
    trace: function(msg){
        // Uses memoizing to cache the implementation
        if (!domIsReady) {
            if (this._deferred.length === 0) {
                easyXDM.whenReady(debug.flush, debug);
            }
            this._deferred.push(msg);
            this.log(msg);
        }
        else {
            var el = document.getElementById("log");
            // is there a log element present?
            if (el) {
                /**
                 * Sets trace to be a function that outputs the messages to the DOMElement with id "log"
                 * @ignore
                 * @param {String} msg
                 */
                this.trace = function(msg){
                    try {
                        el.appendChild(document.createElement("div")).appendChild(document.createTextNode(location.host + (namespace ? ":" + namespace : "") + " - " + this.getTime() + ":" + msg));
                        el.scrollTop = el.scrollHeight;
                    } 
                    catch (e) {
                        //In case we are unloading
                    }
                };
            }
            else if (isHostObject(window, "console") && !undef(console.info)) {
                /**
                 * Sets trace to be a wrapper around console.info
                 * @ignore
                 * @param {String} msg
                 */
                this.trace = function(msg){
                    console.info(location.host + (namespace ? ":" + namespace : "") + " - " + this.getTime() + ":" + msg);
                };
            }
            else {
                /**
                 * Create log window
                 * @ignore
                 */
                var domain = location.host, windowname = domain.replace(/\[-.:]/g, "") + "easyxdm_log", logWin;
                try {
                    logWin = window.open("", windowname, "width=800,height=200,status=0,navigation=0,scrollbars=1");
                } 
                catch (e) {
                }
                if (logWin) {
                    var doc = logWin.document;
                    el = doc.getElementById("log");
                    if (!el) {
                        doc.write("<html><head><title>easyXDM log " + domain + "</title></head>");
                        doc.write("<body><div id=\"log\"></div></body></html>");
                        doc.close();
                        el = doc.getElementById("log");
                    }
                    this.trace = function(msg){
                        try {
                            el.appendChild(doc.createElement("div")).appendChild(doc.createTextNode(location.host + (namespace ? ":" + namespace : "") + " - " + this.getTime() + ":" + msg));
                            el.scrollTop = el.scrollHeight;
                        } 
                        catch (e) {
                            //In case we are unloading
                        }
                    };
                    this.trace("---- new logger at " + location.href);
                }
                
                if (!el) {
                    // We are unable to use any logging
                    this.trace = emptyFn;
                }
            }
            this.trace(msg);
        }
    },
    /**
     * Creates a method usable for tracing.
     * @param {String} name The name the messages should be marked with
     * @return {Function} A function that accepts a single string as argument.
     */
    getTracer: function(name){
        return function(msg){
            debug.trace(name + ": " + msg);
        };
    }
};
debug.log("easyXDM present on '" + location.href);
easyXDM.Debug = debug;
_trace = debug.getTracer("{Private}");
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, isHostObject, isHostMethod, un, on, createFrame, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/** 
 * @class easyXDM.DomHelper
 * Contains methods for dealing with the DOM
 * @singleton
 */
easyXDM.DomHelper = {
    /**
     * Provides a consistent interface for adding eventhandlers
     * @param {Object} target The target to add the event to
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    on: on,
    /**
     * Provides a consistent interface for removing eventhandlers
     * @param {Object} target The target to remove the event from
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    un: un,
    /**
     * Checks for the presence of the JSON object.
     * If it is not present it will use the supplied path to load the JSON2 library.
     * This should be called in the documents head right after the easyXDM script tag.
     * http://json.org/json2.js
     * @param {String} path A valid path to json2.js
     */
    requiresJSON: function(path){
        if (!isHostObject(window, "JSON")) {
            debug.log("loading external JSON");
            // we need to encode the < in order to avoid an illegal token error
            // when the script is inlined in a document.
            document.write('<' + 'script type="text/javascript" src="' + path + '"><' + '/script>');
        }
        else {
            debug.log("native JSON found");
        }
    }
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

(function(){
    // The map containing the stored functions
    var _map = {};
    
    /**
     * @class easyXDM.Fn
     * This contains methods related to function handling, such as storing callbacks.
     * @singleton
     * @namespace easyXDM
     */
    easyXDM.Fn = {
        /**
         * Stores a function using the given name for reference
         * @param {String} name The name that the function should be referred by
         * @param {Function} fn The function to store
         * @namespace easyXDM.fn
         */
        set: function(name, fn){
            this._trace("storing function " + name);
            _map[name] = fn;
        },
        /**
         * Retrieves the function referred to by the given name
         * @param {String} name The name of the function to retrieve
         * @param {Boolean} del If the function should be deleted after retrieval
         * @return {Function} The stored function
         * @namespace easyXDM.fn
         */
        get: function(name, del){
            this._trace("retrieving function " + name);
            var fn = _map[name];
            if (!fn) {
                this._trace(name + " not found");
            }
            
            if (del) {
                delete _map[name];
            }
            return fn;
        }
    };
    
    easyXDM.Fn._trace = debug.getTracer("easyXDM.Fn");
}());
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, chainStack, prepareTransportStack, getLocation, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.Socket
 * This class creates a transport channel between two domains that is usable for sending and receiving string-based messages.<br/>
 * The channel is reliable, supports queueing, and ensures that the message originates from the expected domain.<br/>
 * Internally different stacks will be used depending on the browsers features and the available parameters.
 * <h2>How to set up</h2>
 * Setting up the provider:
 * <pre><code>
 * var socket = new easyXDM.Socket({
 * &nbsp; local: "name.html",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
 * &nbsp; &nbsp; socket.postMessage("foo-message");
 * &nbsp; },
 * &nbsp; onMessage: function(message, origin) {
 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
 * &nbsp; }
 * });
 * </code></pre>
 * Setting up the consumer:
 * <pre><code>
 * var socket = new easyXDM.Socket({
 * &nbsp; remote: "http:&#47;&#47;remotedomain/page.html",
 * &nbsp; remoteHelper: "http:&#47;&#47;remotedomain/name.html",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
 * &nbsp; &nbsp; socket.postMessage("foo-message");
 * &nbsp; },
 * &nbsp; onMessage: function(message, origin) {
 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
 * &nbsp; }
 * });
 * </code></pre>
 * If you are unable to upload the <code>name.html</code> file to the consumers domain then remove the <code>remoteHelper</code> property
 * and easyXDM will fall back to using the HashTransport instead of the NameTransport when not able to use any of the primary transports.
 * @namespace easyXDM
 * @constructor
 * @cfg {String/Window} local The url to the local name.html document, a local static file, or a reference to the local window.
 * @cfg {Boolean} lazy (Consumer only) Set this to true if you want easyXDM to defer creating the transport until really needed. 
 * @cfg {String} remote (Consumer only) The url to the providers document.
 * @cfg {String} remoteHelper (Consumer only) The url to the remote name.html file. This is to support NameTransport as a fallback. Optional.
 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.  Optional, defaults to 2000.
 * @cfg {Number} interval The interval used when polling for messages. Optional, defaults to 300.
 * @cfg {String} channel (Consumer only) The name of the channel to use. Can be used to set consistent iframe names. Must be unique. Optional.
 * @cfg {Function} onMessage The method that should handle incoming messages.<br/> This method should accept two arguments, the message as a string, and the origin as a string. Optional.
 * @cfg {Function} onReady A method that should be called when the transport is ready. Optional.
 * @cfg {DOMElement|String} container (Consumer only) The element, or the id of the element that the primary iframe should be inserted into. If not set then the iframe will be positioned off-screen. Optional.
 * @cfg {Array/String} acl (Provider only) Here you can specify which '[protocol]://[domain]' patterns that should be allowed to act as the consumer towards this provider.<br/>
 * This can contain the wildcards ? and *.  Examples are 'http://example.com', '*.foo.com' and '*dom?.com'. If you want to use reqular expressions then you pattern needs to start with ^ and end with $.
 * If none of the patterns match an Error will be thrown.  
 * @cfg {Object} props (Consumer only) Additional properties that should be applied to the iframe. This can also contain nested objects e.g: <code>{style:{width:"100px", height:"100px"}}</code>. 
 * Properties such as 'name' and 'src' will be overrided. Optional.
 */
easyXDM.Socket = function(config){
    var trace = debug.getTracer("easyXDM.Socket");
    trace("constructor");
    
    // create the stack
    var stack = chainStack(prepareTransportStack(config).concat([{
        incoming: function(message, origin){
            config.onMessage(message, origin);
        },
        callback: function(success){
            if (config.onReady) {
                config.onReady(success);
            }
        }
    }])), recipient = getLocation(config.remote);
    
    // set the origin
    this.origin = getLocation(config.remote);
	
    /**
     * Initiates the destruction of the stack.
     */
    this.destroy = function(){
        stack.destroy();
    };
    
    /**
     * Posts a message to the remote end of the channel
     * @param {String} message The message to send
     */
    this.postMessage = function(message){
        stack.outgoing(message, recipient);
    };
    
    stack.init();
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef,, chainStack, prepareTransportStack, debug, getLocation */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/** 
 * @class easyXDM.Rpc
 * Creates a proxy object that can be used to call methods implemented on the remote end of the channel, and also to provide the implementation
 * of methods to be called from the remote end.<br/>
 * The instantiated object will have methods matching those specified in <code>config.remote</code>.<br/>
 * This requires the JSON object present in the document, either natively, using json.org's json2 or as a wrapper around library spesific methods.
 * <h2>How to set up</h2>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; &#47;&#47; this configuration is equal to that used by the Socket.
 * &nbsp; remote: "http:&#47;&#47;remotedomain/...",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the proxy
 * &nbsp; &nbsp; rpc.foo(...
 * &nbsp; }
 * },{
 * &nbsp; local: {..},
 * &nbsp; remote: {..}
 * });
 * </code></pre>
 * 
 * <h2>Exposing functions (procedures)</h2>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {
 * &nbsp; &nbsp; nameOfMethod: {
 * &nbsp; &nbsp; &nbsp; method: function(arg1, arg2, success, error){
 * &nbsp; &nbsp; &nbsp; &nbsp; ...
 * &nbsp; &nbsp; &nbsp; }
 * &nbsp; &nbsp; },
 * &nbsp; &nbsp; &#47;&#47; with shorthand notation 
 * &nbsp; &nbsp; nameOfAnotherMethod:  function(arg1, arg2, success, error){
 * &nbsp; &nbsp; }
 * &nbsp; },
 * &nbsp; remote: {...}
 * });
 * </code></pre>

 * The function referenced by  [method] will receive the passed arguments followed by the callback functions <code>success</code> and <code>error</code>.<br/>
 * To send a successfull result back you can use
 *     <pre><code>
 *     return foo;
 *     </pre></code>
 * or
 *     <pre><code>
 *     success(foo);
 *     </pre></code>
 *  To return an error you can use
 *     <pre><code>
 *     throw new Error("foo error");
 *     </code></pre>
 * or
 *     <pre><code>
 *     error("foo error");
 *     </code></pre>
 *
 * <h2>Defining remotely exposed methods (procedures/notifications)</h2>
 * The definition of the remote end is quite similar:
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {...},
 * &nbsp; remote: {
 * &nbsp; &nbsp; nameOfMethod: {}
 * &nbsp; }
 * });
 * </code></pre>
 * To call a remote method use
 * <pre><code>
 * rpc.nameOfMethod("arg1", "arg2", function(value) {
 * &nbsp; alert("success: " + value);
 * }, function(message) {
 * &nbsp; alert("error: " + message + );
 * });
 * </code></pre>
 * Both the <code>success</code> and <code>errror</code> callbacks are optional.<br/>
 * When called with no callback a JSON-RPC 2.0 notification will be executed.
 * Be aware that you will not be notified of any errors with this method.
 * <br/>
 * <h2>Specifying a custom serializer</h2>
 * If you do not want to use the JSON2 library for non-native JSON support, but instead capabilities provided by some other library
 * then you can specify a custom serializer using <code>serializer: foo</code>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {...},
 * &nbsp; remote: {...},
 * &nbsp; serializer : {
 * &nbsp; &nbsp; parse: function(string){ ... },
 * &nbsp; &nbsp; stringify: function(object) {...}
 * &nbsp; }
 * });
 * </code></pre>
 * If <code>serializer</code> is set then the class will not attempt to use the native implementation.
 * @namespace easyXDM
 * @constructor
 * @param {Object} config The underlying transports configuration. See easyXDM.Socket for available parameters.
 * @param {Object} jsonRpcConfig The description of the interface to implement.
 */
easyXDM.Rpc = function(config, jsonRpcConfig){
    var trace = debug.getTracer("easyXDM.Rpc");
    trace("constructor");
    
    // expand shorthand notation
    if (jsonRpcConfig.local) {
        for (var method in jsonRpcConfig.local) {
            if (jsonRpcConfig.local.hasOwnProperty(method)) {
                var member = jsonRpcConfig.local[method];
                if (typeof member === "function") {
                    jsonRpcConfig.local[method] = {
                        method: member
                    };
                }
            }
        }
    }
	
    // create the stack
    var stack = chainStack(prepareTransportStack(config).concat([new easyXDM.stack.RpcBehavior(this, jsonRpcConfig), {
        callback: function(success){
            if (config.onReady) {
                config.onReady(success);
            }
        }
    }]));
	
    // set the origin 
    this.origin = getLocation(config.remote);
	
    
    /**
     * Initiates the destruction of the stack.
     */
    this.destroy = function(){
        stack.destroy();
    };
    
    stack.init();
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, getParentObject, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.SameOriginTransport
 * SameOriginTransport is a transport class that can be used when both domains have the same origin.<br/>
 * This can be useful for testing and for when the main application supports both internal and external sources.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote document to communicate with.
 */
easyXDM.stack.SameOriginTransport = function(config){
    var trace = debug.getTracer("easyXDM.stack.SameOriginTransport");
    trace("constructor");
    var pub, frame, send, targetOrigin;
    
    return (pub = {
        outgoing: function(message, domain, fn){
            send(message);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            trace("destroy");
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            trace("init");
            targetOrigin = getLocation(config.remote);
            
            if (config.isHost) {
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: location.protocol + "//" + location.host + location.pathname,
                        xdm_c: config.channel,
                        xdm_p: 4 // 4 = SameOriginTransport
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
                easyXDM.Fn.set(config.channel, function(sendFn){
                    send = sendFn;
                    setTimeout(function(){
                        pub.up.callback(true);
                    }, 0);
                    return function(msg){
                        pub.up.incoming(msg, targetOrigin);
                    };
                });
            }
            else {
                send = getParentObject().Fn.get(config.channel, true)(function(msg){
                    pub.up.incoming(msg, targetOrigin);
                });
                setTimeout(function(){
                    pub.up.callback(true);
                }, 0);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global global, easyXDM, window, getLocation, appendQueryParameters, createFrame, debug, apply, whenReady, IFRAME_PREFIX, namespace, resolveUrl, getDomainName, HAS_FLASH_THROTTLED_BUG, getPort, query*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.FlashTransport
 * FlashTransport is a transport class that uses an SWF with LocalConnection to pass messages back and forth.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote domain to communicate with.
 * @cfg {String} secret the pre-shared secret used to secure the communication.
 * @cfg {String} swf The path to the swf file
 * @cfg {Boolean} swfNoThrottle Set this to true if you want to take steps to avoid beeing throttled when hidden.
 * @cfg {String || DOMElement} swfContainer Set this if you want to control where the swf is placed
 */
easyXDM.stack.FlashTransport = function(config){
    var trace = debug.getTracer("easyXDM.stack.FlashTransport");
    trace("constructor");
    if (!config.swf) {
        throw new Error("Path to easyxdm.swf is missing");
    }
    var pub, // the public interface
 frame, send, targetOrigin, swf, swfContainer;
    
    function onMessage(message, origin){
        setTimeout(function(){
            trace("received message");
            pub.up.incoming(message, targetOrigin);
        }, 0);
    }
    
    /**
     * This method adds the SWF to the DOM and prepares the initialization of the channel
     */
    function addSwf(domain){
        trace("creating factory with SWF from " + domain);
        // the differentiating query argument is needed in Flash9 to avoid a caching issue where LocalConnection would throw an error.
        var url = config.swf + "?host=" + config.isHost;
        var id = "easyXDM_swf_" + Math.floor(Math.random() * 10000);
        
        // prepare the init function that will fire once the swf is ready
        easyXDM.Fn.set("flash_loaded" + domain.replace(/[\-.]/g, "_"), function(){
            easyXDM.stack.FlashTransport[domain].swf = swf = swfContainer.firstChild;
            var queue = easyXDM.stack.FlashTransport[domain].queue;
            for (var i = 0; i < queue.length; i++) {
                queue[i]();
            }
            queue.length = 0;
        });
        
        if (config.swfContainer) {
            swfContainer = (typeof config.swfContainer == "string") ? document.getElementById(config.swfContainer) : config.swfContainer;
        }
        else {
            // create the container that will hold the swf
            swfContainer = document.createElement('div');
            
            // http://bugs.adobe.com/jira/browse/FP-4796
            // http://tech.groups.yahoo.com/group/flexcoders/message/162365
            // https://groups.google.com/forum/#!topic/easyxdm/mJZJhWagoLc
            apply(swfContainer.style, HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle ? {
                height: "20px",
                width: "20px",
                position: "fixed",
                right: 0,
                top: 0
            } : {
                height: "1px",
                width: "1px",
                position: "absolute",
                overflow: "hidden",
                right: 0,
                top: 0
            });
            document.body.appendChild(swfContainer);
        }
        
        // create the object/embed
        var flashVars = "callback=flash_loaded" + domain.replace(/[\-.]/g, "_") + "&proto=" + global.location.protocol + "&domain=" + getDomainName(global.location.href) + "&port=" + getPort(global.location.href) + "&ns=" + namespace;
        flashVars += "&log=true";
        swfContainer.innerHTML = "<object height='20' width='20' type='application/x-shockwave-flash' id='" + id + "' data='" + url + "'>" +
        "<param name='allowScriptAccess' value='always'></param>" +
        "<param name='wmode' value='transparent'>" +
        "<param name='movie' value='" +
        url +
        "'></param>" +
        "<param name='flashvars' value='" +
        flashVars +
        "'></param>" +
        "<embed type='application/x-shockwave-flash' FlashVars='" +
        flashVars +
        "' allowScriptAccess='always' wmode='transparent' src='" +
        url +
        "' height='1' width='1'></embed>" +
        "</object>";
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            swf.postMessage(config.channel, message.toString());
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            trace("destroy");
            try {
                swf.destroyChannel(config.channel);
            } 
            catch (e) {
            }
            swf = null;
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            trace("init");
            
            targetOrigin = config.remote;
            
            // Prepare the code that will be run after the swf has been intialized
            easyXDM.Fn.set("flash_" + config.channel + "_init", function(){
                setTimeout(function(){
                    trace("firing onReady");
                    pub.up.callback(true);
                });
            });
            
            // set up the omMessage handler
            easyXDM.Fn.set("flash_" + config.channel + "_onMessage", onMessage);
            
            config.swf = resolveUrl(config.swf); // reports have been made of requests gone rogue when using relative paths
            var swfdomain = getDomainName(config.swf);
            var fn = function(){
                // set init to true in case the fn was called was invoked from a separate instance
                easyXDM.stack.FlashTransport[swfdomain].init = true;
                swf = easyXDM.stack.FlashTransport[swfdomain].swf;
                // create the channel
                swf.createChannel(config.channel, config.secret, getLocation(config.remote), config.isHost);
                
                if (config.isHost) {
                    // if Flash is going to be throttled and we want to avoid this
                    if (HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle) {
                        apply(config.props, {
                            position: "fixed",
                            right: 0,
                            top: 0,
                            height: "20px",
                            width: "20px"
                        });
                    }
                    // set up the iframe
                    apply(config.props, {
                        src: appendQueryParameters(config.remote, {
                            xdm_e: getLocation(location.href),
                            xdm_c: config.channel,
                            xdm_p: 6, // 6 = FlashTransport
                            xdm_s: config.secret
                        }),
                        name: IFRAME_PREFIX + config.channel + "_provider"
                    });
                    frame = createFrame(config);
                }
            };
            
            if (easyXDM.stack.FlashTransport[swfdomain] && easyXDM.stack.FlashTransport[swfdomain].init) {
                // if the swf is in place and we are the consumer
                fn();
            }
            else {
                // if the swf does not yet exist
                if (!easyXDM.stack.FlashTransport[swfdomain]) {
                    // add the queue to hold the init fn's
                    easyXDM.stack.FlashTransport[swfdomain] = {
                        queue: [fn]
                    };
                    addSwf(swfdomain);
                }
                else {
                    easyXDM.stack.FlashTransport[swfdomain].queue.push(fn);
                }
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.PostMessageTransport
 * PostMessageTransport is a transport class that uses HTML5 postMessage for communication.<br/>
 * <a href="http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx">http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx</a><br/>
 * <a href="https://developer.mozilla.org/en/DOM/window.postMessage">https://developer.mozilla.org/en/DOM/window.postMessage</a>
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote domain to communicate with.
 */
easyXDM.stack.PostMessageTransport = function(config){
    var trace = debug.getTracer("easyXDM.stack.PostMessageTransport");
    trace("constructor");
    var pub, // the public interface
 frame, // the remote frame, if any
 callerWindow, // the window that we will call with
 targetOrigin; // the domain to communicate with
    /**
     * Resolves the origin from the event object
     * @private
     * @param {Object} event The messageevent
     * @return {String} The scheme, host and port of the origin
     */
    function _getOrigin(event){
        if (event.origin) {
            // This is the HTML5 property
            return getLocation(event.origin);
        }
        if (event.uri) {
            // From earlier implementations 
            return getLocation(event.uri);
        }
        if (event.domain) {
            // This is the last option and will fail if the 
            // origin is not using the same schema as we are
            return location.protocol + "//" + event.domain;
        }
        throw "Unable to retrieve the origin of the event";
    }
    
    /**
     * This is the main implementation for the onMessage event.<br/>
     * It checks the validity of the origin and passes the message on if appropriate.
     * @private
     * @param {Object} event The messageevent
     */
    function _window_onMessage(event){
        var origin = _getOrigin(event);
        trace("received message '" + event.data + "' from " + origin);
        if (origin == targetOrigin && event.data.substring(0, config.channel.length + 1) == config.channel + " ") {
            pub.up.incoming(event.data.substring(config.channel.length + 1), origin);
        }
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            callerWindow.postMessage(config.channel + " " + message, domain || targetOrigin);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            trace("destroy");
            un(window, "message", _window_onMessage);
            if (frame) {
                callerWindow = null;
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            trace("init");
            targetOrigin = getLocation(config.remote);
            if (config.isHost) {
                // add the event handler for listening
                var waitForReady = function(event){  
                    if (event.data == config.channel + "-ready") {
                        trace("firing onReady");
                        // replace the eventlistener
                        callerWindow = ("postMessage" in frame.contentWindow) ? frame.contentWindow : frame.contentWindow.document;
                        un(window, "message", waitForReady);
                        on(window, "message", _window_onMessage);
                        setTimeout(function(){
                            pub.up.callback(true);
                        }, 0);
                    }
                };
                on(window, "message", waitForReady);
                
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: getLocation(location.href),
                        xdm_c: config.channel,
                        xdm_p: 1 // 1 = PostMessage
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
            }
            else {
                // add the event handler for listening
                on(window, "message", _window_onMessage);
                callerWindow = ("postMessage" in window.parent) ? window.parent : window.parent.document;
                callerWindow.postMessage(config.channel + "-ready", targetOrigin);
                
                setTimeout(function(){
                    pub.up.callback(true);
                }, 0);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, apply, query, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.FrameElementTransport
 * FrameElementTransport is a transport class that can be used with Gecko-browser as these allow passing variables using the frameElement property.<br/>
 * Security is maintained as Gecho uses Lexical Authorization to determine under which scope a function is running.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote document to communicate with.
 */
easyXDM.stack.FrameElementTransport = function(config){
    var trace = debug.getTracer("easyXDM.stack.FrameElementTransport");
    trace("constructor");
    var pub, frame, send, targetOrigin;
    
    return (pub = {
        outgoing: function(message, domain, fn){
            send.call(this, message);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            trace("destroy");
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            trace("init");
            targetOrigin = getLocation(config.remote);
            
            if (config.isHost) {
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: getLocation(location.href),
                        xdm_c: config.channel,
                        xdm_p: 5 // 5 = FrameElementTransport
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
                frame.fn = function(sendFn){
                    delete frame.fn;
                    send = sendFn;
                    setTimeout(function(){
                        pub.up.callback(true);
                    }, 0);
                    // remove the function so that it cannot be used to overwrite the send function later on
                    return function(msg){
                        pub.up.incoming(msg, targetOrigin);
                    };
                };
            }
            else {
                // This is to mitigate origin-spoofing
                if (document.referrer && getLocation(document.referrer) != query.xdm_e) {
                    window.top.location = query.xdm_e;
                }
                send = window.frameElement.fn(function(msg){
                    pub.up.incoming(msg, targetOrigin);
                });
                pub.up.callback(true);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, getLocation, appendQueryParameters, resolveUrl, createFrame, debug, un, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.NameTransport
 * NameTransport uses the window.name property to relay data.
 * The <code>local</code> parameter needs to be set on both the consumer and provider,<br/>
 * and the <code>remoteHelper</code> parameter needs to be set on the consumer.
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remoteHelper The url to the remote instance of hash.html - this is only needed for the host.
 * @namespace easyXDM.stack
 */
easyXDM.stack.NameTransport = function(config){
    var trace = debug.getTracer("easyXDM.stack.NameTransport");
    trace("constructor");
    if (config.isHost && undef(config.remoteHelper)) {
        trace("missing remoteHelper");
        throw new Error("missing remoteHelper");
    }
    
    var pub; // the public interface
    var isHost, callerWindow, remoteWindow, readyCount, callback, remoteOrigin, remoteUrl;
    
    function _sendMessage(message){
        var url = config.remoteHelper + (isHost ? "#_3" : "#_2") + config.channel;
        trace("sending message " + message);
        trace("navigating to  '" + url + "'");
        callerWindow.contentWindow.sendMessage(message, url);
    }
    
    function _onReady(){
        if (isHost) {
            if (++readyCount === 2 || !isHost) {
                pub.up.callback(true);
            }
        }
        else {
            _sendMessage("ready");
            trace("calling onReady");
            pub.up.callback(true);
        }
    }
    
    function _onMessage(message){
        trace("received message " + message);
        pub.up.incoming(message, remoteOrigin);
    }
    
    function _onLoad(){
        if (callback) {
            setTimeout(function(){
                callback(true);
            }, 0);
        }
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            callback = fn;
            _sendMessage(message);
        },
        destroy: function(){
            trace("destroy");
            callerWindow.parentNode.removeChild(callerWindow);
            callerWindow = null;
            if (isHost) {
                remoteWindow.parentNode.removeChild(remoteWindow);
                remoteWindow = null;
            }
        },
        onDOMReady: function(){
            trace("init");
            isHost = config.isHost;
            readyCount = 0;
            remoteOrigin = getLocation(config.remote);
            config.local = resolveUrl(config.local);
            
            if (isHost) {
                // Register the callback
                easyXDM.Fn.set(config.channel, function(message){
                    trace("received initial message " + message);
                    if (isHost && message === "ready") {
                        // Replace the handler
                        easyXDM.Fn.set(config.channel, _onMessage);
                        _onReady();
                    }
                });
                
                // Set up the frame that points to the remote instance
                remoteUrl = appendQueryParameters(config.remote, {
                    xdm_e: config.local,
                    xdm_c: config.channel,
                    xdm_p: 2
                });
                apply(config.props, {
                    src: remoteUrl + '#' + config.channel,
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                remoteWindow = createFrame(config);
            }
            else {
                config.remoteHelper = config.remote;
                easyXDM.Fn.set(config.channel, _onMessage);
            }
            // Set up the iframe that will be used for the transport
            
            callerWindow = createFrame({
                props: {
                    src: config.local + "#_4" + config.channel
                },
                onLoad: function onLoad(){
                    // Remove the handler
                    var w = callerWindow || this;
                    un(w, "load", onLoad);
                    easyXDM.Fn.set(config.channel + "_load", _onLoad);
                    (function test(){
                        if (typeof w.contentWindow.sendMessage == "function") {
                            _onReady();
                        }
                        else {
                            setTimeout(test, 50);
                        }
                    }());
                }
            });
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.HashTransport
 * HashTransport is a transport class that uses the IFrame URL Technique for communication.<br/>
 * <a href="http://msdn.microsoft.com/en-us/library/bb735305.aspx">http://msdn.microsoft.com/en-us/library/bb735305.aspx</a><br/>
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String/Window} local The url to the local file used for proxying messages, or the local window.
 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.
 * @cfg {Number} interval The interval used when polling for messages.
 */
easyXDM.stack.HashTransport = function(config){
    var trace = debug.getTracer("easyXDM.stack.HashTransport");
    trace("constructor");
    var pub;
    var me = this, isHost, _timer, pollInterval, _lastMsg, _msgNr, _listenerWindow, _callerWindow;
    var useParent, _remoteOrigin;
    
    function _sendMessage(message){
        trace("sending message '" + (_msgNr + 1) + " " + message + "' to " + _remoteOrigin);
        if (!_callerWindow) {
            trace("no caller window");
            return;
        }
        var url = config.remote + "#" + (_msgNr++) + "_" + message;
        ((isHost || !useParent) ? _callerWindow.contentWindow : _callerWindow).location = url;
    }
    
    function _handleHash(hash){
        _lastMsg = hash;
        trace("received message '" + _lastMsg + "' from " + _remoteOrigin);
        pub.up.incoming(_lastMsg.substring(_lastMsg.indexOf("_") + 1), _remoteOrigin);
    }
    
    /**
     * Checks location.hash for a new message and relays this to the receiver.
     * @private
     */
    function _pollHash(){
        if (!_listenerWindow) {
            return;
        }
        var href = _listenerWindow.location.href, hash = "", indexOf = href.indexOf("#");
        if (indexOf != -1) {
            hash = href.substring(indexOf);
        }
        if (hash && hash != _lastMsg) {
            trace("poll: new message");
            _handleHash(hash);
        }
    }
    
    function _attachListeners(){
        trace("starting polling");
        _timer = setInterval(_pollHash, pollInterval);
    }
    
    return (pub = {
        outgoing: function(message, domain){
            _sendMessage(message);
        },
        destroy: function(){
            window.clearInterval(_timer);
            if (isHost || !useParent) {
                _callerWindow.parentNode.removeChild(_callerWindow);
            }
            _callerWindow = null;
        },
        onDOMReady: function(){
            isHost = config.isHost;
            pollInterval = config.interval;
            _lastMsg = "#" + config.channel;
            _msgNr = 0;
            useParent = config.useParent;
            _remoteOrigin = getLocation(config.remote);
            if (isHost) {
                config.props = {
                    src: config.remote,
                    name: IFRAME_PREFIX + config.channel + "_provider"
                };
                if (useParent) {
                    config.onLoad = function(){
                        _listenerWindow = window;
                        _attachListeners();
                        pub.up.callback(true);
                    };
                }
                else {
                    var tries = 0, max = config.delay / 50;
                    (function getRef(){
                        if (++tries > max) {
                            trace("unable to get reference to _listenerWindow, giving up");
                            throw new Error("Unable to reference listenerwindow");
                        }
                        try {
                            _listenerWindow = _callerWindow.contentWindow.frames[IFRAME_PREFIX + config.channel + "_consumer"];
                        } 
                        catch (ex) {
                        }
                        if (_listenerWindow) {
                            _attachListeners();
                            trace("got a reference to _listenerWindow");
                            pub.up.callback(true);
                        }
                        else {
                            setTimeout(getRef, 50);
                        }
                    }());
                }
                _callerWindow = createFrame(config);
            }
            else {
                _listenerWindow = window;
                _attachListeners();
                if (useParent) {
                    _callerWindow = parent;
                    pub.up.callback(true);
                }
                else {
                    apply(config, {
                        props: {
                            src: config.remote + "#" + config.channel + new Date(),
                            name: IFRAME_PREFIX + config.channel + "_consumer"
                        },
                        onLoad: function(){
                            pub.up.callback(true);
                        }
                    });
                    _callerWindow = createFrame(config);
                }
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.ReliableBehavior
 * This is a behavior that tries to make the underlying transport reliable by using acknowledgements.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration.
 */
easyXDM.stack.ReliableBehavior = function(config){
    var trace = debug.getTracer("easyXDM.stack.ReliableBehavior");
    trace("constructor");
    var pub, // the public interface
 callback; // the callback to execute when we have a confirmed success/failure
    var idOut = 0, idIn = 0, currentMessage = "";
    
    return (pub = {
        incoming: function(message, origin){
            trace("incoming: " + message);
            var indexOf = message.indexOf("_"), ack = message.substring(0, indexOf).split(",");
            message = message.substring(indexOf + 1);
            
            if (ack[0] == idOut) {
                trace("message delivered");
                currentMessage = "";
                if (callback) {
                    callback(true);
                }
            }
            if (message.length > 0) {
                trace("sending ack, and passing on " + message);
                pub.down.outgoing(ack[1] + "," + idOut + "_" + currentMessage, origin);
                if (idIn != ack[1]) {
                    idIn = ack[1];
                    pub.up.incoming(message, origin);
                }
            }
            
        },
        outgoing: function(message, origin, fn){
            currentMessage = message;
            callback = fn;
            pub.down.outgoing(idIn + "," + (++idOut) + "_" + message, origin);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug, undef, removeFromStack*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.QueueBehavior
 * This is a behavior that enables queueing of messages. <br/>
 * It will buffer incoming messages and dispach these as fast as the underlying transport allows.
 * This will also fragment/defragment messages so that the outgoing message is never bigger than the
 * set length.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration. Optional.
 * @cfg {Number} maxLength The maximum length of each outgoing message. Set this to enable fragmentation.
 */
easyXDM.stack.QueueBehavior = function(config){
    var trace = debug.getTracer("easyXDM.stack.QueueBehavior");
    trace("constructor");
    var pub, queue = [], waiting = true, incoming = "", destroying, maxLength = 0, lazy = false, doFragment = false;
    
    function dispatch(){
        if (config.remove && queue.length === 0) {
            trace("removing myself from the stack");
            removeFromStack(pub);
            return;
        }
        if (waiting || queue.length === 0 || destroying) {
            return;
        }
        trace("dispatching from queue");
        waiting = true;
        var message = queue.shift();
        
        pub.down.outgoing(message.data, message.origin, function(success){
            waiting = false;
            if (message.callback) {
                setTimeout(function(){
                    message.callback(success);
                }, 0);
            }
            dispatch();
        });
    }
    return (pub = {
        init: function(){
            if (undef(config)) {
                config = {};
            }
            if (config.maxLength) {
                maxLength = config.maxLength;
                doFragment = true;
            }
            if (config.lazy) {
                lazy = true;
            }
            else {
                pub.down.init();
            }
        },
        callback: function(success){
            waiting = false;
            var up = pub.up; // in case dispatch calls removeFromStack
            dispatch();
            up.callback(success);
        },
        incoming: function(message, origin){
            if (doFragment) {
                var indexOf = message.indexOf("_"), seq = parseInt(message.substring(0, indexOf), 10);
                incoming += message.substring(indexOf + 1);
                if (seq === 0) {
                    trace("received the last fragment");
                    if (config.encode) {
                        incoming = decodeURIComponent(incoming);
                    }
                    pub.up.incoming(incoming, origin);
                    incoming = "";
                }
                else {
                    trace("waiting for more fragments, seq=" + message);
                }
            }
            else {
                pub.up.incoming(message, origin);
            }
        },
        outgoing: function(message, origin, fn){
            if (config.encode) {
                message = encodeURIComponent(message);
            }
            var fragments = [], fragment;
            if (doFragment) {
                // fragment into chunks
                while (message.length !== 0) {
                    fragment = message.substring(0, maxLength);
                    message = message.substring(fragment.length);
                    fragments.push(fragment);
                }
                // enqueue the chunks
                while ((fragment = fragments.shift())) {
                    trace("enqueuing");
                    queue.push({
                        data: fragments.length + "_" + fragment,
                        origin: origin,
                        callback: fragments.length === 0 ? fn : null
                    });
                }
            }
            else {
                queue.push({
                    data: message,
                    origin: origin,
                    callback: fn
                });
            }
            if (lazy) {
                pub.down.init();
            }
            else {
                dispatch();
            }
        },
        destroy: function(){
            trace("destroy");
            destroying = true;
            pub.down.destroy();
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.VerifyBehavior
 * This behavior will verify that communication with the remote end is possible, and will also sign all outgoing,
 * and verify all incoming messages. This removes the risk of someone hijacking the iframe to send malicious messages.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration.
 * @cfg {Boolean} initiate If the verification should be initiated from this end.
 */
easyXDM.stack.VerifyBehavior = function(config){
    var trace = debug.getTracer("easyXDM.stack.VerifyBehavior");
    trace("constructor");
    if (undef(config.initiate)) {
        throw new Error("settings.initiate is not set");
    }
    var pub, mySecret, theirSecret, verified = false;
    
    function startVerification(){
        trace("requesting verification");
        mySecret = Math.random().toString(16).substring(2);
        pub.down.outgoing(mySecret);
    }
    
    return (pub = {
        incoming: function(message, origin){
            var indexOf = message.indexOf("_");
            if (indexOf === -1) {
                if (message === mySecret) {
                    trace("verified, calling callback");
                    pub.up.callback(true);
                }
                else if (!theirSecret) {
                    trace("returning secret");
                    theirSecret = message;
                    if (!config.initiate) {
                        startVerification();
                    }
                    pub.down.outgoing(message);
                }
            }
            else {
                if (message.substring(0, indexOf) === theirSecret) {
                    pub.up.incoming(message.substring(indexOf + 1), origin);
                }
            }
        },
        outgoing: function(message, origin, fn){
            pub.down.outgoing(mySecret + "_" + message, origin, fn);
        },
        callback: function(success){
            if (config.initiate) {
                startVerification();
            }
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, getJSON, debug, emptyFn, isArray */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.RpcBehavior
 * This uses JSON-RPC 2.0 to expose local methods and to invoke remote methods and have responses returned over the the string based transport stack.<br/>
 * Exposed methods can return values synchronous, asyncronous, or bet set up to not return anything.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} proxy The object to apply the methods to.
 * @param {Object} config The definition of the local and remote interface to implement.
 * @cfg {Object} local The local interface to expose.
 * @cfg {Object} remote The remote methods to expose through the proxy.
 * @cfg {Object} serializer The serializer to use for serializing and deserializing the JSON. Should be compatible with the HTML5 JSON object. Optional, will default to JSON.
 */
easyXDM.stack.RpcBehavior = function(proxy, config){
    var trace = debug.getTracer("easyXDM.stack.RpcBehavior");
    var pub, serializer = config.serializer || getJSON();
    var _callbackCounter = 0, _callbacks = {};
    
    /**
     * Serializes and sends the message
     * @private
     * @param {Object} data The JSON-RPC message to be sent. The jsonrpc property will be added.
     */
    function _send(data){
        data.jsonrpc = "2.0";
        pub.down.outgoing(serializer.stringify(data));
    }
    
    /**
     * Creates a method that implements the given definition
     * @private
     * @param {Object} The method configuration
     * @param {String} method The name of the method
     * @return {Function} A stub capable of proxying the requested method call
     */
    function _createMethod(definition, method){
        var slice = Array.prototype.slice;
        
        trace("creating method " + method);
        return function(){
            trace("executing method " + method);
            var l = arguments.length, callback, message = {
                method: method
            };
            
            if (l > 0 && typeof arguments[l - 1] === "function") {
                //with callback, procedure
                if (l > 1 && typeof arguments[l - 2] === "function") {
                    // two callbacks, success and error
                    callback = {
                        success: arguments[l - 2],
                        error: arguments[l - 1]
                    };
                    message.params = slice.call(arguments, 0, l - 2);
                }
                else {
                    // single callback, success
                    callback = {
                        success: arguments[l - 1]
                    };
                    message.params = slice.call(arguments, 0, l - 1);
                }
                _callbacks["" + (++_callbackCounter)] = callback;
                message.id = _callbackCounter;
            }
            else {
                // no callbacks, a notification
                message.params = slice.call(arguments, 0);
            }
            if (definition.namedParams && message.params.length === 1) {
                message.params = message.params[0];
            }
            // Send the method request
            _send(message);
        };
    }
    
    /**
     * Executes the exposed method
     * @private
     * @param {String} method The name of the method
     * @param {Number} id The callback id to use
     * @param {Function} method The exposed implementation
     * @param {Array} params The parameters supplied by the remote end
     */
    function _executeMethod(method, id, fn, params){
        if (!fn) {
            trace("requested to execute non-existent procedure " + method);
            if (id) {
                _send({
                    id: id,
                    error: {
                        code: -32601,
                        message: "Procedure not found."
                    }
                });
            }
            return;
        }
        
        trace("requested to execute procedure " + method);
        var success, error;
        if (id) {
            success = function(result){
                success = emptyFn;
                _send({
                    id: id,
                    result: result
                });
            };
            error = function(message, data){
                error = emptyFn;
                var msg = {
                    id: id,
                    error: {
                        code: -32099,
                        message: message
                    }
                };
                if (data) {
                    msg.error.data = data;
                }
                _send(msg);
            };
        }
        else {
            success = error = emptyFn;
        }
        // Call local method
        if (!isArray(params)) {
            params = [params];
        }
        try {
            var result = fn.method.apply(fn.scope, params.concat([success, error]));
            if (!undef(result)) {
                success(result);
            }
        } 
        catch (ex1) {
            error(ex1.message);
        }
    }
    
    return (pub = {
        incoming: function(message, origin){
            var data = serializer.parse(message);
            if (data.method) {
                trace("received request to execute method " + data.method + (data.id ? (" using callback id " + data.id) : ""));
                // A method call from the remote end
                if (config.handle) {
                    config.handle(data, _send);
                }
                else {
                    _executeMethod(data.method, data.id, config.local[data.method], data.params);
                }
            }
            else {
                trace("received return value destined to callback with id " + data.id);
                // A method response from the other end
                var callback = _callbacks[data.id];
                if (data.error) {
                    if (callback.error) {
                        callback.error(data.error);
                    }
                    else {
                        trace("unhandled error returned.");
                    }
                }
                else if (callback.success) {
                    callback.success(data.result);
                }
                delete _callbacks[data.id];
            }
        },
        init: function(){
            trace("init");
            if (config.remote) {
                trace("creating stubs");
                // Implement the remote sides exposed methods
                for (var method in config.remote) {
                    if (config.remote.hasOwnProperty(method)) {
                        proxy[method] = _createMethod(config.remote[method], method);
                    }
                }
            }
            pub.down.init();
        },
        destroy: function(){
            trace("destroy");
            for (var method in config.remote) {
                if (config.remote.hasOwnProperty(method) && proxy.hasOwnProperty(method)) {
                    delete proxy[method];
                }
            }
            pub.down.destroy();
        }
    });
};
global.easyXDM = easyXDM;
})(window, document, location, window.setTimeout, decodeURIComponent, encodeURIComponent);

// app.clipapp.js

App.ClipApp = (function(App, Backbone, $){
  var ClipApp = {};

  // util methods
  ClipApp.isLoggedIn = function(){
    return ClipApp.getMyUid() != null ? true : false;
  };

  ClipApp.isOwner = function(uid1, uid2){
    return uid1 == uid2;
  };

  ClipApp.getMyFace = function(){
    return App.ClipApp.Me.getFace();
  };

  ClipApp.getMyUid = function(){
    return App.ClipApp.Me.getUid();
  };

  ClipApp.getMyName = function(){
    return App.ClipApp.Me.getFace().name;
  };

  ClipApp.getFaceUid = function(){
    return App.ClipApp.Face.getUserId();
  };

  ClipApp.isSelf = function(uid){
    return uid == ClipApp.getMyUid();
  };

  ClipApp.img_upUrl = function(){
    return App.util.getImg_upUrl(ClipApp.getMyUid());
  };

  ClipApp.face_upUrl = function(){
    return App.util.getFace_upUrl(ClipApp.getMyUid());
  };

  ClipApp.encodeURI = function(url){ //公共调用
    var base = url;
    var arr = base ? base.split("/") : [];
    _.map(arr, function(a){ return encodeURIComponent(a);});
    url = App.util.unique_url(arr.join("/")); // 加上时间戳
    return url;
  };

  // main_tag 部分从这取
  ClipApp.getDefaultBubbs = function(){
    var lang = App.versions.getLanguage(); // 用户语言设置
    if(lang == "en"){
      return ["pretty","funny","musical","cool","tasty","wish"];
    }{
      return ["好看", "有趣","好听", "真赞", "好吃",  "想要"];
    }
  };

  // routing methods

  ClipApp.siteShow = function(tag){
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags(tag);
    ClipApp.ClipList.showSiteClips(tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:siteshow",tag);
  };

  ClipApp.siteQuery = function(word, tag){
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteBubs(tag);
    ClipApp.ClipList.showSiteQuery(word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word);
  };

  ClipApp.help = function(item){
    ClipApp.Help.show(item);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:help",item);
  };

  ClipApp.register = function(){
    ClipApp.Login.show();
  };

  ClipApp.invite = function(key){ // 接受处理用户的激活注册
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags();
    ClipApp.ClipList.showSiteClips();
    ClipApp.Register.invite(key);
  };

  ClipApp.active = function(key){ // 接受用户的邮件添加激活或者是合并激活
    ClipApp.Face.show();
    ClipApp.Bubb.showSiteTags();
    ClipApp.ClipList.showSiteClips();
    ClipApp.EmailAdd.active(key);
  };

  ClipApp.findpasswd = function(){
    ClipApp.FindPass.show();
  };

  ClipApp.resetpasswd = function(link){
    ClipApp.ResetPass.show(link);
  };

  ClipApp.oauth = function(){
    ClipApp.Oauth.process();
  };

  ClipApp.error = function(message){
    ClipApp.Error.process(message);
  };

  ClipApp.userShow = function(uid, tag){
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:usershow", uid, tag);
  };

  ClipApp.userQuery = function(uid, word, tag){
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word, uid);
  };

  // user所追的人的列表 无需在请求Face 和 Bubb
  ClipApp.userFollowing = function(uid, tag){
    if(!uid) uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowingList.showUserFollowing(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollowing", uid);
  };

  // 追user的人的列表 无需再请求Face 和 Bubb
  ClipApp.userFollower = function(uid, tag){
    if(!uid) uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.FollowerList.showUserFollower(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollower", uid);
  };

  ClipApp.myShow = function(tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserClips(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:usershow",uid, tag);
  };

  ClipApp.myQuery = function(word, tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.showUserTags(uid, tag);
    ClipApp.ClipList.showUserQuery(uid, word, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:query", word, uid);
  };

  // interest和recommend 只需要显示 主观tag就可以了
  ClipApp.myInterest = function(tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.cleanTags();
    ClipApp.ClipList.showUserInterest(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:interest", tag);
  };

  // 为detail页面添加网址
  ClipApp.clipDetail = function(uid, clipid){
    ClipApp.userShow(uid);
    App.ClipApp.ClipDetail.show(uid+":"+clipid, null, {});
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:clipdetail", uid, clipid);
  };

  /*ClipApp.myRecommend = function(tag){
    var uid = ClipApp.getMyUid();
    ClipApp.Face.show(uid);
    ClipApp.Bubb.cleanTags();
    ClipApp.ClipList.showUserRecommend(uid, tag);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:recommend",tag);
  };*/

  // routing end

  // dialog methods

  ClipApp.showLogin = function(callback){
    ClipApp.Login.show(callback);
  };

  ClipApp.showRegister = function(){
    ClipApp.Register.show();
  };

  ClipApp.showDetail = function(clipid,model_id,recommend){
    //model_id为model的id，用来当detail的model改变时，改变list的model的数据
    ClipApp.ClipDetail.show(clipid,model_id,recommend);
  };

  ClipApp.showMemo = function(args){
    ClipApp.ClipMemo.show(args);
  };

  // 对于那些直接点击修改按钮的部分，有些多余
  ClipApp.showEditClip = function(clipId){
    if(!ClipApp.isLoggedIn()){
      ClipApp.showLogin(function(){
	if (ClipApp.isOwner(clipId.split(":")[0], ClipApp.getMyUid())) {
	  ClipApp.ClipEdit.show(clipId);
	}
      });
    }else{
      if (ClipApp.isOwner(clipId.split(":")[0], ClipApp.getMyUid())) {
	ClipApp.ClipEdit.show(clipId);
      }
    }
  };

  ClipApp.showClipDelete = function(clipid){
    ClipApp.ClipDelete.show(clipid);
  };

  // 不用回到用户首页[在进行list同步的时候判断一下就可以了]
  ClipApp.showClipAdd = function(clipper){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.ClipAdd.show(clipper);
      });
    }else{
      ClipApp.ClipAdd.show(clipper);
    }
  };

  //reclip 用户一个clip
  ClipApp.showReclip = function(clipid, model_id, rid, pub){
    // 将没有做完的操作当作callback传给login，登录成功后有callback则进行处理
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.Reclip.show(clipid,model_id,rid,pub);
      });
    }else{
      if(!ClipApp.getMyName()){
	App.ClipApp.showAlert({auth: "no_name"}, null, function(){
	  App.vent.trigger("app.clipapp.useredit:rename");
	});
      }else{
	ClipApp.Reclip.show(clipid,model_id,rid,pub);
      }
    }
  };

  /*
  ClipApp.showReclipTag = function(user,tag){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.ReclipTag.show(user, tag);
      });
    }else{
      if(!ClipApp.getMyName()){
	App.ClipApp.showAlert({auth: "no_name"}, null, function(){
	  App.vent.trigger("app.clipapp.useredit:rename");
	});
      }else{
        ClipApp.ReclipTag.show(user,tag);
      }
    }
  };

  ClipApp.showRecommend =  function(cid,model_id,pub){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.Recommend.show(cid,model_id,pub);
      });
    }else{
      ClipApp.Recommend.show(cid,model_id,pub);
    }
  };*/

  ClipApp.showComment = function(cid, model_id){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.Comment.show(cid, model_id);
      });
    }else{
      if(!ClipApp.getMyName()){
	App.ClipApp.showAlert({auth: "no_name"}, null, function(){
	  App.vent.trigger("app.clipapp.useredit:rename");
	});
      }else{
	ClipApp.Comment.show(cid, model_id);
      }
    }
  };

  ClipApp.showUserEdit = function(){
    if(!ClipApp.isLoggedIn()){
      ClipApp.Login.show(function(){
	ClipApp.UserEdit.show();
	ClipApp.RuleEdit.show();
	ClipApp.WeiboEdit.show();
	ClipApp.TwitterEdit.show();
      });
    }else{
      ClipApp.UserEdit.show();
      ClipApp.RuleEdit.show();
      ClipApp.WeiboEdit.show();
      ClipApp.TwitterEdit.show();
    }
  };

  ClipApp.showUserBind = function(oauth, fun, remember){
    ClipApp.UserBind.show(oauth, fun, remember);
  };

  ClipApp.showEmailAdd = function(uid){
    if(!ClipApp.getMyName()){
      App.ClipApp.showAlert({auth: "no_name"}, null, function(){
	App.vent.trigger("app.clipapp.useredit:rename");
      });
    }else{
      ClipApp.EmailAdd.show(uid);
    }
  };

  ClipApp.showFollowing = function(uid){
    ClipApp.FollowingList.showUserFollowing(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollowing", uid);
  };

  ClipApp.showFollower = function(uid){
    ClipApp.FollowerList.showUserFollower(uid);
    App.Routing.ClipRouting.router.trigger("app.clipapp.routing:userfollower", uid);
  };

  ClipApp.showSuccess = function(key, value){
    ClipApp.Message.success(key, value);
  };

  ClipApp.showAlert = function(key, value, fun, cancel_fun){
    ClipApp.Message.alert(key, value);
    if(typeof(fun) == "function"){
      App.vent.unbind("app.clipapp.message:sure");
      App.vent.bind("app.clipapp.message:sure", fun);
    }
    if(typeof(cancel_fun) == "function"){
      App.vent.unbind("app.clipapp.message:cancel");
      App.vent.bind("app.clipapp.message:cancel", cancel_fun);
    }
  };

  ClipApp.showConfirm = function(key, value, fun){
    ClipApp.Message.confirm(key, value);
    if(typeof(fun) == "function"){
      App.vent.unbind("app.clipapp.message:sure");
      App.vent.bind("app.clipapp.message:sure", fun);
    }
  };

  // dialog end

  App.vent.bind("all", function(eventName){
    console.log(eventName);
  });

  //对 user's tag下的clip的reclip
  App.bind("initialize:after", function(){
    $("#return_top").click(function(){
      if($('html').hasClass("lt-ie8"))
	$(document.body).scrollTop(0);
    });
    var fixed = function(paddingTop){
      $(".user_detail").addClass("fixed").css({"margin-top": "0px", "top": paddingTop});
      var y = $(".user_detail").height()+5;
      $("#bubb").addClass("fixed").css({"margin-top":y+"px", "top": paddingTop});
    };

    var remove_fixed = function(paddingTop){
      $(".user_detail").removeClass("fixed").css("margin-top", paddingTop);
      $("#bubb").removeClass("fixed").css("margin-top", 5+"px");
    };

    var time_gap = true, tmp;
    var paddingTop = 0 + "px";
    remove_fixed(paddingTop);

    $("#add_right").on("click", function(){App.ClipApp.showClipAdd();});
    if($('html').hasClass('lt-ie8')){ // 如果是ie7
      tmp = $(document.body);
    }else{
      tmp = $(window);
    }
    tmp.scroll(function() {
      if($("#editor").length > 0){
	// console.log("编辑器的滚动事件，nextpage不用响应");
	return;
      }else{
	remove_fixed(paddingTop);
	var st = tmp.scrollTop();
	var shifting =$(".user_head").height() ? $(".user_head").height()+ 15 : 0;
	var mt = $(".clearfix").offset().top + shifting;
	//console.info(shifting+"shifting");
	//var mt = $(".clearfix").offset().top + $(".user_info").height()-$(".user_detail").height();
	//var gap = document.getElementById("user_info").style.paddingTop;
	//console.info(gap);
	//mt = $(".user_detail").height() ? $(".user_detail").offset().top:$(".clearfix").offset().top;
	if(st>0){
	  $(".return_top").show();
	  $("#add_right").show();
	}else{
	  $(".return_top").hide();
	  $("#add_right").hide();
	}
	if(st > mt ){
	  //console.log("锁定气泡组件",st,mt);
	  fixed(paddingTop);
	} else {
	  //console.log("解除锁定气泡组件",st,mt);
	  remove_fixed(paddingTop);
	}
	var wh = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight;
	var lt = $(".loader").offset().top;
	var obj = $("#list .clip");
	if(obj && obj.last()&& obj.last()[0]){
	  var last_top = $("#list .clip").last()[0].offsetTop;
	}
	// console.log(st + "  ",wh + "  ",lt + "  " ,time_gap);
	if((st + wh - 300 > last_top || st + wh > lt)&& time_gap==true ){
	  time_gap = false;
	  setTimeout(function(){
	    var st1 = tmp.scrollTop();
	    // 再次判断是为了兼容ie7，
	    // ie7详情窗口关闭时st会瞬间取得一个过大的值导致请求下一页的代码被执行
	    if(st1 + wh - 300 > last_top || st1 + wh > lt ){
	      App.vent.trigger("app.clipapp:nextpage");
	    }
	  },50);
	  setTimeout(function(){
	    time_gap = true;
	  },500);
	}
      }
    });
  });

  return ClipApp;
})(App, Backbone, jQuery);
App.ClipApp.Url = (function(){
  var Url = {};
  Url.base = "/_2_";
  Url.page = 10;
  // Url.url = Url.base;

  return Url;
})();
App.util = (function(){
  var util = {};
  var P = App.ClipApp.Url.base;

  util.name_pattern = /^[a-zA-Z0-9][a-zA-Z0-9\.]{3,18}[a-zA-Z0-9]$/;
  util.email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;

  util.getCookie = function(name){
    var start = document.cookie.indexOf( name+"=" );
    var len = start + name.length + 1;
    if ((!start) && (name != document.cookie.substring(0, name.length))){
      return null;
    }
    if ( start == -1 )
      return null;
    var end = document.cookie.indexOf( ';', len );
    if ( end == -1 )
      end = document.cookie.length;
    return unescape(document.cookie.substring( len, end ));
  };

  util.getImg_upUrl = function(uid){
    return P + '/user/'+uid+'/image';
  };

  util.getFace_upUrl = function(uid){
    return P+"/user/" + uid + "/upload_face";
  };

  util.unique_url = function(url){
    var now = new Date();
    return url + "?now=" + now.getTime();
  };

  // TODO 此处理适合在 api 的 getPreview 逻辑里完成
  // clip列表时取得img 的 url 为裁剪后的图片
  util.url = function(image_url){
    var pattern = /user\/\d\/image\/[a-z0-9]{32}/;
    var pattern1 = /http:\/\//;
    if(image_url && pattern.test(image_url)&&!pattern1.test(image_url)){
      return image_url + "/270";
    }else return image_url;
  };

  // TODO 此处理适合在 api 的 getUserInfo 逻辑里完成
  // if (!face) userInfo.face = default_face;
  // userInfo.icon = userInfo.face + '/42'
  util.face_url = function(imageid,size){
    var pattern = /^[0-9]{1,}:[a-z0-9]{32}_face/;
    if(imageid == ""){
      return "img/f.png";
    }else if(imageid&& pattern.test(imageid)){
      var ids = imageid.split(":");
      if(size){
	return P + "/user/" + ids[0]+ "/image/" + ids[1] + "/" + size;
      }else{
	return P + "/user/" + ids[0]+ "/image/" + ids[1];
      }
    }else return imageid;
  };

  // 将content内容转换为，可用于显示的html
  util.contentToHtml = function(content){
    return App.Convert.ubbToHtml(content);
  };

  // 对comment的内容进行html过滤，防止脚本注入
  util.cleanInput = function(comment){
    comment = App.Convert.cleanHtml(comment);
    comment = comment.replace(/<\/?div[^>]*>/ig, "");
    comment = comment.replace(/<\/?div[^>]*>/ig, "");
    return comment;
  };

  // TODO 合并到某个代码里？可以直接不要了
  /*util.commentToHtml = function(comment){
    comment = comment.replace(/\n{2,}/ig, "<\/p><p>");
    comment = comment.replace(/\n/ig, "<\/br>");
    return comment;
  };*/

  // contentToPreview
  util.getPreview = function(content, length){
    var data = {};
    var reg = /\[img\].*?\[\/img\]/;
    var img = content.match(reg);
    if(img) data.image = img[0].replace('[img]',"").replace('[/img]',"");
    var text = getContentText(content);
    data.text = trim(text, length);
    return data;
  };

  function getContentText (content){
    // 取得ubb中常用的标签之后留下的内容
    // 去掉所有的ubb标签中的内容，只留下文本内容
    var reg1 = /\[img\].*?\[\/img\]/gi;
    var reg = /\[\/?[^\]].*?\]/gi;  //\[\/?[^].*?\]/gi;
    // 去除img标签
    while(reg1.test(content)) content = content.replace(reg1,"");
    // 去除其他标签
    while(reg.test(content)) content = content.replace(reg,"");
    return App.Convert.ubbToHtml(content);
  };

  function trim(content, length){
    var r = undefined;
    if (!content) return r;
    if (_.isString(content) && content.length){
      // 先对content内容进行空格去除，在做截断
      content = content.replace(/\s+/g," ");
      content = content.replace(/&nbsp;+/g, "");
      if(content.length < length){
	r = content;
      } else {
	r = content.substring(0, length).replace(/<$/, "") + "...";
      }
    }
    return r;
  };

  util.isImage = function(id){
    var sender = document.getElementById(id);
    if (!sender.value.match(/.jpeg|.jpg|.gif|.png|.bmp/i)){
      return false;
    }else{
      return true;
    }
  };

  util.generatePastTime = function(time){
    if(!time) return null;
    var ftime = new Date(time);
    if(ftime == "NaN"){
      time_Date=time.split('T')[0];
      var year=time_Date.split('-')[0];
      var month=time_Date.split('-')[1];
      var date=time_Date.split('-')[2];
      var time_time=time.split('T')[1];
      var hrs=time_time.split(':')[0];
      var min=time_time.split(':')[1];
      var sec=time_time.split(':')[2].split('.')[0];
      var ms=time_time.split(':')[2].split('.')[1].replace('Z','');
      time=Date.UTC(year,month-1,date,hrs,min,sec,ms);//UTC中的month是0-11
      ftime = new Date(time);
    }
    var ttime = new Date();
    return subTimes(ftime,ttime);
  };


  subTimes = function(Ftime,Ttime){
    var dtime = (Ttime.getTime() - Ftime.getTime())/1000;
    var returnVal = "";
    if(dtime<5){
       returnVal = _i18n('util.time.moment');
    }else if(dtime<60){//second
      returnVal = Math.round(dtime)+ _i18n('util.time.second');
    }else if(dtime>=60 && dtime<60*60){//minute
      returnVal = Math.round(dtime/60) + _i18n('util.time.minute');
    }else if(dtime>=60*60 && dtime<60*60*24){//hour
      returnVal = Math.round(dtime/(60*60)) + _i18n('util.time.hour');
    }else if(dtime>=60*60*24 && dtime<60*60*24*7){//day
      returnVal = Math.round(dtime/(60*60*24)) + _i18n('util.time.day');
    }else if(dtime>=60*60*24*7 && dtime<60*60*24*30){//week
      returnVal = Math.round(dtime/(60*60*24*7)) + _i18n('util.time.week');
    }else if(dtime>=60*60*24*30 && dtime<60*60*24*30*6){//month
      returnVal = Math.round(dtime/(60*60*24*7*4)) + _i18n('util.time.month');
    }else if(dtime>=60*60*24*30*6 && dtime<60*60*24*30*6*12){//half year
      returnVal = _i18n('util.time.half_year');
    }else if(dtime>=60*60*24*30*6*12){//year
      returnVal = Math.round(dtime/(60*60*24*30*6*12)) + _i18n('util.time.year');
    }
    return returnVal;
  };

  // 之前的判断对ie9判断错误
  util.isIE = function(){
    return isIE= $('html').hasClass("gt-ie8") || $('html').hasClass("lt-ie9") || $('html').hasClass("lt-ie8") || $('html').hasClass("lt-ie7");
  };

  util.get_imgurl = function(frameid,callback){
    $("#" + frameid).unbind("load");
    $("#" + frameid).load(function(){ // 加载图片
      if(App.util.isIE()){
	var returnVal = this.contentWindow.document.documentElement.innerText;
      }else{
	var returnVal = this.contentDocument.documentElement.textContent;
      }
      if(returnVal != null && returnVal != ""){
	var returnObj = eval(returnVal);
	if(returnObj[0] == 0){
	  var imgids = returnObj[1][0];
	  //for(var i=0;i<imgids.length;i++){ // 上传无需for循环
	  var uid = imgids.split(":")[0];
	  var imgid = imgids.split(":")[1];
	  var url = P+"/user/"+ uid +"/image/" +imgid;
	  callback(null, url);
	}else{//上传图片失败
	  callback("imageUp_fail", null);
	}
      }
    });
  };

  util.img_load = function(img){
    img.onload = null;
    if(img.readyState=="complete"||img.readyState=="loaded"||img.complete){
      setTimeout(function(){
	$(".fake_"+img.id).hide();
	$("."+img.id).show();
      },0);
    }
  };

  util.img_error = function(img){
    img.src='img/img_error.jpg';
    $(".fake_" + img.id).hide();
    $("." + img.id).show();
    img.onload = function(){
      $("#list").masonry("reload");
    };
  };

  util.clearFileInput = function(file){
    var form=document.createElement('form');
    document.body.appendChild(form);
    //记住file在旧表单中的的位置
    var pos=file.nextSibling;
    form.appendChild(file);
    form.reset();
    pos.parentNode.insertBefore(file,pos);
    document.body.removeChild(form);
  };

  return util;
})();
App.Convert = (function(App, Backbone, $){
  var Convert = {};
  // filter facility

  // 代替了filterPastetext的过滤方法
  Convert.filter = function (html) {
    if (isWord(html)) {html = cleanWord(html);}
     // 本身是在 cleanHtml中的因为要和cleanComment公用，所以挪出此句子
    html = html.replace(/\r\n|\n|\r/ig, "");
    html = _cleanHtml(html);
    html = _htmlToUbb(html);
    html = _ubbToHtml(html);
    return html;
  };

  Convert.toUbb = function(html){
    html = _htmlToUbb(html);
    return html;
  };

  Convert.cleanHtml = _cleanHtml;
  Convert.htmlToUbb = _htmlToUbb;
  Convert.ubbToHtml = _ubbToHtml;

  function isWord(strValue) {
    var re = new RegExp(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig);
    return re.test(strValue);
  }

  var ensureUnits = function(v) {
    return v + ((v !== "0") && (/\d$/.test(v)))? "px" : "";
  };

  function cleanWord(str) {
    // console.log(str);
    //remove link break
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove &nbsp; entities at the start of contents
    str = str.replace(/^\s*(&nbsp;)+/ig, "");
    //remove &nbsp; entities at the end of contents
    str = str.replace(/(&nbsp;|<br[^>]*>)+\s*$/ig, "");
    // Remove comments
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    // Remove scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
    // keep img
    str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi, "");
    // str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //convert word headers to strong
    str = str.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
    //remove lang attribute
    str = str.replace(/(lang)\s*=\s*([\'\"]?)[\w-]+\2/ig, "");
    // Examine all styles: delete junk, transform some, and keep the rest
    str = str.replace(/(<[a-z][^>]*)\sstyle="([^"]*)"/gi, function(str, tag, style) {
      var n = [],s = $.trim(style).replace(/&quot;/gi, "'").split(";");
      // Examine each style definition within the tag's style attribute
      for (var i = 0; i < s.length; i++) {
        v = s[i];
        var name, value, parts = v.split(":");
        if (parts.length == 2) {
          name = parts[0].toLowerCase();
          value = parts[1].toLowerCase();
          // Translate certain MS Office styles into their CSS equivalents
          switch (name) {
          case "mso-padding-alt":
          case "mso-padding-top-alt":
          case "mso-padding-right-alt":
          case "mso-padding-bottom-alt":
          case "mso-padding-left-alt":
          case "mso-margin-alt":
          case "mso-margin-top-alt":
          case "mso-margin-right-alt":
          case "mso-margin-bottom-alt":
          case "mso-margin-left-alt":
          case "mso-table-layout-alt":
          case "mso-height":
          case "mso-width":
          case "mso-vertical-align-alt":
            n[i++] = name.replace(/^mso-|-alt$/g, "") + ":" + ensureUnits(value);
            continue;

          case "horiz-align":
            n[i++] = "text-align:" + value;
            continue;

          case "vert-align":
            n[i++] = "vertical-align:" + value;
            continue;

          case "font-color":
          case "mso-foreground":
            n[i++] = "color:" + value;
            continue;

          case "mso-background":
          case "mso-highlight":
            n[i++] = "background:" + value;
            continue;

          case "mso-default-height":
            n[i++] = "min-height:" + ensureUnits(value);
            continue;

          case "mso-default-width":
            n[i++] = "min-width:" + ensureUnits(value);
            continue;

          case "mso-padding-between-alt":
            n[i++] = "border-collapse:separate;border-spacing:" + ensureUnits(value);
            continue;

          case "text-line-through":
            if ((value == "single") || (value == "double")) {
              n[i++] = "text-decoration:line-through";
            }
            continue;

          case "mso-zero-height":
            if (value == "yes") {
              n[i++] = "display:none";
            }
            continue;
          }
          // Eliminate all MS Office style definitions that have no CSS equivalent by examining the first characters in the name
          if (/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?:align|decor|indent|trans)|top-bar|version|vnd|word-break)/.test(name)) {
            continue;
          }
          // If it reached this point, it must be a valid CSS style
          n[i++] = name + ":" + parts[1];
          // Lower-case name, but keep value case
        }
      }
      return tag;
      /*
       *       // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
       *       if (i > 0) {
       *         return tag + ' style="' + n.join(';') + '"';
       *       } else {
       *         return tag;
       *       }
       *       */
       });
    return str;
  }

  function _cleanHtml(str) {
    //remove html body form
    str = str.replace(/<\/?(html|body|form)(?=[\s\/>])[^>]*>/ig, "");
    //remove doctype
    str = str.replace(/<(!DOCTYPE)(\n|.)*?>/ig, "");
    // Word comments like conditional comments etc
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    //remove xml tags
    str = str.replace(/<(\/?(\?xml(:\w+)?|xml|\w+:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //remove head
    str = str.replace(/<head[^>]*>(\n|.)*?<\/head>/ig, "");
    //remove <xxx>...</xxx>
    str = str.replace(/<(head|script|style|textarea|button|select|option|iframe)[^>]*>(\n|.)*?<\/\1>/ig, "");
    //remove <xxx />
    str = str.replace(/<(script|style|link|title|meta|textarea|option|select|iframe|hr)(\n|.)*?\/>/ig, "");
    //remove empty span
    str = str.replace(/<span[^>]*?><\/span>/ig, "");
    //remove table and <a> tag,<input> tag (this can help filter unclosed tag)
    // str = str.replace(/<\/?(input|iframe|div)[^>]*>/ig, "");
    str = str.replace(/<\/?(input|iframe)[^>]*>/ig, "");
    // keep img&a 需要在后边将div转换为\n
    // str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|img|input|iframe|div)[^>]*>/ig, "");
    str = str.replace(/<\/?(table|tr|td|tbody|thead|th|input|iframe)[^>]*>/ig, "");
    //remove bad attributes
    do {
      len = str.length;
      str = str.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|class|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
    } while (len != str.length);
    return str;
  }

  // 对与pre和code类的标签此处是作为文本内容进行处理的
  function _htmlToUbb(html){
    var text = html;
    // 先将不是html的网址转换成 a 标签"
    var re=/((https?|ftp|news):\/\/)?([A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"\s\u4E00-\u9FA5\uf900-\ufa2d])*)/g;
    var reg = /(="|='|=)(?=http:\/\/)/;
    var reg1 = /\*?url/;
    var no_transform_A,no_transform_B,url_front = "",url_back="";
    text = text.replace(re,function(a,b,c,d,e,f){
      // 使用a来拼正则表达式,报错
      if(c=="http" || c=="https" || c=="ftp" || c=="news"){
	url_front = text.substring(f-5,f-1);
	url_back = text.substring(f+a.length,f+a.length+4);
      }
      // url_front 可能是title
      no_transform_A = reg1.test(url_front) ? true : url_front == "ref=" ? true : url_front == "src=" ? true : url_front == "tle=" ? true : url_front == "itle" ? true : false ; //ref是A标签中的标志(href),src是图片标志，url是某些CSS背景图片,某些title也用了url地址
      no_transform_B = url_back == "</a>" ? true : url_back == "</A>" ? true : false;
      if(c == "" || c === undefined ) no_transform_A = true;
      // alert("a = " + a + " b = " + b + " c = " + c + " d = " + d + " e = " + e + " f = " + f + " notransform_A = " + no_transform_A + " notransform_B =" + no_transform_B);
      if(no_transform_A || no_transform_B){ // www.baidu.com、超链接直接返回
	return a;
      }else{
	return '<a href="'+a+'">'+a+'</a>&nbsp;'; // 火狐浏览器超链接截断
      }
    });
    //并不完善需没办法正确处理超链接图片
    // Format anchor tags properly.
    // input - <a class='ahref' href='http://pinetechlabs.com/' title='asdfqwer\"><b>asdf</b></a>"
    // output - asdf (http://pinetechlabs.com/)"
    text = text.replace(/<\s*a[^>]*href=['"](.*?)['"][^>]*>([\s\S]*?)<\/\s*a\s*>/ig, "[url=$1]$2[/url]");
    // Format image tags properly.'
    // input - <img src="http://what.url.jpg" />'
    // output - [http://what.url.jpg]'
    text = text.replace(/<\s*img[^>]*src=['"](.*?)['"][^>]*>/ig, "[img]$1[/img]");
    text = toText(text);
    return text;
  }

  function _ubbToHtml(ubb){
    // flag仅仅用来标识是否需要在text上加上p标签
    var text = ubb;
    text = text.replace(/\[b\](.*?)\[\/b\]/ig, "<b>$1</b>");
    text = text.replace(/\[i\](.*?)\[\/i\]/ig, "<i>$1</i>");
    text = text.replace(/\[u\](.*?)\[\/u\]/ig, "<u>$1</u>");
    text = text.replace(/\n{2,}/ig, "<\/p><p>");
    text = text.replace(/\n/ig, "<\/br>");
    text = text.replace(/\[url=(.*?)\](.*?)\[\/url\]/ig, "<a href=\"$1\">$2</a>");
    text = text.replace(/\[img=(.*?)\]/ig, "<img src=\"$1\" />");
    text = text.replace(/\[img\](.*?)\[\/img\]/ig, "<img src=\"$1\" onerror=\"App.util.img_error(this)\"" +" />");//详情页图片加载失败后加载统一图片
    text = "<p>" + text + "</p>";
    return text;
  }

  // https://github.com/mtrimpe/jsHtmlToText/blob/master/jsHtmlToText.js

  /* I scanned http://en.wikipedia.org/wiki/HTML_element for all html tags.
   *   I put those tags that should affect plain text formatting in two categories:
   *   those that should be replaced with two newlines and those that should be
   *   replaced with one newline. */

  var DoubleLineTags = ['p', 'h[1-6]', 'dl', 'dt', 'dd', 'ol', 'ul', 'dir', 'address', 'blockquote', 'center', 'div', 'hr', 'pre', 'form', 'textarea', 'table'];

  var SingleLineTags = ['li', 'del', 'ins', 'fieldset', 'legend', 'tr', 'th', 'caption', 'thead', 'tbody', 'tfoot'];

  // 去掉 html 的所有标签，获取 html 内容的 text 格式
  function toText(html) {
    var text = html
      // Remove line breaks
    .replace(/(?:\n|\r\n|\r)/ig, " ")
      // Remove content in script tags.
    .replace(/<\s*script[^>]*>[\s\S]*?<\/script>/mig, "")
      // Remove content in style tags.
    .replace(/<\s*style[^>]*>[\s\S]*?<\/style>/mig, "")
      // Remove content in comments.
    .replace(/<!--.*?-->/mig, "")
      // Remove !DOCTYPE
    .replace(/<!DOCTYPE.*?>/ig, "");
    text = text.replace(/<\/?\s*p[^>]*>/gi, '\n\n');
    text = text.replace(/<\/?\s*h[1-6][^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dl[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dt[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dd[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*ol[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*ul[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dir[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*address[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*blockquote[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*center[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*div[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*hr[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*pre[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*form[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*textarea[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*table[^>]*>/ig, '\n\n');

    /*var SingleLineTags = ['li', 'del', 'ins', 'fieldset', 'legend', 'tr', 'th', 'caption', 'thead', 'tbody', 'tfoot'];*/
    text = text.replace(/<\s*li[^>]*>/ig, '\n');
    text = text.replace(/<\s*del[^>]*>/ig, '\n');
    text = text.replace(/<\s*ins[^>]*>/ig, '\n');
    text = text.replace(/<\s*fieldset[^>]*>/ig, '\n');
    text = text.replace(/<\s*legend[^>]*>/ig, '\n');
    text = text.replace(/<\s*tr[^>]*>/ig, '\n');
    text = text.replace(/<\s*th[^>]*>/ig, '\n');
    text = text.replace(/<\s*caption[^>]*>/ig, '\n');
    text = text.replace(/<\s*thead[^>]*>/ig, '\n');
    text = text.replace(/<\s*tbody[^>]*>/ig, '\n');
    text = text.replace(/<\s*tfoot[^>]*>/ig, '\n');
    // Replace <br> and <br/> with a single newline
    text = text.replace(/<\s*br[^>]*\/?\s*>/ig, '\n');
    /*
    for (i = 0; i < DoubleLineTags.length; i++) {
      var r = RegExp('</?\\s*div[^>]*>', 'ig');
      console.log("r :: " + r);
      text = text.replace(r, '\n\n');
    }
    for (i = 0; i < SingleLineTags.length; i++) {
      var r = RegExp('<\\s*' + SingleLineTags[i] + '[^>]*>', 'ig');
      console.log("r :: " + r);
      text = text.replace(r, '\n');
    }*/
    // Replace <br> and <br/> with a single newline
    text = text.replace(/<\s*br[^>]*\/?\s*>/ig, '\n');
    text = text
    // Remove all remaining tags.
    .replace(/(<([^>]+)>)/ig, "")
    // Trim rightmost whitespaces for all lines
    .replace(/([^\n\S]+)\n/g, "\n")
    // .replace(/([^\n\S]+)$/, "")
    // Make sure there are never more than two
    // consecutive linebreaks.
    .replace(/\n{2,}/g, "\n\n")
    // Remove newlines at the beginning of the text.
    .replace(/^\n+/, "")
    // Remove newlines at the end of the text.
    .replace(/\n+$/, "");
    // .replace(/&([^;]+);/g, decode);
    // Decode HTML entities.
    return text;
  }

  var DecodeMap = {
    'nbsp' : 160, 'iexcl' : 161, 'cent' : 162, 'pound' : 163,
    'curren' : 164, 'yen' : 165, 'brvbar' : 166, 'sect' : 167,
    'uml' : 168, 'copy' : 169, 'ordf' : 170, 'laquo' : 171,
    'not' : 172, 'shy' : 173, 'reg' : 174, 'macr' : 175,
    'deg' : 176, 'plusmn' : 177, 'sup2' : 178, 'sup3' : 179,
    'acute' : 180, 'micro' : 181, 'para' : 182, 'middot' : 183,
    'cedil' : 184, 'sup1' : 185, 'ordm' : 186, 'raquo' : 187,
    'frac14' : 188, 'frac12' : 189, 'frac34' : 190, 'iquest' : 191,
    'Agrave' : 192, 'Aacute' : 193, 'Acirc' : 194, 'Atilde' : 195,
    'Auml' : 196, 'Aring' : 197, 'AElig' : 198, 'Ccedil' : 199,
    'Egrave' : 200, 'Eacute' : 201, 'Ecirc' : 202, 'Euml' : 203,
    'Igrave' : 204, 'Iacute' : 205, 'Icirc' : 206, 'Iuml' : 207,
    'ETH' : 208, 'Ntilde' : 209, 'Ograve' : 210, 'Oacute' : 211, 'Ocirc' : 212,
    'Otilde' : 213, 'Ouml' : 214, 'times' : 215, 'Oslash' : 216,
    'Ugrave' : 217, 'Uacute' : 218, 'Ucirc' : 219, 'Uuml' : 220,
    'Yacute' : 221, 'THORN' : 222, 'szlig' : 223, 'agrave' : 224,
    'aacute' : 225, 'acirc' : 226, 'atilde' : 227, 'auml' : 228,
    'aring' : 229, 'aelig' : 230, 'ccedil' : 231, 'egrave' : 232,
    'eacute' : 233, 'ecirc' : 234, 'euml' : 235, 'igrave' : 236,
    'iacute' : 237, 'icirc' : 238, 'iuml' : 239, 'eth' : 240, 'ntilde' : 241,
    'ograve' : 242, 'oacute' : 243, 'ocirc' : 244, 'otilde' : 245,
    'ouml' : 246, 'divide' : 247, 'oslash' : 248, 'ugrave' : 249,
    'uacute' : 250, 'ucirc' : 251, 'uuml' : 252, 'yacute' : 253, 'thorn' : 254,
    'yuml' : 255, 'quot' : 34, 'amp' : 38, 'lt' : 60, 'gt' : 62, 'OElig' : 338,
    'oelig' : 339, 'Scaron' : 352, 'scaron' : 353, 'Yuml' : 376, 'circ' : 710,
    'tilde' : 732, 'ensp' : 8194, 'emsp' : 8195, 'thinsp' : 8201,
    'zwnj' : 8204, 'zwj' : 8205, 'lrm' : 8206, 'rlm' : 8207, 'ndash' : 8211,
    'mdash' : 8212, 'lsquo' : 8216, 'rsquo' : 8217, 'sbquo' : 8218,
    'ldquo' : 8220, 'rdquo' : 8221, 'bdquo' : 8222, 'dagger' : 8224,
    'Dagger' : 8225, 'permil' : 8240, 'lsaquo' : 8249, 'rsaquo' : 8250,
    'euro' : 8364
  };

function decode(m, n) {
  var code;
  if (n.substr(0, 1) == '#') {
    if (n.substr(1, 1) == 'x') {
      code = parseInt(n.substr(2), 16);
    } else {
      code = parseInt(n.substr(1), 10);
    }
  } else {
    code = DecodeMap[n];
  }
  return (code === undefined || code === NaN) ? '&' + n + ';' : String.fromCharCode(code);
}
return Convert;

})(App, Backbone, jQuery);

							   /*
  var filterPasteText = function(str){
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove html body form
    str = str.replace(/<\/?(html|body|form)(?=[\s\/>])[^>]*>/ig, "");
    //remove doctype
    str = str.replace(/<(!DOCTYPE)(\n|.)*?>/ig, "");
    // Word comments like conditional comments etc
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    //remove xml tags
    str = str.replace(/<(\/?(\?xml(:\w+)?|xml|\w+:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //remove head
    str = str.replace(/<head[^>]*>(\n|.)*?<\/head>/ig, "");
    //remove <xxx />
    str = str.replace(/<(script|style|link|title|meta|textarea|option|select|iframe|hr)(\n|.)*?\/>/ig, "");
    //remove empty span
    str = str.replace(/<span[^>]*?><\/span>/ig, "");
    //remove <xxx>...</xxx>
    str = str.replace(/<(head|script|style|textarea|button|select|option|iframe)[^>]*>(\n|.)*?<\/\1>/ig, "");
    //remove table and <a> tag,<input> tag (this can help filter unclosed tag)
    str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|input|iframe|div)[^>]*>/ig, "");
    //remove table and <a> tag, <img> tag,<input> tag (this can help filter unclosed tag)
    // str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|img|input|iframe|div)[^>]*>/ig, "");
    //remove bad attributes
    do {
      len = str.length;
      str = str.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|class|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
    } while (len != str.length);
    return str;
  };
 */

App.versions = (function($){
  var versions = {};
  versions.language = {zh:"中文",en:"English"};
  var i18n = {
    // 中文版
    zh : {
      me : {
	mine      : "我的",
	recommend : "@我",
	interest  : "朋友",
	set       : "&nbsp;&nbsp;设置",
	logout    : "&nbsp;&nbsp;登出",
	login     : "登 录",
	register  : "注 册",
	help      : "帮 助",
	ok        : "确 定"
      },

      login : {
	default_name  : "用户名/Email",
	title       : "用户登录" ,
	login_ok    : "登 录",
	register_ok : "注 册",
	login_state : "在此浏览器保持登录",
	findpass    : "忘记密码请<a href = '/#password/find' >点这里</a>",
	register    : "注 册",
	twitter     : "通过 Twitter 登录",
	weibo       : "通过微博登录",
	name : {
	  name      : "用户名",
	  is_null    : "用户名尚未填写",
	  not_exist   : "用户名不存在",
	  invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	  exist       : "此用户名已经存在"
	},
	pass : {
	  pass : "密码",
	  is_null     : "密码尚未填写",
	  not_match   : "您的密码不正确"
	}
      },
      register : {
	title       : "用户注册" ,
	register_ok : "注 册",
	login       : "登 录",
	register_state : "同意<a href='#'>用户协议</a>",
	register    : "嫌麻烦？直接发邮件到<a href='mailto:1@cliclip.com'>1@cliclip.com</a>也可注册",
	name : {
	  name      : "用户名",
	  is_null    : "用户名尚未填写",
	  not_exist   : "用户名不存在",
	  invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	  not_allow   : "此用户名不允许注册",
	  exist       : "此用户名已经存在"
	},
	pass : {
	  pass : "密码",
	  is_null     : "密码尚未填写"
	}
      },
      help :{
	title       :"帮 助",
	title_small :"&nbsp;&nbsp;帮助"
      },
      userface : {
	zhui        : "zhui",
	stop        : "stop",
	mfollowing  : "我追的",
	mfollow     : "追我的",
	following   : "ta追的",
	follow      : "追ta的",
	mysearch    : "搜我的摘录",
	search      : "搜ta的摘录",
	tsearch      : "搜索"
      },

      bubb : {
	follow      : "追",
	unfollow    : "停",
	reclip      : "收"
      },

      faceEdit : {
	title       : "设置",
	no_name     : "无名氏",
	set_name    : "设置用户名",
	ok          : "确 定",
	upload      : "上传本地图像",
	name : {
	  is_null    : "请填写用户名",
	  invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	  exist       : "此用户名已经存在"
	}
      },

      languageSet:{
	lang : "界面语言"
      },

      ruleEdit : {
	head        : "邮件摘录反垃圾规则",
	open_rule   : "启用",
	desc        : "不符合规则的邮件会被当作是垃圾邮件",
	title       : "标题必须有",
	cc_text     : "必须抄送给",
	to_text     : "必须发给",
	update      : "更新规则",
	cc : {
	  invalidate  : "抄送人中含有无法辨识的邮件地址"
	},
	to : {
	  invalidate  : "收件人中含有无法辨识的邮件地址"
	}
      },

      passEdit : {
	title       : "修改密码",
	update      : "更 改",
	danger_operate : "高危操作",
	export      : "导出摘录",
	delete      : "删除账户",
	is_null     : "密码尚未填写",
	not_match   : "两次输入的密码不一致",
	auth_success: "您的密码已更改",
	newpass : {
	  prompt:"请输入新密码",
	  is_null:"请输入新密码"
	},
	conpass:{
	  prompt:"再次输入新密码",
	  is_null:"请再次输入相同的密码"
	},
	confirm:{
	  password_diff: "两次输入的密码不一致"
	}
      },

      emailEdit : {
	title       : "邮件摘录",
	add         : "增加邮箱",
	del         : "删除邮箱"
      },

      emailAdd : {
	title       : "增加邮箱",
	ok          : "确 定",
	cancel      : "取 消",
	email : {
	  is_Exist  : "邮件地址已经存在",
	  you_exist : "您已经添加过该邮件地址",
	  other_exist:"您所添加的邮件地址已经在系统中了",
	  invalidate: "邮件地址格式有误",
	  is_null   : "请输入邮件地址"
	}
      },

      weiboEdit : {
	title       : "微博摘录",
	add         : "关联微博帐号",
	del         : "删除微博账号"
      },
      twitterEdit : {
	title       : "Twitter摘录",
	add         : "关联Twitter帐号",
	del         : "删除Twitter账号"
      },

      clipmemo : {
	title       : "标注",
	memo        : "备注一下吧~",
	"private"   : "不公开",
	ok          : "确 定",
	cancel      : "取 消"
      },

      editDetail : {
	note_message: "添加标注",
	upload      : "上传图片",
	link        : "链接图片",
	clear       : "整理格式",
	update      : "修 改",
	ok          : "确 定",
	ok_title    : "保 存",
	cancel      : "取 消",
	cancel_title: "放 弃"
      },

      delete : {
	title       : "删除",
	h3          : "真的要删除吗？",
	p           : "删除操作无法恢复",
	ok          : "确 定",
	cancel      : "取 消"
      },

      reclip : {
	title       : "转载",
	defaultNote : "备注一下吧~",
	"private"   : "不公开",
	ok          : "确 定",
	cancel      : "取 消"
      },

      reclipTag : {
	title       : '您将转摘%d条数据',
	defaultNote : "备注一下吧~",
	"private"   : "不公开",
	ok          : "确 定",
	cancel      : "取 消"
      },

      recommend :{
	title       : "转发",
	defaultText : "说点啥吧～(140字以内)",
	reclip      : "同时转摘",
	ok          : "确 定",
	cancel      : "取 消",
	is_null     : "请添加用户",
	not_exist   : "您添加的用户不存在",
	is_null     : "请您先设置推荐备注",
	recomm_name : {
	  is_null   : "请添加用户名",
	  not_exist : "您添加的用户不存在"
	},
	recomm_text : {
	  is_null   : "请您先设置推荐备注",
	  word_limit :"请把文字长度限制在140字以内"
	}
      },

      comment : {
	title       : "评论",
	defaultText : "说点什么吧~(140字以内)",
	reclip      : "同时转摘",
	comm_text   : {
	  is_null   : "评论内容为空",
	  word_limit :"请把文字长度限制在140字以内"
	},
	ok          : "确 定",
	cancel      : "取 消"
      },

      detail : {
	route       : "录线图",
	comment     : "评论",
	recommend   : "转发",
	reclip      : "转摘",
	delete      : "删除",
	update      : "修改",
	memo        : "标注"
      },

      showcomment : {
	reply       : "回复",
	delete      : "删除",
	text        : "此内容已被删除",
	pack        : "(收起)",
	open        : "(展开)"
      },

      addcomm : {
	defaultText : "说点什么吧~",
	reclip      : "同时转摘",
	commentOK   : "评论",
	cancel      : "取消"
      },

      addClip : {
	title       : "新建摘录",
	note_message: "添加标注",
	upload      : "上传图片",
	link        : "链接图片",
	clear       : "整理格式",
	ok          : "确 定",
	cancel      : "取 消",
	back        : "返 回",
	clean       : "清 空"
      },

      clippreview : {
	reprint     : "转摘",
	reply       : "评论",
	comment     : "评论",
	recommend   : "转发",
	reclip      : "转摘",
	delete      : "删除",
	update      : "修改",
	memo        : "标注"
      },

      follower : {
	mfollower   : "追我的",
	mfollowing  : "我追的",
	follower    : "追ta的",
	following   : "ta追的",
	p           : "还没有人追你哟",
	all         : "所有"
      },

      following : {
	mfollower   : "追我的",
	mfollowing  : "我追的",
	follower    : "追ta的",
	following   : "ta追的",
	p           : "你还没有追任何人哟",
	all         : "所有"
      },

      bind : {
	header   : "您已登录 %s 账户，但此帐户尚未将关联任何点忆帐户。",
	bind        : "关联已有帐户",
	register    : "注册新帐户",
	bind_ok     : "立即关联",
	register_ok : "立即注册"
      },

      findpass : {
	address: {
	  is_null   : "请输入您绑定的邮件地址",
	  not_found : "我们找不到你的账户",
	  invalidate: "邮件地址格式有误"
	},
	title       : "找回密码",
	email       : "邮箱地址",
	ok          : "确 定",
	cancel      : "取 消"
      },

      resetpass : {
	newpass : {
	  is_null:"请输入新密码"
	},
	conpass:{
	  is_null:"请再次输入相同的密码"
	},
	confirm:{
	  password_diff: "两次输入的密码不一致"
	},
	title       : "设置新密码",
	new_pass    : "新密码",
	ok          : "确定",
	reset       : "重置"
      },

      gotosetup : {
	register_success : "您的注册已完成。下一步，您可添加常用的邮件地址。",
	ok          : "确 定"
      },

      tag:{
	add_tag     : "添加标签",
	beyond      : "标签过长，最多支持5个汉字、10个英文字母或数字"
      },

      queryclip:{
	add         : "新建摘录",
	search      : "搜索"
      },

      feed:{
	feedback    : "意见反馈"
      },

      feedback:{
	title       : "意见反馈",
	ok          : "确定",
	cancel      : "取消",
	defaultText : "描述你的建议：(140字以内)",
	feedback_text   : {
	  is_null   : "评论内容为空",
	  word_limit :"请把文字长度限制在140字以内"
	}
      },

      message : {
	title         : "消息提示",
	ok            : "确 定",
	login_success : "您已成功登录",
	imageUp_error : "您上传的文件不是图片文件",
	imageUp_fail  : "对不起，上传失败",
	img_alt       : "对不起，图片加载失败",
	is_null       : "摘录不存在",
	not_array     : "摘录必须是数组",
	is_empty      : "摘录没有内容",
	no_uname      : "请先设置用户名",
	faceUp_success : "您的头像已更新",
	passwd_success : "您的密码已修改",
	resetpwd_success:"您的密码已重置",
	setRule_success: "您已成功更新邮箱摘录反垃圾规则",
	rename_success : "您的用户名已经修改",
	reclip_null    : "该标签下暂时还没有数据",
	reclip_tag_success : "恭喜您，转摘成功！",
	reclip_tag_fail: "您已经拥有这些摘录了！",
	reclip_tag     : "您成功转摘了 %s 条摘录",
	comment        : "评论成功",
	recomm         : "转发成功",
	feedback_ok    : "发送成功",
	feedback_fail  : "发送失败",
	go_resetpass   : "找回密码邮件已经发送至 %s 邮箱，请在30分钟内从邮件中获取链接重置密码",
	link:{
	  expired: "此链接已过期",
	  not_exists: "此链接无效",
	  invalidate: "此链接格式有误"
	},
	weibo_sucmsg   : "恭喜您，微博帐号 %s 关联成功，在新浪微博中 @cliclip 就可以摘录到点忆(评论除外)，现在就去 @ 一条<a href='http://weibo.com' target='_blank'>试试</a>？",
	twitter_sucmsg :"恭喜您，Twitter帐号 %s 已关联成功，您在 Twitter 的收藏(评论除外)可以直接摘录到点忆，现在就去收藏一条<a href='http://twitter.com' target='_blank'>试试</a>？",
	InternalOAuthError:"认证失败，请重试",
	reclip:{
	  success: "转摘成功",
	  no_pub: "作者没有公开该条摘录，您暂时不能转摘"
	},
	invite         : "您已通过发往 %s 邮件地址的邀请注册成功。我们建议您立即修改密码并设置自己的用户名。",
	addemail       : "您已成功添加 %s 邮件地址。请登录您的邮箱，查收邮件，并点击其中的链接进行激活。",
	cliplist_null:{
	  all:"抱歉，没有找到相关的信息......",
	  my:"抱歉，没有找到相关的信息......",
	  interest:"抱歉，没有找到相关的信息......",
	  recommend:"抱歉，没有找到相关的信息......"
	},
	error_message :"操作失败，请重试",
	clip : {
	  has_this_clip: "您已经有该条摘录了",
	  has_recliped : "您已经转摘过该条摘录了",
	  not_exist    : "摘录不存在",
	  deleted      : "此条摘录已经被删除！",
	  no_public    : "作者没有公开此条摘录！"
	},
	content:{
	  is_null      : "摘录内容不能为空",
	  not_array    : "摘录必须是数组",
	  is_empty     : "摘录不能为空",
	  no_change    : "摘录内容没有变化"
	},
	follow:{
	  all          : "您已经追了该用户的全部标签",
	  cannot_follow_self : "您不能追自己"
	},
	error:{
	  "link 已作废": "此链接已过期",
	  "link doesnt exist": "此链接无效",
	  "link invalidate": "此链接格式有误"
	},
	accept:{
	  fail         :"此注册链接已过期。您可直接注册，再到设置界面添加您的邮箱地址。"
	},
	active:{
	  fail         : "此激活链接已过期。您可在设置界面重新添加。",
	  email        : "您已激活 %s 邮箱地址。\n可以使用该邮箱地址进行登录，您使用该地址发到1@cliclip.com的邮件，会保存为您的私有摘录。"
	},
	email:{
	  no_uname     : "请先设置用户名"
	},
	rule:{
	  not_update   : "您没有设置邮件摘录的反垃圾规则"
	},
	recommend:{
	  no_pub      : "这条摘录是私有数据，您不能进行推荐"
	}
      },

      warning : {
	title          : "操作确认",
	ok             : "确 定",
	cancel         : "取 消",
	no_name        : "您还没有设置用户名，目前只能进行摘录的增加、修改、删除操作。请设置用户名，开启更多操作",
	delemail       : "您真的要删除 %s 邮件地址吗？",
	deloauth       : "您真的要删除 %s 账号关联吗？",
	account_hasbind : "您的帐号之前已经做过关联，若要重新关联，请先解绑",
	oauth_fail     : "认证失败，请重新认证！",
	del_oauth_fail : "解除关联出问题啦，再试一次吧",
	memo_save      : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	clipedit_save  : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	reclip_save    : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	recommend_save : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	comment_save   : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	clipadd_save   : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	emailadd_save  : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	del_comment    : "您真的要删除这条评论吗？",
	auth:{
	  no_name     : "请先设置您的用户名",
	  not_login   : "请您先登录",
	  not_self    : "您的登录以过期，请从新登录",
	  not_owner   : "您的登录以过期，请从新登录"
	},
	feedback_save  : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>"
      },
      util : {
	time:{
	  moment:"刚刚",
	  second:"秒前",
	  minute:"分钟前",
	  hour:"小时前",
	  day:"天前",
	  week:"周前",
	  month:"月前",
	  half_year:"半年前",
	  year:"年前"
	}
      }
    },


// english versions
    en : {
      me : {
	mine      : "My clips",
	recommend : "@Me",
	interest  : "Friends",
	set       : "Settings",
	logout    : "Logout",
	login     : "Login",
	register  : "Register",
	help      : "Help",
	ok        : "OK"
      },

      login : {
	default_name  : "User name/Email",
	title         : "User log in" ,
	login_ok      : "Login",
	register_ok   : "Register",
	findpass      : "Forgot your password <a href = '/#password/find' >click here</a>",
	login_state   : "Keep me logged in",
	register      : "Register",
	twitter       : "Login with Twitter",
	weibo         : "Login with Weibo",
	name : {
	  name        : "User name",
	  is_null     : "User name is missing",
	  not_exist   : "This user name does not exist",
	  invalidate  : "Invalid format of user name(Username may only contain alphanumerics, period, and be between 5 and 20 characters in length)",
	  exist       : "This user name already exists"
	},
	pass : {
	  pass        : "Password",
	  is_null     : "Password is missing",
	  not_match   : "Password is incorrect"
	}
      },

      register : {
	title         : "User log in" ,
	register_ok   : "Register",
	register      : "Register by simply sending an email to <a href='mailto:1@cliclip.com'>1@cliclip.com</a>",
	login         : "Login",
	register_state: "Agree to <a href='#'>user agreement</a>",
	name : {
	  name        : "User name",
	  is_null     : "User name is missing",
	  not_exist   : "This user name does not exist",
	  invalidate  : "Invalid format of user name(Username may only contain alphanumerics, period, and be between 5 and 20 characters in length)",
	  not_allow   : "This user name not allow register",
	  exist       : "This user name already exists"
	},
	pass : {
	  pass        : "Password",
	  is_null     : "Password is missing",
	  not_match   : "Password is incorrect"
	}
      },
      help :{
	title          :"Help",
	title_small    :"Help"
      },
      userface : {
	zhui        : "ezhui",
	stop        : "estop",
	mfollowing  : "Following",
	mfollow     : "Followed by",
	following   : "Following",
	follow      : "Followed by",
	mysearch    : "search my clip",
	search      : "search his clip",
	tsearch     : "Search"
      },

      bubb : {
	follow      : "follow",
	unfollow    : "unfollow",
	reclip      : "reclip"
      },

      faceEdit : {
	title       : "Settings",
	no_name     : "NO NAME",
	set_name    : "Set user name",
	ok          : "OK",
	upload      : "Upload image",
	name : {
	  is_null   : "User name is missing",
	  invalidate: "Invalid format of user name(user name may only contain alphanumerics, period, and be between 5 and 20 characters in length)",
	  exist     :"This user name already exists"
	}
      },

      languageSet:{
	lang:"Language setting"
      },

      ruleEdit : {
	open_rule   : "Enable",
	head        : "Spam filter rules",
	desc        : "Emails compliant with following rules will NOT be considered as spam",
	title       : "Title includes",
	cc_text     : "Cc‘d to",
	to_text     : "Sent to",
	update      : "Update",
	cc : {
	  invalidate: "Invalid email address"
	},
	to : {
	  invalidate: "Invalid email address"
	}
      },

      passEdit : {
	title       : "Change password",
	update      : "Change",
	danger_operate : "High-risk operations",
	export      : "Export clips",
	delete      : "Close your account",
	is_null     : "Password is missing",
	not_match   : "Password input not consistent",
	auth_success: "Password changed successfully",
	newpass : {
	  prompt:"Please enter new password",
	  is_null   :"Password is missing"
	},
	conpass:{
	  prompt:"Please re-enter new password",
	  is_null   :"Enter the same password"
	},
	confirm:{
	  password_diff: "Inconsistent password"
	}
      },

      emailEdit : {
	add         : "Add",
	title       : "Recognized emails",
	del         : "Delete Email"
      },

      emailAdd : {
	title       : "Add email",
	ok          : "OK",
	cancel      : "Cancel",
	email : {
	  is_Exist  : "Email address already exists",
	  you_exist : "You have already added that email address",
	  other_exist:"The email address you added has already been connected with other account in the system",
	  invalidate: "Invalid format of email address",
	  is_null   : "Email is missing"
	}
      },

      weiboEdit : {
	title       : "Recognized Weibo accounts",
	add         : "Add",
	del         : "Delete Weibo account"
      },
      twitterEdit : {
	title       : "Recognized twitter accounts",
	add         : "Add",
	del         : "Delete Twitter account"
      },

      clipmemo : {
	title       : "Tag it",
	memo        : "Type your note here",
	"private"   : "Private",
	ok          : "OK",
	cancel      : "Cancel"
      },

      editDetail : {
	note_message: "add notes",
	upload      : "Upload image",
	link        : "Web image",
	clear       : "Auto re-format",
	update      : "Edit",
	ok          : "OK",
	ok_title    : "Save",
	cancel      : "Cancel",
	cancel_title: "Quit"
      },

      delete : {
	title       : "Delete",
	h3          : "Do you really want to delete?",
	p           : "This clip will be deleted forever",
	ok          : "OK",
	cancel      : "Cancel"
      },

      reclip : {
	title       : "Reclip",
	defaultNote : "Type your note here",
	"private"   : "Private",
	ok          : "OK",
	cancel      : "Cancel"
      },

      reclipTag : {
	title       : 'You will reclip %d clips',
	defaultNote : "Type your note here",
	"private"   : "Private",
	ok          : "OK",
	cancel      : "Cancel"
      },

      recommend :{
	title       : "@",
	defaultText : "Say something (limited to 140 characters)",
	reclip      : "Reclip too",
	ok          : "OK",
	cancel      : "Cancel",
	is_null     : "Please add the recipient",
	not_exist   : "The recipient doesn't exist",
	is_null     :"Please add comments first",
	recomm_name : {
	  is_null   : "Please add the recipient",
	  not_exist : "The recipient doesn't exist"
	},
	recomm_text : {
	  is_null   :"Please add comments first",
	  word_limit :"Please limit your comments to 140 characters"
	}
      },

      comment : {
	title       : "Comment",
	defaultText : "Say something (limited to 140 characters)",
	comm_text   : {
	  is_null : "Please enter comments",
	  word_limit :"Please limited your comments to 140 characters",
	  defaultText : "Say something"
	},
	reclip      : "Reclip too",
	ok          : "OK",
	cancel      : "Cancel"
      },

      detail : {
	route       : "Map",
	comment     : "Comment",
	recommend   : "@",
	reclip      : "Reclip",
	delete      : "Delete",
	update      : "Edit",
	memo        : "Tag"
      },

      showcomment : {
	reply       : "Reply",
	delete      : "Delete",
	text        : "The comment has been removed",
	pack        : "(Collapse)",
	open        : "(Expand)"
      },

      addcomm : {
	defaultText : "Say something",
	reclip      : "Reclip too",
	commentOK   : "Comment",
	cancel      : "Cancel"
      },

      addClip : {
	note_message:"add notes",
	title       : "new clip",
	upload      : "Upload image",
	link        : "Web image",
	clear       : "Auto re-format",
	ok          : "OK",
	cancel      : "Cancel",
	back        : "Back",
	clean       : "Clear"
      },

      clippreview : {
	reprint     : "reclip(s)",
	reply       : "comment(s)",
	comment     : "Comment",
	recommend   : "@",
	reclip      : "Reclip",
	delete      : "Delete",
	update      : "Edit",
	memo        : "Tag"
      },

      follower : {
	mfollower   : "Followed by",
	mfollowing  : "Following",
	follower    : "Followed by",
	following   : "Following",
	p           : "Nobody is following you",
	all         : "All"
      },

      following : {
	mfollower   : "Followed by",
	mfollowing  : "Following",
	follower    : "Followed by",
	following   : "Following",
	p           : "You are not following anyone",
	all         : "All"
      },

      bind : {
	header      : "You have logged in with %s account, which is not connected with any Cliclip account",
	bind        : "Connect",
	register    : "Create",
	bind_ok     : "Connect now",
	register_ok : "Create now"
      },

      findpass : {
	address : {
	  is_null   : "Please enter a email address",
	  not_found : "This email doesn't belong to any account",
	  invalidate: "Invalid email address"
	},
	title       : "Retrieve password",
	email       : "Email address",
	ok          : "OK",
	cancel      : "Cancel"
      },

      resetpass : {
	newpass : {
	  is_null   :"Password is missing"
	},
	conpass:{
	  is_null   :"Enter the same password"
	},
	confirm:{
	  password_diff: "Inconsistent password"
	},
	title       : "Set new password",
	new_pass    : "New password",
	ok          : "OK",
	reset       : "Reset"
      },

      gotosetup : {
	register_success : "Congratulations! The registration is completed. Your next step is to add your email address",
	ok          : "OK"
      },

      tag:{
	add_tag     : "Add a tag",
	beyond      : "Tag is too long (maximum 5 Chinese characters, 10 letters or numbers)"
      },

      queryclip:{
	add         : "Add Clip",
	search      : "Search"
      },

      feed:{
	feedback    : "feedback"
      },

      feedback:{
	title       : "feedback",
	ok          : "OK",
	cancel      : "Cancel",
	defaultText : "Describe your suggestion (limited to 140 characters)",
	feedback_text   : {
	  is_null : "Please enter comments",
	  word_limit :"Please limited your comments to 140 characters"
	}
      },

      message : {
	title         : "Notice",
	ok            : "OK",
	login_success : "Log in successfully",
	imageUp_error : "The file is not an image",
	imageUp_fail  : "Sorry, image failed to upload",
	img_alt       : "Image failed to load",
	is_null       : "Clip does not exist",
	not_array     : "Clip must be array",
	is_empty      : "Clip cannot be empty",
	no_uname      : "Please set user name first",
	faceUp_success : "Your photo has been updated",
	passwd_success : "Your password has been changed",
	resetpwd_success :"Your password has been reseted",
	setRule_success: "Your rule for spam filter has been updated",
	rename_success : "Your User name has been changed",
	reclip_null    : "No clip under this tag",
	reclip_tag_success : "Reclip successful",
	go_resetpass  : "The findpass email has send to %s,please check in 30 minuts ",
	link:{
	  expired: "Link expired",
	  not_exists: "Invalid link",
	  invalidate: "Invalid link format"
	},
	reclip_tag_fail: "You have reclipped these already",
	reclip_tag     : "You have successfully reclipped %s new clips",
	reclip:{
	  success:"Recliped successfully",
	  no_pub: "This Clip is private, so you cannot reclip it"
	},
	recomm         : "Clip was forwarded(@) successfully",
	comment        : "Commented successfully",
	feedback_ok    : "Send successfully",
	feedback_fail  : "Send Fail",
	weibo_sucmsg:"Connect Sina Weibo account %s successfully. Now you can reclip clips from Sina Weibo(except comments), just @cliclip, <a href='http://weibo.com' target='_blank'>enjoy</a>!",
	twitter_sucmsg:"Connect Twitter account %s successfully. Now you can reclip clips from Twitter Favorite(except comments), <a href='http://twitter.com' target='_blank'>enjoy</a>!",
	InternalOAuthError:"Connection failed. Please try again.",
	invite         : "Successful registration by sending email %s. We strongly suggest you change password immediately and set your own username",
	addemail       : "You have added %s email. The activation link has been sent to this email account. Please check your email and click the activation link.",
	cliplist_null:{
	  all:"Sorry, no results found",
	  my:"Sorry, no results found",
	  interest:"Sorry, no results found",
	  recommend:"Sorry, no results found"
	},
	"error_message" :"Operation fail,please try again!",
	clip : {
	  has_this_clip: "You have this clip already",
	  has_recliped : "You have reclipped this already",
	  not_exist    : "This Clip doesn't  exist",
	  deleted      : "This Clip has been deleted",
	  no_public    : "This Clip is private"
	},
	content:{
	  is_null      : "Content can't be null",
	  not_array    : "Content must be array",
	  is_empty     : "Content can't be empty",
	  no_change    : "Content dose't change"
	},
	follow:{
	  all          : "You have already followed all tags of this user",
	  cannot_follow_self : "You can't follow youself"
	},
	error:{
	  "link 已作废": "Link expired",
	  "link doesnt exist": "Invalid link",
	  "link invalidate": "Invalid link format"
	},
	accept:{
	  fail         :"Registration link expired. You can Register directly and add email address in Setting"
	},
	active:{
	  fail         : "Activation link expired. You can add email again in Setting",
	  email   : "You have activated %s in our system. \nNow you can log in with this email account and clip by sending email from this account to 1@cliclip.com. Clips will be saved as private."
	},
	email:{
	  no_uname     : "Set your user name first"
	},
	rule:{
	  not_update   : "You have not set the rules for spam filter"
	},
	recommend:{
	  no_pub      :"This clip is private. You cannot recommend to others"
	}
      },

      warning : {
	title          : "Confirm",
	ok             : "OK",
	cancel         : "Cancel",
	no_name        : "Without user name, you can only add, update and delete clips. Please set your user name to enable more actions.",

	delemail       : "Do you really want to delete this email %s?",
	deloauth       : "Do you really want to delete this account %s?",
	oauth_fail   : "Authentication failed. Please try again",
	account_hasbind:"This account has been used before. Please enter another account",
	del_oauth_fail : "Delete account occur problem. Please try again",
	del_comment    : "Do you really want to delete this comment?",
	memo_save     :"If you close the window, what you entered will be lost. Are you sure?",
	clipedit_save :"If you close the window, what you entered will be lost. Are you sure?",
	reclip_save   :"If you close the window, what you entered will be lost. Are you sure?",
	recommend_save:"If you close the window, what you entered will be lost. Are you sure?",
	comment_save  :"If you close the window, what you entered will be lost. Are you sure?",
	clipadd_save  :"If you close the window, what you entered will be lost. Are you sure?",
	emailadd_save :"If you close the window, what you entered will be lost. Are you sure?",
	go_resetpass  : "The findpass email has send to %s,please check in 30 minuts ",
	del_comment   : "You really mean to delete this comment? It can’t restore any more",
	auth:{
	  no_name     : "Please set user name first",
	  not_login   : "Please log in first",
	  not_self    : "Your login expired,login in again",
	  not_owner   : "Your login expired,login in again"
	},
	feedback_save : "If you close the window,what you entered will be lost. Are you sure?"
      },
      util : {
	time:{
	  moment:"a moment ago",
	  second:" second(s) ago ",
	  minute:" minute(s) ago",
	  hour:" hour(s) ago",
	  day:" day(s) ago",
	  week:" week(s) ago",
	  month:" month(s) ago",
	  half_year:" six months ago",
	  year:" year(s) ago"
	}
      }
    }
  };

  window._i18n = function(){
    var lang = versions.getLanguage();
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    var names = name.split('.');
    var str = i18n[lang]?i18n[lang]:i18n['zh'];
    for(var i =0;i<names.length;i++){
      if(str[names[i]]) {
	str = str[names[i]];
      }else{
	console.info(name+"  未定义!!!");
	str = names.pop();
      }
    }
    var params = args;
    if (params.length > 0){
      str = $.sprintf(str, params);
    }
    return str;
  };

  versions.getLanguage = function() {
    var cookie_lang = App.util.getCookie("language");
    if(cookie_lang){
      return cookie_lang;
    } else if(window.navigator.language){
      return window.navigator.language.split("-")[0];
    } else{
      return "zh";
    }
  };

  App.vent.bind("app.versions:version_change", function(lang){
    versions.setLanguage(lang);
  });


  versions.setLanguage = function(lang){
    if(lang && versions.getLanguage() != lang){
      setCookieLang(lang);
      window.location.reload();
    }
  };

  function setCookieLang(lang){
    var data = new Date();
    data.setTime(data.getTime() + 30*24*60*60*1000);
    document.cookie = "language="+lang+";expires=" + data.toGMTString();
  }

  return versions;
})(jQuery);
App.Editor = (function(App, Backbone, $){
  var Editor = {};
  var isIE = App.util.isIE();
  Editor.init = function(){
    var ifrm=document.getElementById("editor");
    ifrm.contentWindow.document.designMode = "On";
    ifrm.contentWindow.document.write("<body style=\"font-size:16px;color:#333;line-height: 1.7;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;min-height:20px\"></body>");
    ifrm.contentWindow.document.close();
    if(isIE){
      ifrm.contentWindow.document.documentElement.attachEvent("onpaste", function(e){
	return pasteClipboardData(ifrm.id,e);
      });
    }else{
      // 用于保证chrome可以正确执行inserthtml和paste事件 [焦点获取方面的问题]
      ifrm.contentWindow.focus();
      ifrm.contentWindow.document.execCommand('inserthtml', false, "<br/>");
      ifrm.contentWindow.document.addEventListener("paste", function(e){
	return pasteClipboardData(ifrm.id,e);
      },false);
    }
  };

  Editor.getContent = function(editorId){
    var objEditor = document.getElementById(editorId); // 取得编辑器对象
    var data = objEditor.contentWindow.document.body.innerHTML;
    return App.Convert.toUbb(data); // 此处的内容会提交到api层去
  };

  // 与getContent对称 该js内部实现 [没有必要]
  Editor.setContent = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    if(isIE){ // 光标设置不管用
      setTimeout(function(){
	objEditor.contentWindow.focus();
	var range = objEditor.contentWindow.document.selection.createRange();
	range.pasteHTML(data);
	range.moveStart("character", -data.length);
	range.collapse(true); // 将插入点移动到当前范围的开始
	range.select(); // 将当前选中区置为当前对象
      },200);
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, data);
      var el = objEditor.contentWindow.document;
      var range = objEditor.contentWindow.getSelection().getRangeAt(0);
      var sel = objEditor.contentWindow.getSelection();
      range.setStart(el.body.childNodes[0], 0);
      range.collapse(true); // 将光标移动到editor的起始位置
      sel.removeAllRanges();
      sel.addRange(range);
      el.body.focus();
    };
  };

  Editor.focus = function(editroId){
    var ifrm=document.getElementById(editroId);
    ifrm.contentWindow.focus();
  };

  // data 可以是一个对象 没有必要设为数组
  Editor.insertImage = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    var img = "";
    if(data.url)
      img = "<img src="+data.url+ " style='max-width:630px;' />";
    if(isIE){ // TODO
      if(data.ieRange){
	data.ieRange.pasteHTML(img);
	data.ieRange.select();
	data.ieRange=false;//清空下range对象
      }else{
	objEditor.contentWindow.focus();
	var editor = objEditor.contentWindow.document.selection.createRange();
	editor.pasteHTML(img);
      }
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, img);
    }
  };

  var getSel = function (w){
    return w.getSelection ? w.getSelection() : w.document.selection;
  };

  var setRange = function (sel,r){
    sel.removeAllRanges();
    sel.addRange(r);
  };

  var block = function(e){
    e.preventDefault();
  };

  var pasteClipboardData = function(editorId,e){
    var w,or,divTemp,originText;
    var newData;
    var objEditor = document.getElementById(editorId);
    var edDoc=objEditor.contentWindow.document;
    if(isIE){
      var ifmTemp=document.getElementById("ifmTemp");
      if(!ifmTemp){
	ifmTemp=document.createElement("IFRAME");
	ifmTemp.id="ifmTemp";
	ifmTemp.style.width="1px";
	ifmTemp.style.height="1px";
	ifmTemp.style.position="absolute";
	ifmTemp.style.border="none";
	ifmTemp.style.left="-10000px";
	ifmTemp.src="iframeblankpage.html";
	document.body.appendChild(ifmTemp);
	ifmTemp.contentWindow.document.designMode = "On";
	ifmTemp.contentWindow.document.open();
	ifmTemp.contentWindow.document.write("<body></body>");
	ifmTemp.contentWindow.document.close();
      }else{
	ifmTemp.contentWindow.document.body.innerHTML="";
      }
      originText=objEditor.contentWindow.document.body.innerText;
      ifmTemp.contentWindow.focus();
      // 用剪贴板中的内容覆盖当前选取
      ifmTemp.contentWindow.document.execCommand("Paste",false,null);

      objEditor.contentWindow.focus();
      var orRange=objEditor.contentWindow.document.selection.createRange();
      newData=ifmTemp.contentWindow.document.body.innerHTML;
      //filter the pasted data
      newData =  App.Convert.filter(newData);
      // paste the data into the editor
      orRange.pasteHTML(newData);
      //block default paste
      if(e){ // 取消默认的粘贴事件
	e.returnValue = false;
	if(e.preventDefault)
	  e.preventDefault();
      }
      return false;
    }else{
      var scrollbody = $("#editor").get(0).contentWindow.document.body;
      var clientheight = scrollbody.clientHeight;
      enableKeyDown=false;
      //create the temporary html editor
      divTemp=edDoc.createElement("DIV");
      divTemp.id='htmleditor_tempdiv';
      divTemp.innerHTML='\uFEFF';
      divTemp.style.left="-10000px";	//hide the div
      divTemp.style.height="1px";
      divTemp.style.width="1px";
      divTemp.style.position="absolute";
      divTemp.style.overflow="hidden";
      edDoc.body.appendChild(divTemp);
      //disable keyup,keypress, mousedown and keydown
      objEditor.contentWindow.document.addEventListener("mousedown",block,false);
      objEditor.contentWindow.document.addEventListener("keydown",block,false);
      enableKeyDown=false;
      //get current selection;
      w=objEditor.contentWindow;
      or=getSel(w).getRangeAt(0);

      //move the cursor to into the div
      var docBody=divTemp.firstChild;
      rng = edDoc.createRange();
      rng.setStart(docBody, 0);
      rng.setEnd(docBody, 1);
      setRange(getSel(w),rng);
      originText=objEditor.contentWindow.document.body.textContent;
      // console.log(originText);
      if(originText==='\uFEFF'){
	originText="";
      }
      window.setTimeout(function(){
	//get and filter the data after onpaste is done
	if(divTemp.innerHTML==='\uFEFF'){
	  newData="";
	  edDoc.body.removeChild(divTemp);
	  return;
	}
	newData=divTemp.innerHTML;
	// Restore the old selection
	if (or){
	  setRange(getSel(w),or);
	}
	edDoc.body.removeChild(divTemp);
	newData =  App.Convert.filter(newData);
	// divTemp.innerHTML=newData;
	// paste the new data to the editor
	objEditor.contentWindow.document.execCommand('inserthtml',false,newData );
	// webkit为核心的浏览器
	if($('html').hasClass('websqldatabase')){
	  objEditor.contentWindow.document.execCommand('inserthtml',false,'<p>&nbsp;</p><span id="cke_paste_marker" data-cke-temp="1"></span>');
	  var marker = objEditor.contentWindow.document.getElementById('cke_paste_marker');
	  var top = $(marker).position().top;
	  $(marker).remove();
	  marker = null;
	  // console.log("top = " + top + "clientheight =" + clientheight);
	  $(scrollbody).scrollTop(top - clientheight);
	  // console.log("after set " + $(scrollbody).scrollTop());
	}
      },0);
      //enable keydown,keyup,keypress, mousedown;
      enableKeyDown=true;
      objEditor.contentWindow.document.removeEventListener("mousedown",block,false);
      objEditor.contentWindow.document.removeEventListener("keydown",block,false);
      return true;
    };
  };
  return Editor;
})(App, Backbone, jQuery);
App.ClipApp.Register = (function(App, Backbone, $){
  var Register = {};
  var P = App.ClipApp.Url.base;

  App.Model.RegisterModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(P + "/register");
    },
    validate: function(attrs){
      var err = {};
      if(!attrs.name ||attrs.name == ""){
        err.name = "is_null";
      }else if(!App.util.name_pattern.test(attrs.name)){
        err.name = "invalidate";
      }
      if(attrs.pass == ""){
	err.pass = "is_null";
      }
      return _.isEmpty(err) ? null : err;
    }
  });

  // 会在不同的区域进行显示
  var RegisterView = App.DialogView.extend({
    tagName: "div",
    className: "register-view",
    template: "#register-view-template",
    events:{
      "blur #name"     : "blurName",
      "blur #pass"     : "blurPass",
      "focus #name"    : "cleanError",
      "focus #pass"    : "cleanError",
      "input #name"   : "changeAction",
      "input #pass"   : "changeAction",
      "change #agree"   : "changeAction",
      "click #agree"   : "agreeAction",
      "click .r_login" : "gotoLogin",
      "click .reg_btn" : "submit",
      "click .weibo"   : "openWeibo",
      "click .twitter" : "openTwitter",
      "click .masker"  : "masker",
      "click .close_w" : "cancel"
    },
    initialize: function(){
      this.tmpmodel = new App.Model.RegisterModel();
      this.bind("@cancel", cancel);
    },
    blurName: function(e){
      var that = this;
      var name = $("#name").val();
      this.tmpmodel.save({name:name},{
	url : App.ClipApp.encodeURI(P+"/user/check/"+name),
	type: "GET",
	success:function(model,response){
	  if($("#pass").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	    $(".reg_btn").attr("disabled",false);
	  }
	},
	error:function(model,error){
	  that.showError("register",error);
	  $(".reg_btn").attr("disabled",true);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError("login",error);
	  $(".reg_btn").attr("disabled",true);
	}
      });
      if($("#name").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }
    },
    changeAction: function(e){
      if($("#name").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }
    },
    agreeAction: function(e){
      if($("#name").val() && $("#pass").val() && $(".error").length == 0 && $("#agree").attr("checked")){
	$(".reg_btn").attr("disabled",false);
      }else{
	$(".reg_btn").attr("disabled",true);
      }
    },
    gotoLogin : function(e){
      e.preventDefault();
      this.trigger("@cancel");
      App.ClipApp.showLogin();
    },
    submit: function(e){
      e.preventDefault();
      var that = this;
      var data = that.getInput();
      var model = new App.Model.RegisterModel();
      if($(".error").length == 0){
	if($("#agree").attr("checked")){
	  model.save(data,{
	    url : App.ClipApp.encodeURI(P+"/register"),
	    type: "POST",
	    success:function(model,response){
	      App.vent.trigger("app.clipapp.register:gotToken","register_success",response);
	    },
	    error:function(model,error){
	      that.showError('register',error);
	    }
	  });
	}else{
	  $(e.currentTarget).attr("disabled",true);
	}
      }else{
	$(e.currentTarget).attr("disabled",true);
      }
    },
    openWeibo : function(e){
      this.trigger("@cancel");
      window.location.href="/oauth/req/weibo";
    },
    openTwitter : function(e){
      this.trigger("@cancel");
      window.location.href="/oauth/req/twitter";
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@cancel");
      }
    },
    cancel : function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });

  Register.invite = function(key){
    var model = new App.Model(); // 不能用RegisterModel
    model.save({},{
      url : App.ClipApp.encodeURI(P+"/invite/"+key),
      type: "POST",
      success:function(model,response){
	App.vent.trigger("app.clipapp.register:gotToken","invite",response);
      },
      error:function(model,error){
	App.ClipApp.showConfirm(error);
      }
    });
  };

  Register.close = function(){
    App.popRegion.close();
  };

  Register.show = function(model, error){
    var registerModel = new App.Model.RegisterModel();
    if (model) registerModel.set(model.toJSON());
    if (error) registerModel.set("error", error);
    var registerView = new RegisterView({model: registerModel});
    App.popRegion.show(registerView);
    if(/language=en/.test(document.cookie)){
      $("#note_img").removeClass("note_img_zh");
      $("#note_img").addClass("note_img_en");
    }else{
      $("#note_img").removeClass("note_img_en");
      $("#note_img").addClass("note_img_zh");
    }
    $("#name").focus();
    $(".reg_btn").attr("disabled",true);
  };

  App.vent.bind("app.clipapp.register:gotToken", function(key, res){
    Register.close();
    var data = new Date();
    data.setTime(data.getTime() + 7*24*60*60*1000);
    document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    Backbone.history.navigate("my", true);
    App.vent.trigger("app.clipapp.register:success", key, res);
  });

  var cancel = function(){
    Register.close();
  };

  // Test
  // App.bind("initialize:after", function(){Register.show();});

  return Register;
})(App, Backbone, jQuery);
App.ClipApp.GotoSetup = (function(App, Backbone, $){
  var GotoSetup = {};
  var GotoSetupModel = App.Model.extend({});
  var GotoSetupView = App.DialogView.extend({
    tagName : "div",
    className : "gotosetup-view",
    template : "#gotosetup-view-template",
    events : {
      "click .login_btn"  : "go"
    },
    initialize : function(){
      this.bind("@setup", setup);
    },
    go : function(e){
      e.preventDefault();
      this.trigger("@setup");
     }
   });

   GotoSetup.show = function(key, arg){
     var text = _i18n(key, arg);
     var gotoSetupModel = new GotoSetupModel({text: text});
     var gotoSetupView = new GotoSetupView({model : gotoSetupModel});
     App.popRegion.show(gotoSetupView);
   };

  var setup = function(){
    App.popRegion.close();
    App.ClipApp.showUserEdit();
  };

  App.vent.bind("app.clipapp.register:success", function(key, res){
    if(key == "register_success"){ // invite的情况不需要触发gotosetup
      GotoSetup.show(key);
    }else if(key == 'invite'){
      App.ClipApp.showConfirm("invite", res.email, function(){
	App.vent.trigger("app.clipapp.useredit:rename");
      });
    }
  });

  return  GotoSetup;
})(App, Backbone, jQuery);
// app.clipapp.login.js

App.ClipApp.Login = (function(App, Backbone, $){

  var Login = {};
  var fun = "";  // 用于记录用户登录前应该触发的事件
  App.Model.LoginModel = App.Model.extend({
    validate: function(attrs){
      var err = {};
      if(!attrs.name ||attrs.name == "" || attrs.name == _i18n('login.default_name')){
	err.name = "is_null";
      }else if(attrs.name.indexOf('@')<=0 && !App.util.name_pattern.test(attrs.name)){
	  err.name = "invalidate";
      }
      if(attrs.pass == ""){
	err.pass = "is_null";
      }
      return _.isEmpty(err) ? null : err;
    }
  });

  var LoginView = App.DialogView.extend({
    tagName : "div",
    className : "login-view",
    template : "#login-view-template",
    events : {
      "blur #name"               : "blurName",
      "blur #pass"               : "blurPass",
      "focus #name"              : "clearAction",
      "focus #pass"              : "cleanError",
      "keydown #pass"            : "keydownAction",
      "click .login_btn"         : "loginAction",
      "click .l_register"        : "gotoRegister",
      "click .masker"            : "masker",
      "click .close_w"           : "cancel",
      "click .weibo"             : "openWeibo",
      "click .twitter"           : "openTwitter"
    },
    initialize:function(){
      this.tmpmodel = new App.Model.LoginModel();
      this.bind("@cancel", cancel);
    },
    blurName: function(e){
      var that = this;
      this.tmpmodel.set({name:$("#name").val()}, {
	error:function(model, error){
	  if($("#name").val() == "")
	    $("#name").val(_i18n('login.default_name'));
	  that.showError('login',error);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError("login",error);
	}
      });
    },
    clearAction: function(e){
      if(this.$("#name").val() == _i18n('login.default_name')){
	this.$("#name").val("");
      }
      this.cleanError(e);
    },
    gotoRegister:function(e){
      e.preventDefault();
      this.trigger("@cancel");
      App.ClipApp.showRegister();
    },
    loginAction : function(e){
      var that = this;
      e.preventDefault();
      var data = that.getInput();
      var remember = false;
      if($("#remember").attr("checked")){
	remember = true;
      }
      this.tmpmodel.save(data, {
  	url: App.ClipApp.encodeURI(App.ClipApp.Url.base+"/login"),
	type: "POST",
  	success: function(model, res){
	  App.vent.trigger("app.clipapp.login:gotToken", res, remember);
  	},
  	error:function(model, res){
	  that.showError('login',res);
  	}
      });
    },
    keydownAction : function(e){
      $('#pass').unbind("keydown");
      if(e.keyCode==13){
	$("#pass").blur();
	$('.login_btn').click();
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.clipper:cancel");
      this.trigger("@cancel");
    },
    openWeibo : function(e){
      var remember = false;
      if($("#remember").attr("checked")){
	remember = true;
      }
      this.trigger("@cancel");
      window.location.href="/oauth/req/weibo";
    },
    openTwitter : function(e){
      this.trigger("@cancel");
      window.location.href="/oauth/req/twitter";
    }
  });

  Login.show = function(callback){
    fun = callback;
    var loginModel = new App.Model.LoginModel();
    var loginView = new LoginView({model : loginModel});
    App.popRegion.show(loginView);
    if(/language=en/.test(document.cookie)){
      $("#note_img").removeClass("note_img_zh");
      $("#note_img").addClass("note_img_en");
    }else{
      $("#note_img").removeClass("note_img_en");
      $("#note_img").addClass("note_img_zh");
    }
    //$("#name").focus();
  };

  Login.close = function(){
    App.popRegion.close();
  };

  var cancel = function(){
    Login.close();
  };

  // 用户登录成功 页面跳转
  App.vent.bind("app.clipapp.login:gotToken", function(res, remember){
    Login.close();
    if(remember){
      var data = new Date();
      data.setTime(data.getTime() +12*30*24*60*60*1000);
      document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    }else{
      document.cookie = "token="+res.token;
    }
    App.vent.trigger("app.clipapp.login:success");
    if(typeof fun == "function"){
      fun();
    }else{
      Backbone.history.navigate("my", true);
    }
  });

 // TEST
 App.bind("initialize:after", function(){
   //console.info(document.cookie);
 });

 return Login;
})(App, Backbone, jQuery);
App.ClipApp.Logout = (function(App, Backbone, $){
  var Logout = {};

  // 跳转到站点首页
  App.vent.bind("app.clipapp:logout", function(){
    document.cookie = "token=";
    Backbone.history.navigate();
    location.reload();
  });

  return Logout;
})(App, Backbone, jQuery);
// app.clipapp.me.js
App.ClipApp.Me = (function(App, Backbone, $){

  var P = App.ClipApp.Url.base;
  var Me = {};
  var flag = false;
  var MyInfoModel = App.Model.extend({
    defaults:{
      id:"",
      name:"",
      face:"",
      following:"",
      follower:"",
      token:""
    },
    url:function(){
      //参数为了防止ie缓存导致的不能向服务器发送请求的问题
      return App.ClipApp.encodeURI(P+"/my/info");
    }
  });

  var View = App.ItemView.extend({
    tagName: "div",
    className: "me-view",
    template: "#me-view-template",
    events:{
      "click #login_button": "loginAction",
      "click #register_button": "registerAction",
      "click #help_button":"helpAction",
      "click .my_info":"showMysetup",
      "mouseout .my_info":"closeMysetup",
      "mouseover #show_mysetup":"keepOpenMysetup",
      "mouseout #show_mysetup":"closeMysetupMust",
      "click #logout": "logoutAction",
      "click #mysetup": "mysetupAction",
      "click #help":"helpAction",
      // "mouseenter .navigate": "mouseEnter",
      // "mouseleave .navigate": "mouseLeave",
      "click .my": "switch_my",
      // "click .at_me": "switch_at_me",
      "click .expert": "switch_expert",
      "click .delang" : "showLanguage",
      "mouseout .language": "closeLanguage",
      "mouseover #show_language":"keepShowLanguage",
      "mouseout #show_language": "closeLanguageMust",
      "mouseover .lang-list": "MouseOver",
      "mouseout  .lang-list": "MouseOut",
      "click .lang-list" : "ChangeLang"
    },
    initialize: function(){
      this.model.bind("change", this.render, this);
    },
    showMysetup: function(){
      $("#show_mysetup").toggle(); // css("display","block");
    },
    keepOpenMysetup: function(){
      flag = true;
      $("#show_mysetup").show();
    },
    closeMysetup: function(){
      setTimeout(function(){
	if(!flag){
	  $("#show_mysetup").css("display","none");
	}
      },200);
    },
    closeMysetupMust: function(){
      flag = false;
      $("#show_mysetup").css("display","none");
    },
    loginAction: function(){
      App.ClipApp.showLogin();
    },
    registerAction: function(){
      App.ClipApp.showRegister();
    },
    helpAction:function(){
      App.ClipApp.Help.show(1);
    },
    logoutAction: function(){
      App.vent.trigger("app.clipapp:logout");
    },
    mysetupAction: function(){
      App.ClipApp.showUserEdit();
    },
    switch_my:function(){
      // App.util.current_page("my");
      Backbone.history.navigate("my",true);
    },/*
    switch_at_me:function(){
      // App.util.current_page("@me");
      Backbone.history.navigate("my/recommend",true);
    },*/
    switch_expert:function(){
      // App.util.current_page("interest");
      Backbone.history.navigate("my/interest",true);
    },
    showLanguage: function(e){
      $("#show_language").toggle();
      var span = $(".delang").children()[1];
      if($("#show_language").css("display") == 'block'){
	$(span).text("▲");
	var defaultLang = e.currentTarget.children[0].className;
	$("#"+defaultLang).css("background-color","#D8D8D8");
      }else{
	$(span).text("▼");
      }
    },
    keepShowLanguage: function(e){
      flag = true;
      var span = $(".delang").children()[1];
      $(span).text("▲");
      $("#show_language").show();
    },
    closeLanguage: function(e){
      setTimeout(function(){
	if(!flag){
	  var span = $(".delang").children()[1];
	  $(span).text("▼");
	  $("#show_language").css("display","none");
	}
      },200);
    },
    closeLanguageMust: function(e){
      flag = false;
      var span = $(".delang").children()[1];
      $(span).text("▼");
      $("#show_language").css("display","none");
    },
    ChangeLang:function(e){
      var lang = e.currentTarget.id;
      App.vent.trigger("app.versions:version_change",lang);
    },
    MouseOver:function(e){
      var div = $("#show_language").children();
      _(div).each(function(e){
	$(e).css("background-color","");
      });
      $(e.currentTarget).css("background-color","#D8D8D8");
    },
    MouseOut:function(e){
      $(e.currentTarget).css("background-color","");
    }
    /*mouseEnter: function(e){
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      $("." + opt).css({"z-index":2});
    },
    mouseLeave: function(e){
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      $("." + opt).css({"z-index":0});
    }*/
  });

  Me.show = function(){
    if(!App.ClipApp.isLoggedIn()){
      var meView = new View({model: Me.me});
      App.mineRegion.show(meView);
    }
    Me.me.onChange(function(meModel){ // onChange 之后进行有无用户名的判断
      var meView = new View({model: meModel});
      App.mineRegion.show(meView);
      App.vent.trigger("app.versions:version_change",Me.me.get("lang"));
    });
  };

  Me.getFace = function(){
    return {
      name: Me.me.get("name"),
      face: Me.me.get("face"),
      lang: Me.me.get("lang")
    };
  };

  Me.getUid = function(){
    var uid = null;
    var token = App.util.getCookie("token");
    if (token) uid = token.split(":")[0];
    return uid;
  };
		    
  App.vent.bind("app.clipapp.login:success", function(){
    Me.me.fetch();
    Me.show();
  });

  App.vent.bind("app.clipapp.register:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.follow:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.unfollow:success", function(){
    Me.me.fetch();
  });

  App.vent.bind("app.clipapp.face:changed", function(){
    Me.me.fetch();
  });

  App.addInitializer(function(){
    Me.me = new MyInfoModel();
    Me.me.fetch();
  });

  App.bind("initialize:after", function(){
    Me.me.fetch();
    Me.show();
  });

  return Me;
})(App, Backbone, jQuery);

App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var face_change_flag = false;
  var face_remote_flag = false;
  var submit_face = false;
  var flag = false;

  var EditModel = App.Model.extend({});
  var FaceModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/face");
    }
  });
  var PassEditModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/passwd");
    },
    validate:function(attrs){
      var error = {};
      if(!attrs.newpass){
	error["newpass"] = "is_null";
      }
      if(!attrs.confirm){
	error["conpass"] = "is_null";
      }
      if(attrs.newpass && attrs.confirm && attrs.newpass != attrs.confirm){
	error["confirm"] = "password_diff";
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });
  var NameModel = App.Model.extend({
    url:function(){
      return  App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/name");
    },
    validate:function(attrs){
      if(!attrs.name || attrs.name == ""){
	return {name: "is_null"};
      }else if(!App.util.name_pattern.test(attrs.name)){
	return {name: "invalidate"};
      }else{
	return null;
      }
    }
  });

  var EmailEditModel = App.Model.extend({
    url:function(){
      if(this.get("address")){
	return App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/email/"+this.get("address"));
      }
      return App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/email");
    }
  });

  var EditView = App.DialogView.extend({
    tagName: "section",
    className: "edit",
    template: "#editUser-view-template",
    events: {
      "click .close_w" : "cancel",
      "click .masker":"masker_close"
    },
    initialize: function(){
      this.bind("@closeView", close);
    },
    cancel : function(e){
      e.preventDefault();
      this.trigger("@closeView");
    },
    masker_close:function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@closeView");
      }
    }
  });

  var EmailView = App.ItemView.extend({
    tagName: "div",
    className: "emailEdit",
    template: "#emailEdit-view-template",
    events: {
      "click #email_add":"emailAdd",
      "click .email_address":"emailCut"
    },
    initialize: function(){
      this.bind("@delEmail", delEmail);
    },
    emailAdd:function(e){
      App.ClipApp.showEmailAdd(this.model.id);
    },
    emailCut:function(e){
      e.preventDefault();
      var address = e.currentTarget.id;
      var view = this;
      var fun = function(){view.trigger("@delEmail", address);};
      App.ClipApp.showAlert("delemail", address, fun);
    }
  });

  var passChanged = function(res){
    showPassEdit();
    App.ClipApp.showSuccess("passwd_success");
    document.cookie = "token="+res.token;
  };

  var PassView = App.ItemView.extend({
    tagName: "div",
    className: "passEdit",
    template: "#passEdit-view-template",
    events: {
      "click #pass_confirm[type=submit]" : "passUpdate",
      "focus #conpass" : "focusAction",
      "focus #newpass" : "focusAction",
      "focus #pass" : "cleanError",
      "blur #pass" : "blurAction",
      "focus #confirm": "cleanError",
      "blur #confirm" : "blurAction",
      "click .delang" : "showLanguage",
      "mouseout .language": "closeLanguage",
      "mouseover #show_language":"keepShowLanguage",
      "mouseout #show_language": "closeLanguageMust",
      "mouseover .lang-list": "MouseOver",
      "mouseout  .lang-list": "MouseOut",
      "click .lang-list" : "lang_save"
    },
    initialize:function(){
      this.bind("@passChanged", passChanged);
    },
    focusAction:function(e){
      var id = e.currentTarget.id;
      $(e.currentTarget).hide();
      if(id == "newpass"){
	$(e.currentTarget).siblings("#pass").show();
	//STRANGE ie若不延时,输入框无法输入内容，需要再次点击输入框才可输入内容
	setTimeout(function(){
	  $(e.currentTarget).siblings("#pass").focus();
	},10);
      }
      if(id == "conpass"){
	$(e.currentTarget).siblings("#confirm").show();
	setTimeout(function(){
	  $(e.currentTarget).siblings("#confirm").focus();
	},10);
      }
      this.cleanError(e);
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      if(id == "pass" && $("#"+id).val() == ""){
	$("#"+id).hide();
	$("#newpass").show();
      }else if(id=="confirm" && $("#"+id).val()==""){
	$("#"+id).hide();
	$("#conpass").show();
      }
    },
    passUpdate:function(){
      var view = this;
      var uid = this.model.id;
      var data = view.getInput();
      var passModel = new PassEditModel({id:uid});
      passModel.save(data,{
	type: 'PUT',
  	success: function(model, res){
	  view.trigger("@passChanged", res);
  	},
  	error:function(model, res){
	  view.showError('passEdit',res);
  	}
      });
    },
    showLanguage: function(e){
      $("#show_language").toggle();
      var span = $(".delang").children()[1];
      if($("#show_language").css("display") == 'block'){
	$(span).text("▲");
	var defaultLang = e.currentTarget.children[0].className;
	$("#"+defaultLang).css("background-color","#D9D9D9");
      }else{
	$(span).text("▼");
      }
    },
    keepShowLanguage: function(e){
      flag = true;
      var span = $(".delang").children()[1];
      $(span).text("▲");
      $("#show_language").show();
    },
    closeLanguage: function(e){
      setTimeout(function(){
	if(!flag){
	  var span = $(".delang").children()[1];
	  $(span).text("▼");
	  $("#show_language").hide();
	}
      },200);
    },
    closeLanguageMust: function(e){
      flag = false;
      var span = $(".delang").children()[1];
      $(span).text("▼");
      $("#show_language").hide();
    },
    MouseOver:function(e){
      var div = $("#show_language").children();
      _(div).each(function(e){
	$(e).css("background-color","");
      });
      $(e.currentTarget).css("background-color","#D9D9D9");
    },
    MouseOut:function(e){
      $(e.currentTarget).css("background-color","");
    },
    lang_save: function(e){
      var lang = e.currentTarget.id;
      if(lang){
	var model = new EditModel();
	model.save({},{
	  type:'PUT',
	  url : App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/lang/"+lang),
	  success:function(model,res){
	    App.vent.trigger("app.versions:version_change", lang);
	  },
	  error:function(model,error){
	    App.ClipApp.showConfirm(error);
	  }
	});
      }
    }
  });

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "faceEdit",
    template: "#faceEdit-view-template",
    events: {
      "click .edit_name": "setName",
      "focus #name": "cleanError",
      "click #confirm_face": "submitFace"
    },
    initialize:function(){
      this.model.bind("change", this.render, this);
      this.bind("@rename", this.rename);
    },
    rename: function(){
      $(".edit_name").click(); // 触发设置用户名的动作
      $(".set_username").focus(); // 先让输入框聚焦
    },
    setName: function(e){
      e.preventDefault();
      var view = this;
      if(!$(e.currentTarget).hasClass("set_ok")){$("#set-name").empty();}
      $(".edit_name").addClass("set_ok").val(_i18n("faceEdit.ok"));
      $(".set_ok").unbind("click");
      $("#name").show();
      $(".set_ok").click(function(){
	var nameModel = new NameModel();
	var data = view.getInput();
	nameModel.save(data ,{
	  type: 'PUT',
	  success:function(model,res){
	    view.model.set("name", res.name);
	    App.ClipApp.showSuccess("rename_success");
	    App.vent.trigger("app.clipapp.face:changed");
	  },
	  error:function(model,res){
	    view.showError('faceEdit',res);
	  }
	});
      });
      $('#name').unbind("keydown");
      $('#name').keydown(function(e){
	if(e.keyCode==13){
	  $("#name").blur();
	  $('.edit_name').click();
	}
      });
    },
    submitFace:function(event){
      submit_face = true;
      $("#confirm_face").hide();
      if(face_remote_flag){
	event.preventDefault();
	App.ClipApp.showSuccess("faceUp_success");
	face_remote_flag = false;
	face_change_flag = true;
      }
    }
  });

  var close = function(){
    UserEdit.close();
  };

  var delEmail = function(address){
    var delModel = new EmailEditModel({id:1, address:address});
    delModel.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	showEmail();
      },
      error: function(model, res){}
    });
  };

  function showEmail(){
    var emailModel = new EmailEditModel();
    UserEdit.emailRegion = new App.Region({el:"#email"});
    emailModel.fetch();
    emailModel.onChange(function(emailModel){
      var emailView = new EmailView({model: emailModel});
      UserEdit.emailRegion.show(emailView);
    });
  };

  function showPassEdit(){
    var passModel = new PassEditModel();
    var passView = new PassView({model: passModel});
    UserEdit.passeditRegion = new App.Region({el:"#modify_pass"});
    UserEdit.passeditRegion.show(passView);
  };

  function showUserEdit(){
    var editModel = new EditModel();
    var editView = new EditView({model: editModel});
    App.mysetRegion.show(editView);
    /*var iframe=document.getElementById("post_frame_face");
    iframe.onload = function(){
      if(submit_face){
	console.info(iframe);
	submit_face = false;
	if($(iframe.contentWindow.document.body).text()[1]!=="0"){//取得图片上传的结果：成功或失败
	}
      }
    };*/
  };

  function showFace(){//设置页面显示用户名和头像
    var face = App.ClipApp.getMyFace();
    var faceModel = new FaceModel(face);
    UserEdit.faceRegion = new App.Region({el:"#set_user_info"});
    var faceView = new FaceView({model: faceModel});
    UserEdit.faceRegion.show(faceView);
    faceLoad();
  };

  UserEdit.show = function(){
    showUserEdit();
    showFace();
    showEmail();
    showPassEdit();
  };

  UserEdit.close = function(){
    if(face_change_flag){
      App.vent.trigger("app.clipapp.face:changed");
      face_change_flag = false;
    }
    UserEdit.emailRegion.close();
    UserEdit.passeditRegion.close();
    UserEdit.faceRegion.close();
    App.mysetRegion.close();
  };

  App.vent.bind("app.clipapp.useredit:rename", function(){
    if(UserEdit.faceRegion === undefined || UserEdit.faceRegion.currentView === undefined) App.ClipApp.showUserEdit();
    UserEdit.faceRegion.currentView.trigger("@rename");
  });

  UserEdit.onUploadImgChange = function(sender){
    if( !sender.value.match(/.jpeg|.jpg|.gif|.png|.bmp/i)){
      App.ClipApp.showConfirm("imageUp_error");
      return false;
    }else{
      if(sender.files && sender.files[0]&&Modernizr.filereader){
	$("#confirm_face").show();
	preview_face(sender);// ff chrome
	//$("#myface").attr("src",img.src);
	return true;
      }else if(Modernizr.cssfilters){
	$("#confirm_face").show();
	sender.select();
	sender.blur();
	document.getElementById("head_img").innerHTML= "<div id='head'></div>";
	var obj = document.getElementById("head");
	var obj1 =  document.getElementById("preview_size_fake");
	var src = document.selection.createRange().text;
	obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src=\"" + src + "\")";
	obj1.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='image',src=\"" + src + "\")";
	setTimeout(function(){
	  set_preview_size(obj, obj1.offsetWidth, obj1.offsetHeight);
	},200);
	$("#preview_size_fake").ready(function(){});
	return true;
      }else {
	face_remote_flag = true;
	$("#face_form").submit();
	submit_face = true;
	return true;
      }
    }
  };

  function faceLoad(){
    $("#post_frame_face").unbind("load");
    $("#post_frame_face").load(function(){ // 加载图片
      if(App.util.isIE()){ // 保证是ie
	var returnVal = this.contentWindow.document.documentElement.innerText;
      }else{
	var returnVal = this.contentDocument.documentElement.textContent;
      }
      if(returnVal != null && returnVal != ""){
	var returnObj = eval(returnVal);
	//console.info(returnObj);
	if(returnObj[0] == 0){//上传成功
	  var currentFace = returnObj[1][0];
	  if(currentFace){
	    var facemodel = new FaceModel({face:currentFace});
	    facemodel.save({},{
	      success:function(model,res){
		if(face_remote_flag){ // 此标记的作用是什么
		  $("#myface").attr("src",App.util.face_url(returnObj[1][0]),240);
		  $("#confirm_face").show();
		}else{
		  App.ClipApp.showSuccess("faceUp_success");
		  face_change_flag = true;
		}
	      },
	      error:function(model,res){
		//console.info("error!!!!!!!!!!");
	      }
	    });
	  }
	}else{//上传失败
	  if(submit_face){//flag 作用判断是刚刚打开设置页面还是正在更新头像
	    App.ClipApp.showConfirm("imageUp_fail");
	  }
	}
      }
      submit_face = false;
    });
  }
  //ff chrome 之外的其他浏览器本地预览头像
  function preview_face(sender){
    var reader = new FileReader();
    reader.onload = function(evt){
      var img = new Image();
      img.src = evt.target.result;
      img.onload=function(){
	if(img.complete||img.readyState=="complete"||img.readyState=="loaded"){
	  $("#myface").attr("src",img.src);
	  var style = resize_img(img.width,img.height);
	  $("#myface").css({"height":style.height+'px',"width":style.width+'px',"margin-top":style.top+'px',"margin-left":style.left+'px'});
	}
      };
    };
    reader.readAsDataURL(sender.files[0]);
  };

  function set_preview_size( objPre, originalWidth, originalHeight ){
    var style = resize_img(originalWidth, originalHeight);
    objPre.style.width = style.width + 'px';
    objPre.style.height = style.height + 'px';
    objPre.style.marginTop = style.top + 'px';
    objPre.style.marginLeft = style.left + 'px';
  }

  function resize_img( width, height ){
    var _width,_height,_top,_left;
    if(width<height){
      _width = 240;
      _height = height*240/width;
      _top =(240-_height)/2;
      _left = 0 ;
    }else{
      _height = 240;
      _width = width*240/height;
      _left = (240-_width)/2;
      _top = 0 ;
    }
    //console.info(_width,_height,_top,_left );
    return { width:_width, height:_height, top:_top, left:_left };
  }
  // App.bind("initialize:after", function(){ App.ClipApp.showUserEdit();});

  return UserEdit;
})(App, Backbone, jQuery);
App.ClipApp.EmailAdd = (function(App, Backbone, $){
  var EmailAdd = {};
  var P = App.ClipApp.Url.base;
  var email_pattern = App.util.email_pattern;

  var EmailAddModel = App.Model.extend({
    defaults:{
      email:""
    },
    validate:function(attrs){
      if(!attrs.email || attrs.email == undefined){
	return {email:"is_null"};
      }else if(!email_pattern.test(attrs.email)){
	return {email:"invalidate"};
      }else{
	return null;
      }
    },
    url:function(){
      var my = App.ClipApp.getMyUid();
      return App.ClipApp.encodeURI(P+"/user/"+my+"/email");
    }
  });

  var EmailAddView = App.DialogView.extend({
    tagName: "div",
    className: "emailadd-view",
    template: "#emailAdd-view-template",
    events: {
      "click #emailadd_commit":"EmailAddcommit",
      "click #emailadd_cancel":"EmailAddclose",
      "click .masker_layer"   :"EmailAddclose",
      "click .close_w"        :"EmailAddclose",
      "focus #email"          :"cleanError"
    },
    initialize: function(){
      this.bind("@closeView", close);
    },
    EmailAddclose: function(){
      var data = this.getInput();
      this.trigger("@closeView",data.email);
    },
    EmailAddcommit: function(){
      var view = this;
      var data = view.getInput();
      if(data.email){ data.email = data.email.toLowerCase(); }
      this.model.save(data,{
	type:"POST",
	success: function(model, res){
	  App.ClipApp.showConfirm("addemail", model.get("email"));
	  view.trigger("@closeView");
	},
	error:function(model, res){
	  view.showError('emailAdd',res);
	}
      });
    }
  });

  // 操作完成直接关闭 view
  var close = function(address){
    EmailAdd.close(address);
  };

  EmailAdd.show = function(uid){
    var emailAddModel = new EmailAddModel();
    var emailAddView = new EmailAddView({model : emailAddModel});
    App.popRegion.show(emailAddView);
  };

  EmailAdd.active = function(key){
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.encodeURI(P+"/active/"+key),
      type: "POST",
      success:function(model,response){ // 不只是弹出提示框这么简单
	App.ClipApp.showConfirm({active:"email"},response.email);
	Backbone.history.navigate("", true);
      },
      error:function(model,error){ // 则显示该链接不能再点击
	App.ClipApp.showConfirm(error, null, function(){
	  App.ClipApp.showUserEdit();
	});
      }
    });
  };

  EmailAdd.close = function(address){
    if(!address)
      App.popRegion.close();
    else{
      var fun = function(){App.popRegion.close();};
      App.ClipApp.showAlert("emailadd_save", null, fun);
    }
  };

  return EmailAdd;
})(App, Backbone, jQuery);
App.ClipApp.WeiboEdit = (function(App, Backbone, $){
  var WeiboEdit = {};

  var WeiboEditModel = App.Model.extend({});

  var WeiboView = App.ItemView.extend({
    tagName: "div",
    className: "weiboEdit",
    template: "#weiboEdit-view-template",
    events: {
      "click #info_add":"WeiboAdd",
      "click .oauth_del":"WeiboCut"
    },
    initialize:function(){
      this.bind("@delete", delWeibo);
    },
    WeiboAdd:function(e){
      if(!App.ClipApp.getMyName()){
	App.ClipApp.showAlert({auth: "no_name"}, null, function(){
	  App.vent.trigger("app.clipapp.useredit:rename");
	});
      }else{
	window.location.href="/oauth/req/weibo?forcelogin=true";
      }
    },
    WeiboCut:function(e){
      e.preventDefault();
      var uid = e.currentTarget.id;
      var name = $.trim($("#name_"+uid).text());
      var view = this;
      App.ClipApp.showAlert("deloauth",name,function(){
	view.trigger("@delete",uid);
      });
    }
  });

  WeiboEdit.show = function(){
    var weiboModel = new App.Model.UserBindModel({provider:"weibo"});
    var weiboRegion = new App.Region({el:"#weibo"});
    weiboModel.fetch();
    weiboModel.onChange(function(model){
      var view = new WeiboView({model: model});
      weiboRegion.show(view);
    });
  };


  var delWeibo = function(uid){
    var model = new App.Model.UserBindModel({id:uid,provider:"weibo",oauth_id:uid});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	WeiboEdit.show();
      },
      error: function(model, res){
	App.ClipApp.showAlert("del_oauth_fail");
      }
    });
  };

  return WeiboEdit;

})(App, Backbone, jQuery);
App.ClipApp.RuleEdit = (function(App, Backbone, $){
  var RuleEdit = {};
  var P = App.ClipApp.Url.base;
  var RuleModel = App.Model.extend({
    defaults:{
      title:"",
      to: "",
      cc: "",
      enable: ""
    },
    url:function(){
      var my = App.ClipApp.getMyUid();
      return App.ClipApp.encodeURI(P+"/user/"+my+"/rule");
    },
    validate: function(attrs){
      var email_pattern = App.util.email_pattern;
      var error = {};
      // 如果没有attrs.rule, 则在fetch时候不会触发onChange事件
      if(attrs.to){
	for(var i=0; attrs.to && i<attrs.to.length; i++){
	  if(!email_pattern.test(attrs.to[i])){
	    error.to = "invalidate";
	    i = attrs.to.length;
	  }
	}
      }
      if(attrs.cc){
	for(var i =0; attrs.cc && i< attrs.cc.length; i++){
	  if(!email_pattern.test(attrs.cc[i])){
	    error.cc = "invalidate";
	    i = attrs.cc.length;
	  }
	}
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });

  var RuleView = App.ItemView.extend({
    tagName: "div",
    className: "ruleEdit",
    template: "#ruleEdit-view-template",
    events: {
      "click #update_rule[type=submit]" : "ruleUpdate",
      "keydown #cc" : "setCC",
      "keydown #to" : "setTO",
      "blur #cc" : "blurAction", // 直接进行to和cc的set,及时进行数据校验
      "blur #to" : "blurAction",
      "focus #to": "cleanError",
      "focus #cc": "cleanError",
      "click #open_rule" : "openRule"
    },
    initialize:function(){
      this.tmpmodel = new RuleModel();
      this.bind("@showrule", showrule);
    },
    openRule:function(e){
      e.preventDefault();
      var checked = $("#open_rule").attr("checked");
      if(checked){
	o_data.enable = true;
	this.tmpmodel.save(o_data,{
	  success: function(model, res){
	    $("#open_rule").attr("checked",true);
	    $(".rule_input").show();
	  },
	  error:function(model, error){
	    console.info(error);
	  }
	});
      }else{
	o_data.enable = false;
	this.tmpmodel.save(o_data,{
	  success: function(model, res){
	    $("#open_rule").attr("checked",false);
	    $(".rule_input").hide();
	  },
	  error:function(model, error){
	    console.log(error);
	  }
	});
      }
    },
    setCC:function(e){
      var key = e.keyCode;
      addSeparator(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    setTO:function(e){
      var key = e.keyCode;
      addSeparator(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    ruleUpdate: function(){
      var view = this;
      var uid = this.model.id;
      var data = view.getInput();
      if(!data.enable) data.enable = false;
      else data.enable = true;
      if(data.to) data.to =  _.compact($.trim(data.to).split(";"));
      if(data.cc) data.cc =  _.compact($.trim(data.cc).split(";"));
      // 因为不能在输入框中正常显示 所以对双引号进行转换
      if(data.title) data.title = data.title.replace(/"/g, '&#34;');
      // 如果没有设置rule, 则在fetch时候不会触发onChange事件"
      if(data.title==o_data.title&&((data.to==o_data.to)||(data.to&&o_data.to&&data.to.join()==o_data.to.join()))&&((data.cc==o_data.cc)||(data.cc&&o_data.cc&&data.cc.join()==o_data.cc.join()))){
	App.ClipApp.showConfirm({rule:"not_update"});
      }else{
	this.tmpmodel.save(data,{
	  success: function(model, res){
  	    view.trigger("@showrule", model.id);
	    App.ClipApp.showSuccess("setRule_success");
	    o_data = data;
	  },
	  error:function(model, res){
	    view.showError('ruleEdit',res);
	  }
	});
      }
    },
    blurAction:function(e){
      var view = this;
      var id = e.currentTarget.id;
      var name = e.currentTarget.name;
      // 可以统一取单独set
      var data = view.getInput();
      var str = null;
      if(data[id]){
	str = _.compact($.trim(data[id]).split(";"));
      }
      if(str){
	var value = _.compact(str).join(";");
	$("input[name="+name+"]").val(value+";");
	str = str.length == 0 ? undefined : str;
	if(id == "to")
	  view.setModel('ruleEdit',this.tmpmodel, {to: str});
	if(id == "cc")
	  view.setModel('ruleEdit',this.tmpmodel, {cc: str});
      }
    }
  });

  function addSeparator(e){
    var key = e.keyCode;
    var str = $.trim($(e.currentTarget).val());
    //按键为 tab 空格 , ; 时处理输入框中的字符串
    if((key==9||key==32||key==188||key==59)){
      if(str){
	// 以;把字符串分为数组，取出没个email的前后空格。
	var arr = [];
	_.each(str.split(";"),function(a){
	  arr.push($.trim(a));
	});
	//在取出无用数据后（空字符串等），再放回输入框
	$(e.currentTarget).val(_.compact(arr).join(";")+";");
      }
    }
  }

  var showrule = function(uid){
    RuleEdit.show(uid);
  };

  var o_data;
  RuleEdit.show = function(){
    var ruleModel = new RuleModel();
    ruleModel.fetch();
    ruleModel.onChange(function(ruleModel){
      var ruleView = new RuleView({model: ruleModel});
      RuleEdit.ruleRegion = new App.Region({el:"#rule"});
      RuleEdit.ruleRegion.show(ruleView);
      if(!ruleModel.get("enable")){
	$(".rule_input").hide();
      }else{
	$(".rule_input").show();
      }
      o_data = {title:ruleModel.get("title")?ruleModel.get("title"):undefined,cc:ruleModel.get("cc")?ruleModel.get("cc"):undefined,to:ruleModel.get("to")?ruleModel.get("to"):undefined};
   });
  };

  RuleEdit.close = function(){
    App.popRegion.close();
  };

  return RuleEdit;
})(App, Backbone, jQuery);
App.ClipApp.UserBind = (function(App, Backbone, $){

  var UserBind = {};
  var P = App.ClipApp.Url.base;
  App.Model.UserBindModel = App.Model.extend({
    url:function(){
      var my = App.ClipApp.getMyUid();
      if(this.get("oauth_id")){
	return App.ClipApp.encodeURI(P+"/user/"+ my +"/provider/"+this.get("provider")+"/oauth_id/"+this.get("oauth_id"));
      }else{
	return App.ClipApp.encodeURI(P+"/user/"+ my +"/provider/"+this.get("provider"));
      }
    }
  });
  var UserBindView = App.ItemView.extend({
    tagName : "div",
    className : "bind-view",
    template : "#bind-view-template",
    events : {
      "click .close_w"           : "cancel",
      "click #bind_ok"           : "bindOk",
      "click #user_have"         : "toggleClass",
      "click #user_not"          : "toggleClass",
      "blur #name"          : "blurName",
      "blur #pass"          : "blurPass",
      "focus #name"         : "cleanError",
      "focus #pass"         : "cleanError"
    },
    initialize:function(){
      this.tmpmodel = new App.Model.LoginModel();
      this.bind("@cancel", cancel);
      this.bind("@success", success);
    },
    blurName: function(e){
      var that = this;
      this.tmpmodel.set({name:$("#name").val()}, {
	error:function(model, error){
	  that.showError('bind',error);
	}
      });
    },
    blurPass: function(e){
      var that = this;
      this.tmpmodel.set({pass:$("#pass").val()},{
	error:function(model, error){
	  that.showError('bind',error);
	}
      });
    },
    bindOk:function(e){
      e.preventDefault();
      var that = this;
      var id = $('.tab')[0].id;
      if(id == "user_have"){
	this.tmpmodel.save({}, {
	  url: App.ClipApp.encodeURI(P+"/login"),
	  type: "POST",
  	  success: function(model, res){
  	    that.trigger("@success", res);
  	  },
  	  error:function(model, res){
	    that.showError('bind',res);
  	  }
	});
      }else if(id == "user_not"){
	this.tmpmodel.save({},{
	  url : App.ClipApp.encodeURI(P+"/register"),
	  type: "POST",
	  success:function(model, res){
	    that.trigger("@success", res);
	  },
	  error:function(model,error){
	    that.showError('bind',error);
	  }
	});
      }
    },
    toggleClass : function(e){
      if(e.currentTarget.id == "user_have"){
	$("#user_not").removeClass("tab");
	$("#bind_ok").val(_i18n('bind.bind_ok'));
      }else if(e.currentTarget.id == "user_not"){
	$("#user_have").removeClass("tab");
	$("#bind_ok").val(_i18n('bind.register_ok'));
      }
      $(e.currentTarget).addClass("tab");
    },
    cancel : function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });

  var bindOauth ,fun, remember = false;//fun 用于记录用户登录前应该触发的事件

  UserBind.show = function(oauth, fun, remember){
    bindOauth = oauth;
    fun = fun;
    remember = remember;
    var model = new App.Model.UserBindModel({info:oauth.info,provider:oauth.provider});
    var view = new UserBindView({model : model});
    App.popRegion.show(view);
  };

  UserBind.close = function(){
    App.popRegion.close();
    bindOauth = null;
    fun = null;
  };

  function saveOauth(oauth,callback){
    if(oauth){
      var model = new App.Model.UserBindModel(oauth);
      model.save({},{
	type: "POST",
	success:function(model,res){
	  callback(null,res);
	},
	error:function(model,error){
	  //that.showError(error);
	  callback(error,null);
	}
      });
    }
  };

  var success = function(res){
    if(remember){ //关联现在还没有传递“保持登录”,fun 等参数
      var data = new Date();
      data.setTime(data.getTime() + 12*30*24*60*60*1000);
      document.cookie = "token="+res.token+";expires=" + data.toGMTString();
    }else{
      document.cookie = "token="+res.token;
    }
    saveOauth(bindOauth,function(err,reply){
      if(bindOauth.provider == "weibo"){
	App.ClipApp.showConfirm("weibo_sucmsg",bindOauth.info.name);
      }else if(bindOauth.provider == "twitter"){
	App.ClipApp.showConfirm("twitter_sucmsg",bindOauth.info.name);
      }
      // App.vent.trigger("app.clipapp.userbind:bindok"); 动作为 Me.me.fetch;
      if(reply){
	if(typeof fun == "function"){ fun(); }
	App.vent.trigger("app.clipapp.login:gotToken",res);
	UserBind.close();
      }
    });
  };

  var cancel = function(){
    if(Backbone.history) Backbone.history.navigate("",true);
    UserBind.close();
  };

 // App.bind("initialize:after", function(){ UserBind.show({info:"ll",provider:"dd"}); });

 return UserBind;
})(App, Backbone, jQuery);
App.ClipApp.TwitterEdit = (function(App, Backbone, $){
  var TwitterEdit = {};
  var TwitterEditModel = App.Model.extend({});

  var TwitterView = App.ItemView.extend({
    tagName: "div",
    className: "twitterEdit",
    template: "#twitterEdit-view-template",
    events: {
      "click #info_add":"TwitterAdd",
      "click .oauth_del":"TwitterCut"
    },
    initialize: function(){
      this.bind("@delete", delTwitter);
    },
    TwitterAdd:function(e){
      if(!App.ClipApp.getMyName()){
	App.ClipApp.showAlert({auth: "no_name"}, null, function(){
	  App.vent.trigger("app.clipapp.useredit:rename");
	});
      }else{
	window.location.href="/oauth/req/twitter?force_login=true";
      }
    },
    TwitterCut:function(e){
      e.preventDefault();
      var uid = e.currentTarget.id;
      var name = $.trim($("#name_"+uid).text());
      var view = this;
      App.ClipApp.showAlert("deloauth",name,function(){
	view.trigger("@delete",uid);
      });
    }
  });

  TwitterEdit.show = function(){
    var twitterModel = new App.Model.UserBindModel({provider:"twitter"});
    var twitterRegion = new App.Region({el:"#twitter"});
    twitterModel.fetch();
    twitterModel.onChange(function(model){
      var view = new TwitterView({model: model});
      twitterRegion.show(view);
    });
  };

  var delTwitter = function(uid){
    var model = new App.Model.UserBindModel({id:uid,provider:"twitter",oauth_id:uid});
    model.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	TwitterEdit.show();
      },
      error: function(model, res){
	App.ClipApp.showAlert("del_oauth_fail");
      }
    });
  };

  return TwitterEdit;

})(App, Backbone, jQuery);
// app.clipapp.oauth.js
App.ClipApp.Oauth = (function(App, Backbone, $){
  var Oauth = {};
  Oauth.process=function(){
    checkUser(function(err,res){
      if(err && err.hasbind_err){
	var sure = function(){
	  Backbone.history.navigate("my", true);
	  App.ClipApp.showUserEdit();
	};
	var cancel = function(){ Backbone.history.navigate("my", true); };
	App.ClipApp.showAlert("account_hasbind", null, sure, cancel);
      }else if(res && res.oauth){
	App.ClipApp.showUserBind(res.oauth);
      }else if(res && res.token){
	App.vent.trigger("app.clipapp.login:gotToken",res);
      }else{
	var sure = function(){
	  App.ClipApp.showUserEdit();
	  Backbone.history.navigate("my", true);
	};
	var cancel = function(){ Backbone.history.navigate("my", true); };
	App.ClipApp.showAlert("oauth_fail",null, sure, cancel);
      }
    });
  };

  function checkUser(callback){
    var model = new App.Model.UserBindModel();
    model.save({},{
      url : App.ClipApp.encodeURI(App.ClipApp.Url.base+"/user/oauth_info"),
      type: "POST",
      success:function(model,res){
	callback(null,res);
      },
      error:function(model,error){
	callback(error,null);
      }
    });
  };

 return Oauth;
})(App, Backbone, jQuery);
App.ClipApp.Error=(function(App,Backbone,$){
 var Error = {};
 Error.process=function(message){
   // console.log(typeof(message));
   if(message == "InternalOAuthError"){
     App.ClipApp.showConfirm(message);
   }else{
     App.ClipApp.showConfirm("error_message");
   }
  if(App.ClipApp.isLoggedIn())  Backbone.history.navigate("my",true);
  else Backbone.history.navigate("register",true);
  };
  return Error;
})(App,Backbone,jQuery);
App.ClipApp.Bubb = (function(App, Backbone, $){
  var Bubb = {};
  var P = App.ClipApp.Url.base;
  // model && view

  var BubbModel = App.Model.extend({});

  var BubbView = App.ItemView.extend({
    id : "bubbles",
    tagName : "iframe",
    className : "bubb-view",
    render : function(){
      this.$el.attr("frameborder", "0",0);//兼容属性大小写问题
      this.$el.attr("scrolling", "no");
      this.$el.attr("src", "bub.html");
      return this;
    }
  });
  // private
  var _uid  = null;
  var last = null;
  var old_self = null;
  var self = true;
  var lang = App.versions.getLanguage(); // 用户语言设置
  var homepage = false;

  // constants
  // 与显示无关，只是用来确定泡泡的大小而已
  var sink = {
    zh: ["讨厌"],
    en: ["hate"]
  };
  var bubs = App.ClipApp.getDefaultBubbs();
  // exports
  Bubb.showSiteTags = function(tag){
    _uid = null;
    self = false;
    homepage = true;
    getSiteTags(function(tags, follows){
      showTags(mkTag(_uid, tags, follows, tag, self, homepage));
    });
  };

  Bubb.showSiteBubs = function(tag){
    _uid = null;
    self = false;
    homepage = true;
    getSiteBubs(function(tags, follows){
      showTags(mkTag(_uid, tags, follows, tag, self, homepage));
    });
  };

  Bubb.showUserTags = function(uid, tag){
    _uid = uid;
    self = App.ClipApp.isSelf(uid);
    homepage = false;
    getUserTags(uid, function(tags, follows){
      showTags(mkTag(_uid, tags, follows, tag, self));
    });
  };

  Bubb.cleanTags = function(){
    showTags(mkTag(_uid, [], [], null, false));
  };
/*
  Bubb.showUserBubs = function(uid, tag){
    _uid = uid;
    getUserBubs(uid, function(tags, follows){
      self = App.ClipApp.isSelf(uid);
      showTags(mkTag(_uid, tags, follows, tag, self));
    });
  };
*/
  function followUserBubs(uid, tag){
    if(!uid) uid = App.ClipApp.getFaceUid();
    followUserTag(uid, tag, function(){
      // 更新bubb显示
      if(tag == '*'){
	refresh(uid, ['*']);
	last.follows = ['*'];
      }else{
	iframe_call('bubbles', "followTag", tag);
	last.follows.push(tag);
      }
      App.vent.trigger("app.clipapp.follow:success", last.follows);
    });
  };

  function unfollowUserBubs(uid, tag){
    if(!uid) uid = App.ClipApp.getFaceUid();
    unfollowUserTag(uid, tag, function(){
      // 更新bubb显示
      if(tag == '*'){
	refresh(uid, []);
	last.follows = [];
      }else{
	iframe_call('bubbles', "unfollowTag", tag);
	last.follows = _.without(last.follows,tag);
      }
      App.vent.trigger("app.clipapp.unfollow:success", last.follows);
    });
  };

  function showTags(tags){
    if($('#bubbles').length == 0){
      var bubbView = new BubbView();
      App.bubbRegion.show(bubbView);
    }
    if (hasChanged(last, tags, old_self)) {
      iframe_call('bubbles', "resetTags", tags);
    } else if (changeDefault(last, tags)) {
      iframe_call('bubbles', "openTag", tags.current);
    }
    old_self = _uid;
    last = tags;
  };

  function refresh(uid, follow, new_tags){
    _uid = uid;
    self = App.ClipApp.isSelf(uid);
    if(follow){
      showTags(mkTag(_uid, last.tags, follow, null, self));
    }else if(!_.isEmpty(new_tags)){
      showTags(mkTag(_uid, _.union(last.tags, new_tags), follow, null, self));
    }
  };

  // service api
  function getSiteTags(callback){
    // API getSiteTags
    // 替换掉之前的取用户2的数据为，常量
    var	siteTags = {
      zh: ["好看", "有趣","好听", "真赞", "好吃",  "想要", "精辟","讨厌","书籍","电影","旅游","资料"],
      en: ["pretty","funny","musical","cool","tasty","wish","incisive","hate","book","film","tour","data"]
    };
    callback(siteTags[lang],[]);
  }

  function getSiteBubs(callback){
    getSiteTags(function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }

  // 取 uid 的 tag
  function getUserTags(uid, callback){
    // API getUserTags
    // CHANGE 需按当前用户查找各 tag 的 follow 关系
    // GET $HOST/$BASE/_/user/:id/tag/0..19
    var bubbModel = new BubbModel({id: uid});
    var url = App.ClipApp.encodeURI(P+"/user/"+uid+"/meta/0..0");
    bubbModel.fetch({url: url});
    bubbModel.onChange(function(bubbs){
      var bubb = bubbs.toJSON();
      App.vent.trigger("app.clipapp.follow:get", bubb.follow);
      if(callback)callback(bubb.tag.slice(0,19), bubb.follow);
    });
  };
/*
  function getUserBubs(uid, callback){
    getUserTags(uid, function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }
*/
  function followUserTag(uid, tag, callback){
    if(!uid) uid = _uid;
    var url = App.ClipApp.encodeURI(P+"/user/"+uid+"/follow");
    if(tag == '*') {
      tag = "all";
    }else{
      tag = [tag];
    }
    var bubbModel = new BubbModel();
    bubbModel.save({tag: tag}, {
      url: url,
      data: JSON.stringify({tag: tag}),
      contentType:"application/json; charset=utf-8",
      success:callback,
      error:function(model, error){
	App.ClipApp.showConfirm(error);
      }
    });
  }

  function unfollowUserTag(uid, tag, callback){
    var url = "";
    if(!uid){
      uid = _uid ? _uid : 2;
    }
    if(tag == '*') {
      url = App.ClipApp.encodeURI(P+"/user/"+uid+"/follow");
    }else{
      //encodeURIComponent() 函数可把字符串作为 URI 组件进行编码。
      //该方法不会对 ASCII 字母和数字进行编码，也不会对这些 ASCII 标点符号进行编码： - _ . ! ~ * ' ( ) 。其他字符（比如 ：;/?:@&=+$,# 这些用于分隔 URI 组件的标点符号），都是由一个或多个十六进制的转义序列替换的。此方法会编码URI中的特殊字符
      url  = App.ClipApp.encodeURI(P+"/user/"+uid+"/follow/"+tag);
    }
    var bubbModel = new BubbModel({id: uid});
    bubbModel.destroy({
      url: url,
      success:callback,
      error:function(){}
    });
  }

  // call functions inside iframe

  function iframe_call(ifname, fname, fargs){
    var _iframe =  document.getElementById(ifname);
    var ifwin;
    if(!_iframe.contentDocument){//ie6 7
      ifwin = document.frames[ifname].document.parentWindow;;
    }else if(_iframe.contentDocument.parentWindow){//ie8
      ifwin = _iframe.contentDocument.parentWindow;
    }else{//其他主流浏览器
      ifwin = _iframe.contentDocument.defaultView;
    }
    if(ifwin && ifwin[fname]){
      // console.info("ifwin :: "+ifwin);
      // console.log(ifwin[fname]);
      // console.log("iframe_call(", ifname, fname, fargs, ")");
      // console.log(typeof fargs.bubs);
      // console.dir(fargs);
      ifwin[fname](fargs);
    }else { // waiting for iframe load
      //console.info("waiting for iframe reload");
      setTimeout(function(){ iframe_call(ifname, fname, fargs); }, 100);
    }
  }

  // utils 因为追了所有没有办法只停追一个
  function mkTag(uid, tags, follows, tag, self, homepage){
    // DEBUG PURPOSE
    // tags = _.without(_.union(bubs, sink, tags, follows),"*");
    //tags = _.compact(_.without(_.union(tags, follows),"*"));
    tags = _.compact(_.without(tags,"*"));
    follows = follows === null ? [] : follows;
    var opt = {
      tags: tags,
      follows: follows,
      bubs: self ? bubs : _.intersection(bubs, tags),
      sink: self ? sink[lang] : _.intersection(sink[lang], tags),
      user: uid,
      self: self,
      t_reclip: _i18n('bubb.reclip'),
      t_follow: _i18n('bubb.follow'),
      t_unfollow: _i18n('bubb.unfollow')
    };
    if(homepage) opt.homepage = homepage;
    if(tag) opt.current = tag;
    return opt;
  }

  // 需要区分 my/interest、 my/recommend、和 my
  function mkUrl(tag){
    var encode_tag = encodeURIComponent(tag);
    var url = Backbone.history.fragment;
    var i = url.indexOf("/tag");
    if(_uid){
      if(i >= 0){
	url = url.substr(0, i);
	return url += "/tag/"+encode_tag;
      }else{
	/* if(url.indexOf("my/interest") >= 0)
	 return "/my/interest/tag/"+encode_tag;
	 else if(url.indexOf("my/recommend") >= 0)
	 return "/my/recommend/tag/"+encode_tag; */
	if(url.indexOf("my") >= 0)
	  return url = "/my/tag/"+encode_tag;
	else
	  return url = "/user/"+_uid+"/tag/"+encode_tag;
      }
    }else{
      return url = "/tag/"+encode_tag;
    }
  };

  function hasChanged(tags1, tags2, old_self){
    if(old_self != _uid){ // 若 self 已经变化，则 tag 不能重用
      return true;
    }
    if(_.isEmpty(tags2.follows) || tags2.follows[0]=="*"){
      // 若 follows 为空，意味着追（[*]被过滤为[]）或停（[]），则 tag 不能重用
      return true;
    }
    if(tags1 && tags1.tags && tags2 && tags2.tags){
      // 若 tag1 和 tag2 的 tags 没有不同，则可以重用
      return _.difference(tags1.tags, tags2.tags).length != 0;
    }
    else {
      // 否则，不能重用
      return true;
    }
  }

  function changeDefault(tags1, tags2){
    if(tags1 && tags1.current && tags2 && tags2.current){
      return tags1.current != tags2.current;
    } else {
      return true;
    }
  }

  App.vent.bind("app.clipapp.clipadd:success",function(addmodel){
    if(App.ClipApp.isSelf(_uid)){
      refresh(App.ClipApp.getMyUid(), null, addmodel.get("tag"));
    }
  });

  App.vent.bind("app.clipapp.clipedit:success", function(){
    if(App.ClipApp.isSelf(_uid)){
      Bubb.showUserTags(_uid);
    }
  });

  App.vent.bind("app.clipapp.clipmemo:success", function(){
     if(App.ClipApp.isSelf(_uid)){
      Bubb.showUserTags(_uid);
    }
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    if(App.ClipApp.isSelf(_uid)){
      Bubb.showUserTags(_uid);
    }
  });

    // 因为当前用户是否登录，对follow有影响 所以触发app.clipapp.js中绑定的事件
  App.vent.bind("app.clipapp.bubb:follow", function(uid, tag){
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){
	followUserBubs(uid, tag);
      });
    }else{
      followUserBubs(uid, tag);
    }
  });

    // 需要判断是因为可能出现token过期现象
  App.vent.bind("app.clipapp.bubb:unfollow", function(uid, tag){
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){
	unfollowUserBubs(uid, tag);
      });
    }else{
      unfollowUserBubs(uid, tag);
    }
  });


  //高版本的marionette 设为false也可直接刷新 但是提交上去的数据是乱码
  App.vent.bind("app.clipapp.bubb:open", function(uid, tag){
    // console.log("open %s", tag + "  " +uid);
    iframe_call('bubbles', "openTag", tag); // 更新bubb显示
    var url = mkUrl(tag);
    Backbone.history.navigate(url, false);
    App.vent.trigger("app.clipapp:open_bubb", uid, tag);
  });

  // return
  return Bubb;
})(App, Backbone, jQuery);
App.ClipApp.ClipDetail = (function(App, Backbone, $){

  var ClipDetail = {};
  var mid, number_limit = 140, hist, offset;
  var P = App.ClipApp.Url.base;

  App.Model.DetailModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/clip/"+this.id)+"&rid="+this.get("rid");
    },
    parse: function(resp){ // 跟cliplist一致，使得model.id = "uid:id"
      resp.id = resp.user+":"+resp.id;
      return resp;
    }
  });

  var DetailView = App.DialogView.extend({
    tagName: "div",
    className: "Detail-view",
    template: "#detail-view-template",
    events: {
      "click .operate" : "Operate",
      "click .masker" : "Masker", // 点击detail下的层，便隐藏
      "click .close_w": "Close",
      "click .user_head": "Close",
      "dblclick .content": "editDetail"
    },
    initialize: function(){
      this.bind("@detailComment", detailComment);
      this.bind("@detailClose", detailClose);
    },
    Operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(" ")[0];
      var cid = this.model.id;
      var pub = this.model.get("public");
      switch(opt){
	case 'reclip':
	  var recommend = {
	    rid : this.model.get("rid"),
	    user: this.model.get("ruser")
	  };
	  App.ClipApp.showReclip(cid, mid, recommend, pub); break;
	// case 'recommend':
	  //App.vent.trigger("app.clipapp:recommend", cid,mid,pub);break;
	case 'comment':
	  this.trigger("@detailComment", cid);break;
	case 'note':
	  App.ClipApp.showMemo(cid); break;
	case 'modify':
	  this.trigger("@detailClose");
	  App.ClipApp.showEditClip(cid); break;
	case 'del':
	  App.ClipApp.showClipDelete(cid); break;
      }
    },
    Masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@detailClose");
      }
    },
    Close: function(e){
      this.trigger("@detailClose");
    },
    editDetail: function(e){
      this.trigger("@detailClose");
      App.ClipApp.showEditClip(this.model.id);
    }
  });

  var CommentView = App.ItemView.extend({
    tagName: "div",
    className: "showcomment-view",
    template: "#showcomment-view-template",
    events: {
      "click .text" : "toggleChildren",
      "mouseover .comment_show" : "discoloration",
      "mouseout .comment_show" : "resume",
      "click .reply_comment" : "reply_comment",
      "click .del_comment" : "del_comment"
    },
    initialize: function(){
      this.bind("@reply", showReply);
      this.bind("@delComment", delComment);
    },
    toggleChildren : function(e){
      e.preventDefault();
      var curr = $(e.target).attr("class");
      var open = _i18n('showcomment.open');
      var pack = _i18n('showcomment.pack');
      if(curr == "marking"){
	var marking = $(e.target).text();
	if(marking)
	  $(e.target).text(marking == open ? pack : open);
      }else{
	var marking = $(e.target).siblings(".marking").text();
	if(marking)
	  $(e.target).siblings(".marking").text(marking == open ? pack : open);
      }
      var div = $($(e.currentTarget).parent()[0]).parent();
      $(div).siblings(".children").toggle();
    },
    discoloration : function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      $("#reply_"+id).css("display","block");
    },
    resume : function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      $("#reply_"+id).css("display","none");
    },
    reply_comment : function(e){
      e.preventDefault();
      var cid = this.model.get("cid"); // 取得当前detail的id
      var pid = e.target.id;   // 取得当前评论的id
      if($("#reply_Comm_showDiv"))  // 首先在被点击的评论下添加 评论框的div
	$("#reply_Comm_showDiv").remove(); // 保证detail页面只有一个评论回复框
      $("#"+pid).append('<div id="reply_Comm_showDiv"></div>');
      this.trigger("@reply", cid, pid);
    },
    del_comment : function(e){
      e.preventDefault();
      var view = this;
      var cid = this.model.get("cid");
      var id = e.target.id;
      App.ClipApp.showAlert("del_comment", null, function(){
	view.trigger("@delComment", cid, id);
      });
    },
    render:function(_model){  // 针对commetModel进行处理显示
      var that = this;
      var model = _model ? _model.toJSON() :  this.model.toJSON();
      var res = [];
      for(var i in model){ // 将拿到的model对象变为数组
	if(i != "cid" ) res.push(model[i]);
      }
      var clip_owner = model.cid.split(":")[0];
      var template = this.getTemplateSelector();
      // 远程调用template,我们用的是本地调用 TODO
      var templateRetrieval = App.TemplateCache.get(template);
      $.when(templateRetrieval).then(function(template){
	function render_tree(commentList, html){
	  var e = commentList.shift();
	  // console.log("render_tree :: %j %s", e, html);
	  if(!e) {
	    return html;
	  } else {
	    e.clip_owner = clip_owner;
	    if(e.children && e.children.length <= 0){ e.has_child = false;}
	    else{e.has_child = true;} // has_child 用于显示控制
	    var str = _.template(template, e);
	    if (e.children && e.children.length > 0) {
	      str += "<ul class='children'>";
	      str += render_tree(e.children, "");
	      str += "</ul>";
	    }
	    str = '<div>'+str+'</div>';
	  };
	  return render_tree(commentList, html+str);
	}
      that.$el.html(render_tree(res, ""));
      /*if (that.onRender){that.onRender();}*/
      return this;
     });
    }
  });

  var AddCommView = App.ItemView.extend({
    tagName : "div",
    className : "addcomment-view",
    template : "#addcomm-view-template",
    //tag_list : [],
    events : {
      "focus #comm_text" : "focusAction",
      "blur #comm_text"  : "blurAction",
      //"click .main_tag"  : "maintagAction",
      "keydown #comm_text":"shortcut_comment",
      "click .verify"    : "comment",
      "click .cancel"    : "cancel"
    },
    initialize:function(){
      this.bind("@saveaddComm", saveaddComm);
      this.bind("@canceladdComm", canceladdComm);
    },
    focusAction:function(e){
      e.currentTarget.select();//将光标定位到当前选中元
      this.$(".verify").attr("disabled",false);
      this.cleanError(e);
      var text = $(e.currentTarget).val();
      $(e.currentTarget).val(text == _i18n('comment.defaultText') ? "" : text);
    },
    blurAction:function(e){
      var text = $(e.currentTarget).val();
      $(e.currentTarget).val(text == "" ? _i18n('comment.defaultText') : text);
    },
    /*maintagAction:function(e){
      $("#comm_text").focus();
      var id = e.target.id;
      $(e.currentTarget).toggleClass("original");
      $(e.currentTarget).toggleClass("selected");
      if($(e.currentTarget).hasClass("selected")){
	//将其值加入到comm_text中去
	this.tag_list.push($("#"+id).val());
	if($("#comm_text").val() == "" || $("#comm_text").val() == _i18n('comment.defaultText')){
	  $("#comm_text").val($("#"+id).val());
	}else{
	  $("#comm_text").val(_.union($("#comm_text").val().split(","),$("#"+id).val()));
	}
      }else if($(e.currentTarget).hasClass("original")){
	this.tag_list = _.without(this.tag_list,$("#"+id).val());
	$("#comm_text").val(_.without($("#comm_text").val().split(","),$("#"+id).val()));
      }
    },*/
    comment : function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var view = this;
      var cid = this.model.get("cid");
      var pid = this.model.get("pid") ? this.model.get("pid") : 0;
      var text = $.trim($("#comm_text").val());
      text = App.util.cleanInput(text); // 过滤一下评论内容，防止脚本注入
      var params = {clipid: cid, text: text, pid: pid};
      /*var params1 = null;
      if($("#reclip").attr("checked")){ // checked 、tag_list都是全局变量
	params1 = {id:cid,clip:{tag:this.tag_list,note:[{text:text}]}};
      }*/
      if(!App.ClipApp.isLoggedIn()){
	App.ClipApp.showLogin(function(){
	  view.trigger("@saveaddComm",this, params, mid);
	});
      }else{
	view.trigger("@saveaddComm", this, params, mid);
      }
    },
    shortcut_comment : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$(".verify").click();
	return false;
      }else{
	return true;
      }
    },
    cancel : function(){
      this.trigger("@canceladdComm",this.model.get("cid"));
    }
  });

  // 显示clip的detail内容 [clipDetiail 以及 Comment]
  function showDetail (detailModel){
    var detailView = new DetailView({model: detailModel});
    App.viewRegion.show(detailView);
    $("#focus").focus(); // 是的详情响应pagedowm pageup等键盘事件
    var anchors = this.$(".content a");
    for(var i=0;i<anchors.length;i++){
      var anchor = anchors[i];
      anchor.target="_blank";
    }
  };

  // 获取comment内容，需要对得到的数据进行显示
  function showComment (cid){
    var comment = new App.Model.CommentModel({cid: cid});
    comment.fetch();
    comment.onChange(function(commentModel){ // rename CommentsView
      var commentView = new CommentView({model: commentModel});
      ClipDetail.commentRegion = new App.Region({el:".comments"});
      ClipDetail.commentRegion.show(commentView);
    });
  };

  function showReplyComm (cid, pid){
    regionClose("addCommRegion"); // 关闭最下边的评论框区域
    var model = new App.Model.CommentModel({cid : cid, pid: pid});
    var replyView = new AddCommView({model: model});
    ClipDetail.replyCommRegion = new App.Region({
      el: "#reply_Comm_showDiv"
    });
    ClipDetail.replyCommRegion.show(replyView);
    $("#comm_text").focus(); // 如果是弹出的回复对话框就要聚焦
  };

  function showAddComm (cid, focus){
    regionClose("replyCommRegion"); // 关闭回复评论框
    var model = new App.Model.CommentModel({cid: cid});
    var addCommView = new AddCommView({model: model});
    ClipDetail.addCommRegion = new App.Region({el:".input_textarea"});
    ClipDetail.addCommRegion.show(addCommView);
    $(".cancel").css("display","none");
    if(focus) $("#comm_text").focus(); // 如果是弹出的回复对话框就要聚焦
  };

  var detailClose = function(){
    ClipDetail.close();
  };

  var detailComment = function(cid){ // 当点击clipdetail的评时
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){
	showAddComm(cid, true);
      });
    }else{
      showAddComm(cid, true);
    }
  };

  var showReply = function(cid, pid){
    if(!App.ClipApp.isLoggedIn()){
      App.ClipApp.showLogin(function(){
	showReplyComm(cid, pid);
      });
    }else{
      showReplyComm(cid, pid);
    }
  };

  var delComment = function(cid, comm_id){
    var model = new App.Model.CommentModel({cid: cid, id: comm_id});
    model.destroy({
      success:function(model, res){ // 删除评论成功，重新加载comment
	showComment(cid);
	showAddComm(cid);
      },
      error:function(model, res){}
    });
  };

  var resetUrl = function(hist, offset){
    if(/clip\/([0-9]+)\/([0-9]+)/.test(hist)) hist = "";
    Backbone.history.navigate(hist, false);
    if($('html').hasClass("lt-ie8")){ // ie7
      $(document.body).scrollTop(offset);
    }else{
      $(window).scrollTop(offset);
    }
  };

  var canceladdComm = function(cid){
    regionClose("replyCommRegion");
    showAddComm(cid);
  };

  var saveaddComm = function(view, params, mid){
    var model = new App.Model.CommModel();
    model.save({pid:params.pid, text:params.text},{
      url : App.ClipApp.encodeURI(P+"/clip/"+params.clipid+"/comment"),
      success:function(comment,response){
	/*if(params1){ // 避免comment和reclip同时去写clip数据
	  App.vent.trigger("app.clipapp.reclip:sync",params1,mid);
	}*/
	showComment(params.clipid);
	showAddComm(params.clipid);
	App.vent.trigger("app.clipapp.comment:success",  {type:"comment",pid:params.pid,model_id:mid});
      },
      error:function(comment,res){
	if(res.comm_text == "is_null")
	  $("#comm_text").blur().val("");
	view.showError("comment", res);
      }
    });
  };

  function regionClose(name){
    if(ClipDetail[name]){
      ClipDetail[name].close();
    }
  }

  ClipDetail.show = function(cid,model_id,recommend){ // cid等于detailModel.id
    var ids = cid.split(":");
    var model = new App.Model.DetailModel({id: cid, rid:recommend.rid, ruser:recommend.user});
    mid = model_id;
    // 获取当前页面的 url 以及 scrollTop
    hist = Backbone.history.fragment;
    offset = $(window).scrollTop() || $(document.body).scrollTop();
    Backbone.history.navigate("clip/"+ids[0]+"/"+ids[1], false);
    model.fetch({
      success:function(res,detailModel){
	model.onChange(function(detailModel){
	  showDetail(detailModel);
	  showComment(cid);
	  showAddComm(cid);
	});
      },
      error:function(res,error){
	 App.ClipApp.showConfirm(error);
      }
    });
  };

  ClipDetail.close = function(){
    regionClose("commentRegion");
    regionClose("replyCommRegion");
    regionClose("addCommRegion");
    App.popRegion.close();
    resetUrl(hist, offset);
    App.viewRegion.close();
    mid = null;
  };

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    if(ClipDetail.addCommRegion || ClipDetail.replyCommRegion){
      ClipDetail.close();
    }
  });

  return ClipDetail;
})(App, Backbone, jQuery);
App.ClipApp.ClipEdit = (function(App, Backbone, $){

  var ClipEdit = {};
  var P = App.ClipApp.Url.base;
  var view = "", isIE = App.util.isIE();
  var old_content = "",ieRange = false;

  var EditModel = App.Model.extend({
    validate: function(attrs){
      var content = attrs.content;
      if(!content || content.replace(/&nbsp;+|\s+/g,"") == ""){
	return {"content":"is_null"};
      }else{
	return null;
      }
    }
  });
  var EditView = App.DialogView.extend({
    tagName: "div",
    className: "editDetail-view",
    template: "#editDetail-view-template",
    events: {
      // "change #formUpload":"image_change", // 改成了直接在jade中绑定
      "mousedown #formUpload":"save_range", //IE-7,8,9下保存Range对象
      "mousedown .link_img":"save_range", //IE-7,8,9下保存Range对象
      "click .link_img":"extImg",
      "click .btn_img":"up_extImg",
      "click .masker_layer1":"hide_extImg",
      "click .format":"upFormat",
      "click .note":"remarkClip",
      "click #editClip_Save":"saveUpdate",
      "click .cancel":"abandonUpdate",
      "click .masker":"masker",
      "click .close_w":"abandonUpdate"
    },
    initialize: function(){
      view = this;
      view.bind("@success", editSuccess);
      view.bind("@error", editFailed);
      view.bind("@cancel", editCanceled);
    },
    save_range:function(){//IE插入图片到光标指定位置，暂存光标位置信息
      var win=document.getElementById('editor').contentWindow;
      var doc=win.document;
      //ieRange=false;
      //doc.designMode='On';//可编辑
      win.focus();
      if(isIE){ // 是否IE并且判断是否保存过Range对象
	ieRange=doc.selection.createRange();
      }
    },
    extImg:function(evt){
      $(".masker_layer1").show();
      $(".img_upload_span").show();
      $("#img_upload_url").focus();
      $("#img_upload_url").val("");
    },
    hide_extImg: function(e){
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
    },
    up_extImg: function(){ // 确定上传
      var url = $("#img_upload_url").val();
      if(url == "http://" || !url )return;
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
      App.Editor.insertImage("editor", {url: url,ieRange:ieRange});
    },
    upFormat:function(){ // 进行正文抽取
      // $(".editContent-container").addClass("ContentEdit"); // 改变显示格式
      // 为.editContent-container下的p标签添加click事件
      // console.info("调整页面格式");
    },
    remarkClip:function(){
      App.ClipApp.showMemo(this.model.id);
    },
    saveUpdate: function(e){
      var target = $(e.currentTarget);
      target.attr("disabled",true);
      var cid = this.model.id;
      var content = App.Editor.getContent("editor"); // 参数为编辑器id
      if(content == old_content){
	view.trigger("@cancel");
	//App.ClipApp.showSuccess({"content": "no_change"}); 没发生变化直接关闭
      }else{
	var editModel = new EditModel({});
	// 不用this.mode因为this.model中有 录线图
	editModel.save({content: content}, {
	  type:'PUT',
	  url: App.ClipApp.encodeURI(P+"/clip/"+cid),
	  success:function(model, res){
	    var content = model.get("content");
	    view.trigger("@success", content, cid);
	  },
	  error:function(model, error){  // 出现错误，触发统一事件
	    target.attr("disabled", false);
	    view.trigger("@error", error);
	  }
	});
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.abandonUpdate();
      }
    },
    abandonUpdate: function(){
      var content = App.Editor.getContent("editor"); // 参数为编辑器id
      view.trigger("@cancel", content);
    }
  });

  ClipEdit.image_change = function(sender){
    var change = App.util.isImage("formUpload");
    if(!change){
      view.trigger("@error", "imageUp_fail");
    }else{
      /*if( sender.files &&sender.files[0] ){
       var img = new Image();
       img.src = App.util.get_img_src(sender.files[0]);
       img.onload=function(){
       if(img.complete){
       App.Editor.insertImage("editor", {url: img.src,id:count++,ieRange:ieRange});
       }};}*/
      $("#img_form").submit();
      App.util.get_imgurl("post_frame",function(err, img_src){
	//img_list.push(img_src);
	if(!err && img_src){
	  App.Editor.insertImage("editor", {url: img_src,ieRange:ieRange});
	}else{
	  App.ClipApp.showConfirm("imageUp_fail");
	}
      });
      App.util.clearFileInput(sender);
    }
  };

  ClipEdit.show = function(clipid){
    var model = new App.Model.DetailModel({id: clipid});
    model.fetch();
    model.onChange(function(editModel){
      var editView = new EditView({model: model});
      App.viewRegion.show(editView);
      var html = App.util.contentToHtml(editModel.toJSON().content);
      App.Editor.init();
      // 保证了api层接受的数据和返回的数据都是ubb格式的
      App.Editor.setContent("editor", html);
      setTimeout(function(){
	old_content = App.Editor.getContent("editor"); //参数为编辑器id
      },200);
      $($("#editor").get(0).contentWindow.document.body).keydown(function(e){
	if(e.ctrlKey&&e.keyCode==13){
	  $("#editClip_Save").click();
	}
      });
   });
  };

  ClipEdit.close = function(n_content){
    if(!n_content || n_content == old_content){
      App.viewRegion.close();
    }else{
      App.ClipApp.showAlert("clipedit_save", null, function(){
	App.viewRegion.close();
      });
    }
  };

  var editSuccess =  function(content,cid){
    ClipEdit.close();
    App.vent.trigger("app.clipapp.clipedit:success", content, cid);
  };

  var editFailed = function(error){ // 可以弹出错误对话框，提示错误信息
    App.ClipApp.showConfirm(error, null, function(){
      App.Editor.focus("editor");
    });
  };

  var editCanceled =  function(n_content){
    ClipEdit.close(n_content);
  };

  return ClipEdit;
})(App, Backbone, jQuery);
App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};

  var P = App.ClipApp.Url.base;
  var clip = {}, clipper = "";
  var ieRange = false, isIE = App.util.isIE();

  App.Model.ClipModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(P+"/clip");
    },
    validate: function(attrs){
      var content = attrs.content;
      if(!content || content.replace(/&nbsp;+|\s+/g,"") == ""){
	return {"content":"is_null"};
      }else{
	return null;
      }
    }
  });

  var AddClipView = App.DialogView.extend({
    tagName: "div",
    className: "addClip-view",
    template: "#addClip-view-template",
    events: {
      "mousedown #formUpload":"save_range", //IE-7,8,9下保存Range对象
      "mousedown .link_img":"save_range", //IE-7,8,9下保存Range对象
      //"change #formUpload":"image_change", // 改成了直接在jade中绑定
      "click .link_img":"extImg",//显示连接图片输入框并清空输入框
      "click .btn_img":"up_extImg", // 确定上传
      "click .masker_layer1":"hide_extImg",
      "click .note":"remark_clip",
      "click .close_w":"cancelcliper",
      "click .masker":"masker",
      "click #ok": "okcliper", // 对应clipper的back
      "click #cancel": "cancelcliper",
      "click #save": "savecliper", // 对应clipper的ok
      "click #empty":"emptycliper"
    },
    initialize:function(){
      clip = {};
      this.bind("@error", saveFailed);
      this.bind("@cancel", saveCanceled);
      this.bind("@closeRegion", closeRegion);
    },
    extImg:function(evt){
      $(".masker_layer1").show();
      $(".img_upload_span").show();
      $("#img_upload_url").focus();
      $("#img_upload_url").val("");
    },
    hide_extImg: function(e){
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
    },
    up_extImg: function(e){
      e.preventDefault();
      var url = $("#img_upload_url").val();
      if(url == "http://" || !url )return;
      $(".masker_layer1").hide();
      $(".img_upload_span").hide();
      App.Editor.insertImage("editor", {url: url,ieRange:ieRange});
    },
    save_range:function(){//IE插入图片到光标指定位置，暂存光标位置信息
      var win=document.getElementById('editor').contentWindow;
      var doc=win.document;
      //ieRange=false;
      //doc.designMode='On';//可编辑
      win.focus();
      if(isIE){//是否IE并且判断是否保存过Range对象
	ieRange=doc.selection.createRange();
      }
    },
    okcliper:function(){
      this.trigger("@closeRegion");
      App.vent.trigger("app.clipapp.clipper:ok");
    },
    masker:function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelcliper();
      }
    },
    cancelcliper:function(){
      clip.content = App.Editor.getContent("editor");
      if(clipper){
	App.vent.trigger("app.clipapp.clipper:cancel", clip);
      }else{
	this.trigger("@cancel", clip);
      }
    },
    savecliper:function(e){
      e.preventDefault();
      var target = $(e.currentTarget);
      var view = this;
      target.attr("disabled",true);
      clip.content = App.Editor.getContent("editor");
      this.model.save(clip, {
	success:function(model,res){ // 返回值res为clipid:clipid
	  model.id = res.clipid; // 将clip本身的id设置给model
	  view.trigger("@closeRegion");
	  if(clipper) App.vent.trigger("app.clipapp.clipper:save");
	  else App.vent.trigger("app.clipapp.clipadd:success", model);
	},
	error:function(model,error){  // 出现错误，触发统一事件
	  target.attr("disabled",false);
	  view.trigger("@error", error);
	}
      });
    },
    emptycliper:function(){
      this.trigger("@closeRegion");
      App.vent.trigger("app.clipapp.clipper:empty");
    },
    remark_clip: function(){ // 此全局变量就是为了clip的注操作
      App.ClipApp.showMemo(clip);
    }
  });

  var saveFailed = function(error){
    App.ClipApp.showConfirm(error, null, function(){
      App.Editor.focus("editor");
    });
  };

  var saveCanceled = function(clip){
    ClipAdd.close(clip);
  };

  var closeRegion = function(){
    App.viewRegion.close();
  };

  // 在template中直接绑定
  ClipAdd.image_change = function(sender){
    var change = App.util.isImage("formUpload");
    if(!change){
      view.trigger("@error", "imageUp_fail");
    }else{
      /*if( sender.files &&sender.files[0] ){//图片本地预览代码
       var img = new Image();
       img.src = App.util.get_img_src(sender.files[0]);
       img.onload=function(){
       if(img.complete){
       App.Editor.insertImage("editor", {url: img.src,id:count++,ieRange:ieRange});
       }};}*/
      $("#img_form").submit();
      App.util.get_imgurl("post_frame",function(err, img_src){
	// img_list.push(img_src);
	if(!err && img_src){
	  App.Editor.insertImage("editor",{url: img_src,ieRange:ieRange});
	}else{
	  App.ClipApp.showConfirm("imageUp_fail");
	}
      });
      //解决ie 789 无法连续上传相同的图片，需要清空上传控件中的数据
      App.util.clearFileInput(sender);
    }
  };

  ClipAdd.show = function(isClipper){ // 是否为书签摘录
    clipper = isClipper;
    var clipModel = new App.Model.ClipModel();
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
    App.Editor.init();
    App.Editor.focus("editor");
    //为iframe添加keydown事件，可以按快捷键提交iframe中的输入
    $($("#editor").get(0).contentWindow.document.body).keydown(function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#save").click();
      }
    });
  };

  ClipAdd.close = function(clip){
    if(!clip || !clip.content){
      App.viewRegion.close();
    }else{
      App.ClipApp.showAlert("clipadd_save", null, function(){
	App.viewRegion.close();
      });
    }
  };

  App.vent.bind("app.clipapp.clipadd:memo",function(data){
    clip.note = data.note;
    clip.tag = data.tag;
    clip["public"] = data["public"];
  });

  return ClipAdd;
})(App, Backbone, jQuery);
App.ClipApp.Help=(function(App,Backbone,$){
  var Help={},hist;
  var HelpModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI("/help/help_"+this.get("lang")+".json");
    }
  });
  var HelpView =  App.DialogView.extend({
    tagName : "div",
    className : "help-view",
    template:"#help-view-template",
    events:{
      "click .close_w"  :"cancel",
      "click .masker"   :"masker_close",
      "click .title"    :"toggle"
    },
    initialize: function(){
      this.bind("@closeView",close);
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@closeView");
    },
    masker_close:function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@closeView");
      }
    },
    toggle : function(e){
      e.preventDefault();
      var id = e.currentTarget.id.split("_")[1];
      Backbone.history.navigate("help/"+id, false);
      for(i=1;i<=11;i++){
	if(i != id){
	  $("#descrp_"+i).hide();
	}
      }
      $("#descrp_"+id).toggle();
      //console.info($(e.currentTarget));
      //$(e.currentTarget).nextAll().toggle();
    }
  });

  Help.show = function(item,history){
    var lang=App.versions.getLanguage();
    hist=history;
    console.info(lang);
    var help = new HelpModel({item:item,lang:lang});
    help.fetch({});
    help.onChange(function(helpModel){
      var helpView = new HelpView({model:helpModel});
      App.popRegion.show(helpView);
      $("#descrp_"+item).attr("class","current");
    });
  };

  Help.close = function(){
    App.popRegion.close();
    if(/help\/([0-9]+)/.test(hist))  hist = "";
    Backbone.history.navigate(hist, false);
  };

 var close = function(){
    Help.close();
  };

  return Help;
})(App,Backbone,jQuery);

 // app.clipapp.cliplist.js
App.ClipApp.ClipList = (function(App, Backbone, $){
  var ClipList = {};
  var clips_exist = true;
  var hide_clips = [];
  var clipListView = {};
  var collection = {},start, end, current;
  var url = "",base_url = "",data = "",type = "",collection_length,new_page;
  var loading = false, P = App.ClipApp.Url.base;
  var ClipPreviewModel = App.Model.extend({
    defaults:{
      recommend:"",//列表推荐的clip时有此属性
      user :{},
      content:{},
      reprint_count:"",
      reply_count:"",
      hide:false
    }
  });

  // 对my interest 和 my recommened的数据进行转换
  // [同时避免不同用户之间的clipid相同的冲突]
  // 不同用户转载给我相同的数据
  var ClipPreviewList = App.Collection.extend({
    model : ClipPreviewModel,
    parse : function(resp){
      for( var i=0; resp && i<resp.length; i++){
	// 使得resp中的每一项内容都是对象
	if(!resp[i].clip){
	  resp[i].clipid = resp[i].id;
	  resp[i].id = resp[i].user.id+":"+resp[i].id;
	}else{ // 表示是别人推荐的clip
	  resp[i].clipid = resp[i].clip.id;
	  resp[i].user = resp[i].clip.user;
	  resp[i].content = resp[i].clip.content;
	  resp[i].reprint_count = resp[i].clip.reprint_count? resp[i].clip.reprint_count:0;
	  resp[i].reply_count = resp[i].clip.reply_count? resp[i].clip.reply_count:0;
	  resp[i]["public"] = resp[i].clip["public"];
	  delete resp[i].clip;
	  resp[i].id = resp[i].recommend.user.id+":"+resp[i].recommend.rid;
	}
	if(resp[i].hide){// 取interest数据的时候，该属性描述是否显示
	  hide_clips.push(resp[i].id);
	}
      }
      return resp;
    }
  });

  var ClipPreviewView = App.ItemView.extend({
    tagName: "article",
    className: "clip",
    template: "#clippreview-view-template",
    events: {
      // 单击clip就响应show_detail事件
      "click #header" : "show_detail",
      "click .operate" : "operate",
      "mouseenter .clip_item": "mouseEnter",
      "mouseleave .clip_item": "mouseLeave"
    },
    initialize: function(){
      var $container = $('#list');
      this.bind("item:rendered",function(itemView){
	if(this.model.get("content").image){
	  this.$el.find("p").addClass("text");
	  itemView.$el.imagesLoaded(function(){
	    $container.masonry("reload");
	  });
	}else{
          this.$el.find("p").addClass("no_img_text");
	  this.$el.find("span.biezhen").remove();
	  //STRANGE若不加延时则所有clip无图片
	  // 在翻页时最后一个clip不产生动态布局效果
	  setTimeout(function(){
	    $container.masonry("reload");
	  },0);
	}
      });
    },
    show_detail: function(){
      //部分ff ie 选中clip preview 中内容会触发鼠标单击事件打开详情页
      //ie-7 8 无getSelection()只有document.selection  ie9 两个对象都有
      if(document.selection&&document.selection.createRange().htmlText){
	return;
      }else if(window.getSelection&&$.trim(window.getSelection().toString())){
	return;
      }
      var recommend = {
	rid: this.model.get("recommend").rid,
	user: this.model.get("recommend").user ? this.model.get("recommend").user.id : null
      };
      var clipid = this.model.get("user").id + ":" + this.model.get("clipid");
      App.ClipApp.showDetail(clipid,this.model.id,recommend);
    },
    mouseEnter: function(e){
      $(e.currentTarget).children(".master").children("#opt").show();
    },
    mouseLeave: function(e){
      $(e.currentTarget).children(".master").children("#opt").hide();
    },
    operate: function(e){
      e.preventDefault();
      var opt = $(e.currentTarget).attr("class").split(' ')[0];
      var cid = this.model.get("user").id + ":" + this.model.get("clipid");
      var pub = this.model.get("public");
      var mid = this.model.id;
      switch(opt){
	case 'reclip'://收
	  var recommend = { // 只是传给reclip用
	    rid : this.model.get("recommend").rid,
	    user: this.model.get("recommend").user ? this.model.get("recommend").user.id : null
	  };
	  App.ClipApp.showReclip(cid, mid, recommend, pub); break;
	//case 'recommend'://转
	  //App.ClipApp.showRecommend(cid,mid,pub);break;
	case 'comment'://评
	  App.ClipApp.showComment(cid, mid); break;
	case 'note'://注
	  App.ClipApp.showMemo(cid); break;
	case 'modify'://改
	  App.ClipApp.showEditClip(cid); break;
	case 'del'://删
	  App.ClipApp.showClipDelete(cid); break;
      }
    }
  });

  var ClipListView = App.CollectionView.extend({
    tagName: "div",
    className: "preview-view",
    itemView: ClipPreviewView
  });

  ClipList.flag_show_user = true; //clippreview是否显示用户名和用户头像
  ClipList.showSiteClips = function(tag){
    current = null;
    ClipList.flag_show_user = true;
    base_url = P+"/query";
    // 起始时间设置为，endTime前推一个月
    var date = (new Date()).getTime();
    data = {"startTime":date-86400000*30,"endTime":date+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page(current);
  };

  ClipList.showUserClips = function(uid, tag){
    current = null;
    ClipList.flag_show_user = false;
    base_url = P+"/user/"+uid+"/query";
    data = {user: uid,"startTime":Date.parse('March 1, 2012'),"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    if(App.ClipApp.isSelf(uid)) current = "my";
    init_page(current);
  };

  // 这两个Query对结果是没有要求的，按照关键字相关度
  ClipList.showSiteQuery = function(word, tag){
    current = null;
    ClipList.flag_show_user = true;
    base_url = P + "/query";
    var date = (new Date()).getTime();
    data = {text: word, "startTime":date-86400000*30,"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    init_page(current);
  };

  // 是否public以及originality 都在api层进行判断
  ClipList.showUserQuery = function(uid, word, tag){
    current = null;
    ClipList.flag_show_user = false;
    base_url = P + "/user/"+uid+"/query";
    data = {text: word, user: uid, "startTime":Date.parse('May 1, 2012'),"endTime":(new Date()).getTime()+10000};
    if(tag) data.tag = [tag];
    type = "POST";
    if(App.ClipApp.isSelf(uid)) current = "my";
    init_page(current);
  };

  ClipList.showUserInterest = function(uid, tag){
    current = "interest";
    ClipList.flag_show_user = true;
    base_url = "/user/" + uid + "/interest";
    if(tag) base_url += "/tag/" + tag;
    base_url = P + base_url;
    data = null;
    type = "GET";
    init_page(current);
  };

  ClipList.showUserRecommend = function(uid, tag){
    current = "@me";
    ClipList.flag_show_user = true;
    base_url = "/user/"+uid+"/recomm";
    if(tag) base_url += "/tag/"+tag;
    base_url = P + base_url;
    data = null;
    type = "GET";
    init_page(current);
  };

  function collection_filter(collection,hide_list){
    collection_length -= hide_list.length;
    for(var i=0;i<hide_list.length;i++){
      collection.remove(collection.get(hide_list[i]));
    }
  };

  function init_page(current){
    var clips = new ClipPreviewList();
    collection = clips;
    start = 1;
    end = App.ClipApp.Url.page;
    url = App.ClipApp.encodeURI(base_url + "/" + start+".."+ end);
    if(data){
      data = JSON.stringify(data);
      var contentType = "application/json; charset=utf-8";
      collection.fetch({url:url,type:type,contentType:contentType,data:data});
    }else{
      collection.fetch({url:url,type:type});
    }
    collection.onReset(function(clips){
      if(clips&&clips.length==0){
	clips_exist = false;
      }else{
	clips_exist = true;
      }
      collection_length = clips.length;
      new_page = collection.length==App.ClipApp.Url.page ? true :false;
      collection_filter(clips,hide_clips);
      clipListView = new ClipListView({collection:clips});
      $('#list').masonry({
	itemSelector : '.clip',
	columnWidth : 330,
	isAnimated: false,//动态效果导致：overflow:hidden  cliplist 边被裁掉
	animationOptions: {
	  duration: 800,
	  easing: 'linear',
	  queue: false
	}
      });
      $("#list").css({height:"0px"});
      //页面头部的紫色区域高度为99px；$(".header").height()==99
      if($(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8")){
	  $(document.body).scrollTop(99);
	}
      }
      $("#list").show();
      $("#follow").hide();
      App.listRegion.show(clipListView);
      current_page(current);
      if(collection.length<10){ // 去重之后不够十条继续请求
	nextpage();
      }
      if(!clips_exist){
	if(window.location.hash=="#my"){
	  $("#list").append(_i18n('message.cliplist_null.my'));
	}else if(window.location.hash=="#my/recommend"){
	  $("#list").append(_i18n('message.cliplist_null.recommend'));
	}else if(window.location.hash=="#my/interest"){
	  $("#list").append(_i18n('message.cliplist_null.interest'));
	}else{
	  $("#list").append(_i18n('message.cliplist_null.all'));
	}
      }
    });
  };

  // need refactor 不互相压着是否z-index就没有关系呢
  function current_page(str){
    setTimeout(function(){ // 如果没有延时去不到东西
      if(str=="my"){
	$(".my").css({"z-index":2,"top":"-3px","height":"33px"});
	$(".at_me").css({"z-index":1,"top":"0px","height":"30px"});
	$(".expert").css({"z-index":0,"top":"0px","height":"30px"});
      }else if(str=="@me"){
	$(".my").css({"z-index":1,"top":"0px","height":"30px"});
	$(".at_me").css({"z-index":1,"top":"-3px","height":"33px"});
	$(".expert").css({"z-index":0,"top":"0px","height":"30px"});
      }else if(str=="interest"){
	//ie7 此处层次关系导致次数必须设成0,2,2，0,0,1和0,1,2 效果不正确
	$(".my").css({"z-index":0,"top":"0px","height":"30px"});
	$(".at_me").css({"z-index":2,"top":"0px","height":"30px"});
	$(".expert").css({"z-index":2,"top":"-3px","height":"33px"});
      }else {
	$(".my").css({"z-index":2,"top":"0px","height":"30px"});
	$(".at_me").css({"z-index":1,"top":"0px","height":"30px"});
	$(".expert").css({"z-index":0,"top":"0px","height":"30px"});
      }
    }, 200);
  };

  function nextpage(){
    if(loading)return;
    if(!App.listRegion.currentView)return;
    if(App.listRegion.currentView.$el[0].className=="preview-view"&&new_page){
      loading = true;
      start += App.ClipApp.Url.page;
      end = start + App.ClipApp.Url.page-1;
      url = App.ClipApp.encodeURI(base_url + "/" + start + ".." + end);
      var contentType = "application/json; charset=utf-8";
      if(!data){ contentType = null; }
      collection.fetch({
	url:url,
	type:type,
	contentType:contentType,
	add:true,
	data:data,
	error :function(){
	  new_page = false;
	  loading = false;
	},
	success :function(col,res){
	  if(res.length >= App.ClipApp.Url.page){
	    collection_length = collection.length;
	  }else{
	    new_page = false;
	  }
	  setTimeout(function(){
	    loading = false;
	  },500);
	}
      });
    }
  };

  App.vent.bind("app.clipapp.clipadd:success", function(addmodel){
    var json = data ? JSON.parse(data) : null;
      if(json && App.ClipApp.isSelf(json.user) && (!json.tag || _.intersection(json.tag,addmodel.get("tag")).length > 0) ){ //是my或my/tag tag in addmodel
      var model = new ClipPreviewModel();
      var uid = App.ClipApp.getMyUid();
      var id = uid+":"+addmodel.id;
      var clipid = addmodel.id;
      var tag = addmodel.get("tag");
      var note = addmodel.get("note");
      var _public = addmodel.get("public");
      var user = {id : uid};
      var content = App.util.getPreview(addmodel.get("content"), 100);
      //clip本身的id为自己的id，model的id为uid:cid
      model.set({"public":_public,"content":content,"id":id,"clipid":clipid,"tag":tag,"note":note,"user":user,"recommend":""});
      var fn = clipListView.appendHtml;
      clipListView.appendHtml = function(collectionView, itemView){
	collectionView.$el.prepend(itemView.el);
	clipListView.appendHtml = fn;
      };
      clipListView.collection.add(model,{at:0});
      start++;
      collection_length++;
      $("#list").masonry("reload");
    }else{ // 要进行myshow
      Backbone.history.navigate("my", true);
    }
  });

  function remove(model_id){
    var model = clipListView.collection.get(model_id);
    clipListView.collection.remove(model);
    $("#list").masonry("reload");
    start--;
    collection_length--;
    if(collection_length == 0){
      nextpage();
    }
  };

  // 评论总数以及转载总数的同步
  function refresh(args){
    if(!args || !args.model_id){
      return;
    }else{
      var model=App.listRegion.currentView.collection.get(args.model_id);
      var clip=model.get("clip");
      if(args.type == "comment"){
	if(args.pid == 0){
	  var reply_count = model.get("reply_count");
	  reply_count = reply_count ? reply_count + 1 : 1;
	  model.set({"reply_count":reply_count});
	}
      }
      if(args.type == "reclip"){
	var reprint_count = model.get("reprint_count");
	reprint_count = reprint_count ? reprint_count + 1 : 1;
	model.set({"reprint_count":reprint_count});
      }
    }
  };

  App.vent.bind("app.clipapp.clipedit:success",function(content,model_id){
    var collection = clipListView.collection;
    var model = collection.get(model_id);
    var newcontent = App.util.getPreview(content, 100);
    model.set({content:newcontent});
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(model_id){
    remove(model_id);
  });

  App.vent.bind("app.clipapp.clipmemo:success", function(model){
    var json = JSON.parse(data); // 此处的data是标识list的全局变量
    var user = json.user;
    if(App.ClipApp.isSelf(user) && json.tag){
      var tag = json.tag[0];
      var flag = _.find(model.get("tag"), function(t){ return t == tag; });
      if(flag === undefined) remove(user+":"+model.get("clipid"));
    }
  });

  App.vent.bind("app.clipapp.comment:success", function(args){
    refresh(args);
  });

  App.vent.bind("app.clipapp.reclip:success", function(args){
    refresh(args);
  });

  App.vent.bind("app.clipapp:nextpage", function(){
    nextpage();
  });

  // 牵扯太多的路由所以在 bubb中使用history.navigate进行路由的设定
  App.vent.bind("app.clipapp:open_bubb", function(uid, tag){
    if(/interest/.test(base_url)){
      ClipList.showUserInterest(uid, tag);
    }else if(/recommend/.test(base_url)){
      ClipList.showUserRecommend(uid, tag);
    }else{
      if(!uid){
	ClipList.showSiteClips(tag);
      }else {
	ClipList.showUserClips(uid, tag);
      }
    }
  });

  return ClipList;
})(App, Backbone, jQuery);
// app.clipapp.routing.js

App.Routing.ClipRouting = (function(App, Backbone){
  var ClipRouting = {};

  ClipRouting.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      // site
      "":"siteShow",
      "home":"siteShow",
      "tag/:tag":"siteShow",
      "query/:word":"siteQuery",
      "help/:item":"help",

      "register": "showRegister",
      "invite/:key" : "invite",
      "active/:key": "active",
      "password/find":"findpasswd",
      "password/reset/:link":"resetpasswd",
      "oauth/callback":"oauth",
      "error/:message":"error",
      // user
      "user/:uid": "userShow",
      "user/:uid/tag/:tag":"userShow",
      "user/:uid/following":"userFollowing",
      "user/:uid/follower":"userFollower",

      "user/:uid/query/:word":"userQuery",
      "user/:uid/query":"userQuery",
      "my/query/:word":"myQuery",
      "my/query":"myQuery",

      // my
      "my":"myShow",
      "my/tag/:tag":"myShow",
      "my/following":"userFollowing",
      "my/follower":"userFollower",

      //"my/recommend":"myRecommend",
      //"my/recommend/tag/:tag":"myRecommend",
      "my/interest":"myInterest",
      "my/interest/tag/:tag":"myInterest",
      // "my/setup":"mySetup",

      "clip/:uid/:clipid":"clipDetail"

    }
  });

  App.addInitializer(function(){
    ClipRouting.router = new ClipRouting.Router({
      controller: App.ClipApp
    });

    //输入内容搜索，返回显示结果需要更新hash
    ClipRouting.router.bind("app.clipapp.routing:query",function(word, uid){
      if($.browser.safari){word = encodeURI(word);}
      if(uid){
	if(App.ClipApp.isSelf(uid)){
	  App.Routing.showRoute("my/query",word);
	}else{
	  App.Routing.showRoute("user", uid, "query",word);
	}
      }else{
	App.Routing.showRoute("query",word);
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:help",function(item){
      App.Routing.showRoute("help/"+item);
    });

    ClipRouting.router.bind("app.clipapp.routing:siteshow", function(tag){
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("tag", tag);
      }else{
	App.Routing.showRoute("");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:usershow", function(uid, tag){
      if(App.ClipApp.isSelf(uid)){
	if(tag){
	  if($.browser.safari){tag = encodeURI(tag);}
	  App.Routing.showRoute("my", "tag", tag);
	}else{
	  App.Routing.showRoute("my");
	}
      }else{
	if(tag){
	  if($.browser.safari){tag = encodeURI(tag);}
	  App.Routing.showRoute("user", uid, "tag", tag);
	}else{
	  App.Routing.showRoute("user", uid);
	}
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:userfollowing",function(uid){
      if(App.ClipApp.isSelf(uid)){
	App.Routing.showRoute("my","following");
      }else{
	App.Routing.showRoute("user",uid, "following");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:userfollower",function(uid){
      if(App.ClipApp.isSelf(uid)){
	App.Routing.showRoute("my","follower");
      }else{
	App.Routing.showRoute("user",uid, "follower");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:interest",function(tag){
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("my/interest", "tag", tag);
      }else{
	App.Routing.showRoute("my/interest");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:recommend",function(tag){
      if(tag){
	if($.browser.safari){tag = encodeURI(tag);}
	App.Routing.showRoute("my/recommend", "tag", tag);
      }else{
	App.Routing.showRoute("my/recommend");
      }
    });

    ClipRouting.router.bind("app.clipapp.routing:clipdetail",function(uid,cid){
      App.Routing.showRoute("clip", uid, cid);
    });
  });


  return ClipRouting;
})(App, Backbone);

// app.comment.js
App.ClipApp.Comment = (function(App, Backbone, $){
  var number_limit =  140;
  var P = App.ClipApp.Url.base;

  // comemntModel有添加，回复，删除，列表等功能
  App.Model.CommentModel = App.Model.extend({
    url:function(){
      if(this.id){
	return App.ClipApp.encodeURI(P+"/clip/"+this.get("cid")+"/comment/"+this.id);
      }else{
	return App.ClipApp.encodeURI(P+"/clip/"+this.get("cid")+"/comment");
      }
    }
  });
  // 主要用于进行comment的保存操作
  App.Model.CommModel = App.Model.extend({
    validate: function(attr){
      var text = attr.text;
      if(text == "" || text == _i18n('comment.defaultText')){
	return {comm_text: "is_null"};
      }else if(text.length > number_limit){
	return {comm_text: "word_limit"};
      }else{
	return null;
      }
    }
  }); //和api层进行交互

  var CommentView = App.DialogView.extend({
    tagName : "div",
    className : "comment-view",
    template : "#comment-view-template",
    tag_list: [],
    events : {
      "focus #comm_text" :"foucsAction",
      "blur #comm_text"  :"blurAction",
     // "click .size48"    :"maintagAction",
      "keydown #comm_text":"shortcut_comment",
      "click #submit"    :"comment",
      "click #cancel"    :"cancel",
      "click .masker"    :"masker",
      "click .close_w"   :"cancel"
    },
    initialize:function(){
      this.bind("@closeView", close);
    },
    foucsAction:function(e){
      this.cleanError(e);
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('comment.defaultText') ? "" :
      $(e.currentTarget).val() );
      $("#submit").attr("disabled",false);
    },
    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('comment.defaultText') :
      $(e.currentTarget).val() );
    },
    /*maintagAction:function(e){
      // 取得评论框中的文本并转为数组，去除掉数组中的默认值和空值。
      $("#comm_text").focus();
      var arr_text = _.compact(_.without($("#comm_text").val().split(","),_i18n('comment.defaultText')));
      var tag = $(e.currentTarget).text(); //取得当前点击的tag
      $(e.currentTarget).toggleClass("white_48"); //tag颜色的切换
      $(e.currentTarget).toggleClass("orange_48");
      if($(e.currentTarget).hasClass("orange_48")){
	this.tag_list.push(tag); //把变色的tag值push进一个数组，reclip时需要。
	$("#comm_text").val((_.union(arr_text,tag)).join(",")); //把点击的tag加入到评论文本框
      }else{ // 与上面相反。
	this.tag_list = _.without(this.tag_list,tag);
	$("#comm_text").val((_.without(arr_text,tag)).join(","));
      }
    },*/
    comment : function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var view = this;
      var text = $.trim($("#comm_text").val());
      text = App.util.cleanInput(text); // 过滤一下评论内容，防止脚本注入
      var params = {text: text, pid: 0};
      var params1 = null;
      /*if($("#reclip_box").attr("checked")){
	params1 = {id:this.model.get("cid"),clip:{tag:this.tag_list,note:[{text:text}]}};}*/
      var tmpmodel = new App.Model.CommModel();
      tmpmodel.save(params,{
	url: App.ClipApp.encodeURI(P+"/clip/"+clipid+"/comment"),
	success: function(model, res){
	  /*if(params1){
	    App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
	  }*/
	  App.vent.trigger("app.clipapp.comment:success", {type:"comment",pid:params.pid,model_id:mid});
	  App.ClipApp.showSuccess("comment");
	  view.trigger("@closeView");
	},
	error:function(model, res){
	  if(res.comm_text == "is_null")
	    $("#comm_text").blur().val("");
	  view.showError("comment", res);
	}
      });
    },
    shortcut_comment : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#submit").click();
	return false;
      }else {
	return true;
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      var text = $.trim($("#comm_text").val());
      if(text == _i18n('comment.defaultText')) text = "";
      this.trigger("@closeView",text);
    }
  });

  var Comment = {};

  var mid,clipid;//mid为model_id

  Comment.show = function(cid,model_id){
    mid = model_id;
    clipid = cid;
    var model = new App.Model.CommModel({cid: cid});
    var view = new CommentView({model : model});
    App.popRegion.show(view);
  };

  Comment.close = function(text){
    if(!text || text == ""){
      App.popRegion.close();
      mid = null;
    }else{
      var fun = function(){App.popRegion.close();mid = null;};
      App.ClipApp.showAlert("comment_save", null, fun);
    }
  };

  var close =  function(text){
    Comment.close(text);
  };

  return Comment;
})(App, Backbone, jQuery);
//app.Recommapp.js

App.ClipApp.Recommend = (function(App,Backbone,$){
  // 用来列出可以转给那些用户
  var P = App.ClipApp.Url.base;
  var that;
  var uid = null; // 被推荐用户的id标识
  var NameListModel=App.Model.extend({});
  var NameList=App.Collection.extend({
    model : NameListModel,
    url   : App.ClipApp.encodeURI(P +"/lookup/0..5)")
  });

  var RecommModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/user/"+uid+"/recomm");
    },
    initialize:function(){
      uid = null;
    }
  });

  var RecommView = App.DialogView.extend({
    tagName:"div",
    className:"",
    template:"#recommend-view-template",
    events:{
      "click .user" : "getUserAction",
      "input #recomm_name"   : "nameListAction",
      //ie-7 8 input事件相当于focus事件，在输入文字过程中不会重复触发
      "click #recomm_name"   : "nameListAction",
      "focus #recomm_name"   : "nameListShow",
      "blur #recomm_name"    : "nameBlur",
      "keydown #recomm_name": "selectAction",
      "mouseover .user"      :  "MouseOver",
      "mouseout .user"       :  "MouseOut",
      "input #recomm_text"   :  "WordsAction",
      "focus #recomm_text":  "clearAction",
      "blur  #recomm_text":  "textBlur",
      "click #submit"        :  "recommendAction",
      "click #cancel"        :  "cancelAction",
      "click .masker"  :  "masker",
      "click .close_w"       :  "cancelAction"
    },
    initialize:function(){
      that = this;
      this.tmpmodel= new RecommModel();
      setTimeout(function(){
	this.$("#recomm_name").focus();
      },500);
      this.bind("@lookup", lookup);
      this.bind("@closeView", close);
    },
    getUserAction:function(e){
      $("#imgId").css("display","none");
      var face = $(e.currentTarget)[0].children[0].children[0].src;
      var name = $($(e.currentTarget)[0].children[1]).text();
      uid =  $(e.currentTarget)[0].children[1].id.split("_")[1];
      this.$("#recomm_name").val(name);
      this.$("#imgId").attr("src",face);
      this.$("#imgId").css("display","block");
    },
    nameListAction:function(evt){
      this.$("#imgId").css("display","none");
      var str = $.trim(this.$("#recomm_name").val());
      var clip_owner = this.model.get("clipid").split(":")[0];//clip的拥有者
      var params = {q:str};
      //查询friend
      this.trigger("@lookup",params,clip_owner);
    },
    nameBlur:function(){
      var view = this;
      setTimeout(function(){
	var data = view.getInput();
	if(!data.name || data.name == ""){
	  view.showError('recommend',{"recomm_name":"is_null"});
	}else{
	  var div=$(".action-info");
	  if(div.length != 0){
	    $("#imgId").css("display","none");
	    _.each(div,function(e){
	      var li = e.children;
	      if(data.name == $(li[1]).text()){
		uid = li[1].id.split("_")[1];
		// this.$("#recomm_name").val($(li[1]).text());
		this.$("#imgId").attr("src",li[0].children[0].src);
		this.$("#imgId").css("display","block");
	      }
	    });
	    this.$(".list").remove();
	  }
	  if(!uid){
	    view.showError('recommend',{"recomm_name":"not_exist"});
	  }
	}
	$(".name_list").hide();
      },200);
    },
    selectAction:function(event){
      if(event.keyCode == 40){ // DOWN
	var flag = true;
	var div = $("#name_listDiv").children().children();
	for(var i=0;i<div.length;i++){
	  if(flag && $(div[i]).css("background-color") == "rgb(136,136,136)"){
	    $(div[i]).css("background-color","");
	    $(div[i+1]).css("background-color","#888");
	    $("#recomm_name").val($.trim($(div[i+1]).text()));
	    flag = false;
	  }
	}
	if(flag){
	  $(div[0]).css("background-color","#888");
	  $("#recomm_name").val($.trim($(div[0]).text()));
	}
      }else if(event.keyCode == 38){ // UP
	var flag = true;
	var div = $("#name_listDiv").children().children();
	for(var i=0;i<div.length;i++){
	  if(flag && $(div[i]).css("background-color") == "rgb(136,136,136)"){
	    $(div[i]).css("background-color","");
	    $(div[i-1]).css("background-color","#888");
	    $("#recomm_name").val($.trim($(div[i-1]).text()));
	    flag = false;
	  }
	}
	if(flag){
	  $(div[div.length-1]).css("background-color","#888");
	  $("#recomm_name").val($.trim($(div[length-1]).text()));
	}
      }else if(event.keyCode == 13){ // enter
	var div = $("#name_listDiv").children().children();
	for(var i=0;i<div.length;i++){
	  if($(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	    $("#recomm_name").val($.trim($(div[i]).text()));
	    $("#recomm_text").focus();
	    return false;
	  }
	}
      }
    },
    nameListShow:function(e){
      uid = null;
      this.cleanError(e);
      $("#submit").attr("disabled",false);
      var div=$(".action-info");
      if(div.length != 0){
	$(".name_list").show();
      }else{
	$(".name_list").hide();
      }
    },
    MouseOver:function(e){
      var div = $("#name_listDiv").children().children();
      for(var i=0;i<div.length;i++){
	if($(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	  $(div[i]).css("background-color","");
	}
      }
      $(e.currentTarget).css("background-color","#888");
    },
    MouseOut:function(e){
       $(e.currentTarget).css("background-color","");
    },
    WordsAction:function(e){
      this.cleanError(e);
      $("#submit").attr("disabled",false);
    },
    recommendAction:function(e){
      // 在点击转确定按钮时，model.id model.name都已经设置成功
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var view = this;
      var words_limit =  140;//字数限制数
      setTimeout(function(){
	var clipid = view.model.get("clipid");
	var data = view.getInput();
	if(data.text == _i18n('recommend.defaultText')){data.text = "";}
	if(data.text.length > words_limit){
	  view.showError('recommend',{"recomm_text":"word_limit"});
	  return;
	}
	view.setModel('recommend',view.tmpmodel, {text: data.text, clipid: clipid});
	//recommend 需要的参数
	view.tmpmodel.save({},{
	  success:function(model,res){
	    uid = null;
	    Recommend.close();
	    App.ClipApp.showSuccess("recomm");
	    // 目前没有响应事件
	    App.vent.trigger("app.clipapp.recommend:success");
	  },
	  error:function(model,res){
	    view.showError('recommend',res);
	  }
	});
	/*
	//reclip 需要的参数
	if($("#reclip_box").attr("checked")){
	  var params1 = {id : clipid, clip : {note : [{text : data.text}]}};
	  App.vent.trigger("app.clipapp.reclip:sync", params1,mid);
	}*/
      }, 300);
    },
    clearAction:function(e){
      this.cleanError(e);
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('recommend.defaultText') ? "" :
      $(e.currentTarget).val());
      // 当输入框再次聚焦的时候，使得确定按钮可用
      $("#submit").attr("disabled",false);
    },
    textBlur:function(e){
      var view = this;
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('recommend.defaultText') :
      $(e.currentTarget).val() );
      var data = view.getInput();
      view.setModel('recommend',view.tmpmodel, {text: data.text});
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelAction(e);
      }
    },
    cancelAction:function(e){
      var text = this.tmpmodel.get('text');
      this.trigger("@closeView",text);
    }
  });

  var NameListItemView = App.ItemView.extend({
    tagName:"div",
    className:"action-info user",
    template:"#namelist-view-template"
  });

  var NameListCollectionView=App.CollectionView.extend({
    tagName:"div",
    className:"list",
    itemView:NameListItemView
  });


  var Recommend = {};
  var mid;

  Recommend.show = function(cid,model_id,pub){
    var recommModel = new RecommModel({clipid:cid});
    var recommView=new RecommView({model:recommModel});
    //clip的拥有者
    var clip_owner = that.model.get("clipid").split(":")[0];
    if(pub == "false" && !App.ClipApp.isSelf(clip_owner)){
      // 是非public并且不是clip_owner进行的操作
      App.ClipApp.showConfirm({recommend: "no_pub"});
    }else{
      mid = model_id;
      App.popRegion.show(recommView);
      //ie浏览器 input 事件存在bug 为元素绑定onpropertychange事件
      if(App.util.isIE()){
	function nameListAction(evt){
	  that.$("#imgId").css("display","none");
	  var str = $.trim(that.$("#recomm_name").val());
	  var params = {q:str};
	  //查询friend
	  recommView.trigger("@lookup",params,clip_owner);
	}
	document.getElementById('recomm_name').onpropertychange=nameListAction;
      }
    }
  };

  Recommend.close = function(text){
    if(!uid && !text){
      App.popRegion.close();
      mid = null;
      uid = null;
    }else{
      App.ClipApp.showAlert("recommend_save", null, function(){
	App.popRegion.close();
	mid = null;
	uid = null;
      });
    }
  };

  var lookup = function(params,owner_id){
    var collection = new NameList();
    collection.fetch({data:params});
    collection.onReset(function(list){
      var ownmodel=list.get(owner_id);//过滤掉clip的所有者
      list.remove(ownmodel);
      var namelistView = new NameListCollectionView({
	collection:list
      });
      Recommend.nameListRegion = new App.Region({
	el:"#name_listDiv"
      });
      Recommend.nameListRegion.show(namelistView);
      var div=$(".action-info");
      if(div.length != 0){
	$(".name_list").show();
      }else{
	$(".name_list").hide();
      }
    });
  };

  var close = function(text){
    Recommend.close(text);
  };

  App.bind("initialize:after", function(){});

  return Recommend;

})(App,Backbone,jQuery);


App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var P = App.ClipApp.Url.base;
  var mid,o_pub;

  var ReclipModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(P+"/clip/"+this.id+"/reclip");
    }
  });
  var ReclipView = App.DialogView.extend({
    tagName : "div",
    className : "reclip-view",
    template : "#reclip-view-template",
    events : {
      //"keydown #reclip_text":"shortcut_submit",
      //"focus #reclip_text" : "foucsAction",
      //"blur #reclip_text"  : "blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      : "maintagAction",
      "click .masker"      : "masker",
      "click .close_w"     : "cancel"
    },
    initialize: function(){
      this.bind("@submit", reclipSave);
      this.bind("@closeView", close);
    },
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    /*
    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('reclip.defaultNote')  ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('reclip.defaultNote') :
      $(e.currentTarget).val() );
    },
    */
    submit:function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
      params["id"] = this.model.id;
      if($(".error").length == 0){
	this.trigger("@submit", params, mid);
      }else{
	$(e.currentTarget).attr("disabled",false);
      }
    },
    shortcut_submit : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#submit").click();
	return false;
      }else{
	return true;
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
      params["id"] = this.model.id;
      this.trigger("@closeView",params);
    }
  });

  function loadData(el){
    /*var text = "";
    if($.trim($("#reclip_text", el).val())!=_i18n('reclip.defaultNote')){//过滤defaultNote默认值
      text = $.trim($("#reclip_text", el).val());
    }*/
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i,el).html()));
      }
    };
    var obj_tag = _.without($("#obj_tag",el).val().split(","),"");
    obj_tag = _(obj_tag).map(function(e){return e.toLocaleLowerCase();});
    var tag = _.union(obj_tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{tag:tag,"public":"false"}};
    }else{
      var params = {clip:{tag:tag}};
    }
    return params;
  }

  Reclip.close = function(params){
    if(!params||(params.clip.tag.length==0&&params.clip['public']==o_pub)){
      App.popRegion.close();
      mid = null;
    }else{
      var fun = function(){ App.popRegion.close(); mid=null; };
      App.ClipApp.showAlert("reclip_save", null, fun);
    }
  };

  var close = Reclip.close;

  function reclipSave(params,mid){
    var model = new ReclipModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.ClipApp.showSuccess({reclip:"success"});
	var arg = {type:"reclip",model_id:mid,tag:params.clip.tag};
	App.vent.trigger("app.clipapp.reclip:success", arg);
	Reclip.close();
      },
      error:function(model, res){
	Reclip.close();
	App.ClipApp.showConfirm(res);
      }
    });
  }

  Reclip.show = function(cid,model_id,recommend,pub){
    mid = model_id;
    var rid = recommend.rid;
    var ruser = recommend.user;
    if(pub == "false" && ruser != cid.split(':')[0]){
      // 是没公开的，并且不是clip_owner进行的操作
      App.ClipApp.showConfirm({reclip:"no_pub"});
    }else{
      var model = new ReclipModel({id:cid,rid:rid});
      var reclipView = new ReclipView({model : model});
      App.popRegion.show(reclipView);
      o_pub = pub;
      if(pub == "false") $("#checkbox").attr("checked",true);
      $('#obj_tag').tagsInput({});
    }
  };

/*
  App.vent.bind("app.clipapp.reclip:sync", function(params,mid){
    reclipSave(params,mid);
  });
*/

   // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);
App.ClipApp.ReclipTag = (function(App, Backbone, $){
  var ReclipTag = {}, flag = false;
  var P = App.ClipApp.Url.base;

  var ReclipTagModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(P+"/user/"+this.id+"/reclip/tag/"+this.get("tag"));
    }
  });

  var ReclipTagView = App.DialogView.extend({
    tagName : "div",
    className : "reclipTag-view",
    template : "#reclipTag-view-template",
    events : {
      //"focus #reclip_text" : "foucsAction",
      //"blur #reclip_text"  : "blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      : "maintagAction",
      "click .masker"      : "masker",
      "click .close_w"     : "cancel"
    },
    initialize:function(){
      this.bind("@submit", submit);
      this.bind("@closeView", close);
    },
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    /*
    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('reclipTag.defaultNote') ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('reclipTag.defaultNote') :
      $(e.currentTarget).val() );
    },
    */
    submit:function(evt){
      evt.preventDefault();
      var params = loadData(this.$el);
      params["id"] = this.model.get("user");
      params["tag"] = this.model.get("tag");
      this.trigger("@submit", params, this.model.get("count"));
    },
    masker : function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      var params = loadData(this.$el);
      params["id"] = this.model.get("user");
      params["tag"] = this.model.get("tag");
      this.trigger("@closeView",params, this.model.get('count'));
    }
  });

  function loadData(el){
    /*
    var text = "";
    if($.trim($("#reclip_text", el).val())!=_i18n('reclipTag.defaultNote')){//过滤defaultNote默认值
      text = $.trim($("#reclip_text", el).val());
    }
   */
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i,el).html()));
      }
    };
    var tag = _.without($("#obj_tag",el).val().split(","),"");
    tag = _.union(tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{tag:tag,"public":"false"}};
    }else{
      var params = {clip:{tag:tag}};
    }
    return params;
  }

  var close = ReclipTag.close;
  ReclipTag.close = function(params, count){
    if(!params||(params.clip.tag.length==0&&params.clip['public']!='false')){
      App.popRegion.close();
    }else{
      App.ClipApp.showAlert("reclip_save", null, function(){
	App.popRegion.close();
      });
    }
  };

  var submit = function(params,count){
    var model = new ReclipTagModel(params);
    model.save({}, {
      type: "POST",
      success: function(model, res){
	if(res.reclip_tag == count){
	  App.ClipApp.showSuccess("reclip_tag_success");
	} else if(res.reclip_tag == 0){
	  App.ClipApp.showConfirm("reclip_tag_fail");
	}else{
	  App.ClipApp.showConfirm("reclip_tag",res.reclip_tag);
	}
	close(); // 返回的model是什么有待测试
	App.vent.trigger("app.clipapp.recliptag:success",model.get("clip").tag);
      },
      error:function(model, res){
	close();
	App.ClipApp.showConfirm(res);
      }
    });
  };

  ReclipTag.show = function(user, tag){
    var model = new ReclipTagModel({id:user, tag:tag}); //此model只用于取数据
    model.fetch({
      // type: "GET",
      // url: App.util.unique_url(P+"/user/"+user+"/clip/tag/"+tag),
      success: function(model, res){
	if(!res.count){
	  // 现在只是公用该事件，事件名称有待改进
	  App.ClipApp.showConfirm("reclip_null");
	}else{
	  // 有count表示可以收到数据
	  model.set({user:user,tag:tag,count:res.count});
	  var view = new ReclipTagView({model : model});
	  App.popRegion.show(view);
	  $('#obj_tag').tagsInput({
	    //autocomplete_url:'test/fake_json_endpoint.html'
	  });
	}
      },
      error:function(model, res){
	//console.info(res);
      }
    });
  };

  return ReclipTag;
})(App, Backbone, jQuery);
App.ClipApp.ClipDelete = (function(App, Backbone, $){
  var ClipDelete = {};
  var DeleteView = App.DialogView.extend({
    tagName : "div",
    className : "delete-view",
    template : "#delete-view-template",
    events : {
      "click #deleteok_button" : "okClick",
      "click #cancel_button" : "cancelClick",
      "click .masker"        : "masker",
      "click .close_w"       : "cancelClick"
    },
    initialize:function(){
      this.bind("@ok", ok);
      this.bind("@closeView", close);
    },
    okClick : function(e){
      this.trigger("@ok",this.model);
    },
    masker : function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@closeView");
      };
    },
    cancelClick : function(e){
      this.trigger("@closeView");
    }
   });

   var ok = function(deleteModel){
     deleteModel.destroy({
       success: function(model, res){
	 ClipDelete.close();
	 App.vent.trigger("app.clipapp.clipdelete:success", model.id);
       },
       error: function(model, error){
	 App.ClipApp.showConfirm(error);
       }
     });
   };

   var close = function(){
     ClipDelete.close();
   };

   ClipDelete.show = function(cid){
     var model = new App.Model.DetailModel({id:cid});
     var view = new DeleteView({model : model});
     App.popRegion.show(view);
   };

   ClipDelete.close = function(){
     App.popRegion.close();
   };

  // TEST
  //App.bind("initialize:after", function(){ ClipDelete.show(); });

  return ClipDelete;
})(App, Backbone, jQuery);
//app.clipapp.memo.js
App.ClipApp.ClipMemo=(function(App,Backbone,$){

  var MemoModel = App.Model.extend({});
  var P = App.ClipApp.Url.base;
  // 把没有必要的事件改为函数调用
  /*
   * 使用事件的场景：
   * 1，与自己以外的其他部分通讯，不要打破包装原则
   * 2，需要多于一个以上的处理
   * 3，在 view 里，与 view 之外的部分通讯，比如，需要知道 region （1的延伸）
   */
  var MemoView=App.DialogView.extend({
    tagName:"div",
    className:"organize-view",
    template:"#organize-view-template",
    events:{
      "click .size48"          :"tagToggle",
      //"keydown #organize_text" :"shortcut_ok",
      //"focus #organize_text"   :"noteFocus",
      //"blur #organize_text"    :"noteBlur",
      "click #organize_button" :"okClick",
      "click #cancel_button"   :"cancelClick",
      "click .masker"          :"masker", // 点击detail下的层，便隐藏
      "click .close_w"         :"cancelClick"
    },
    initialize:function(){
      this.bind("@ok", ok);
      this.bind("@closeView", close);
    },
    tagToggle:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    /*noteFocus:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultNote ? "" :
      $(e.currentTarget).val() );
    },
    noteBlur:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultNote :
      $(e.currentTarget).val() );
    },*/
    okClick:function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var data = loadData(this.$el);
      // clip在update时需要clip的id
      // data["id"] = this.model.id;
      if($(".error").length == 0){
	this.trigger("@ok", data, this.model.id);
      }else{
	$(e.currentTarget).attr("disabled",false);
      }
    },
    shortcut_ok : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#organize_button").click();
	return false;
      }else{
	return true;
      }
    },
    masker:function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancelClick(e);
      }
    },
    cancelClick:function(e){
      e.preventDefault();
      var n_data = loadData(this.$el);
      this.trigger("@closeView",n_data);
    }
  });

  function loadData(el){
    var _data = {};
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i, el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i, el).html()));
      }
    };
    var obj_tag = $("#obj_tag", el).val().split(",");
    _data.tag = _.compact(_.union(main_tag,obj_tag));

    /* 注释的note部分
    var text = ""; //过滤defaultNote默认值
    if($.trim($("#organize_text", el).val())!=defaultNote){
      text = $.trim($("#organize_text", el).val());
    }
    _data.note = [{text: text}];
    */
    if($("#memo_private", el).attr("checked")){
      _data["public"] = "false";
    }else{
      _data["public"] = "true";
    }
    return _data;
  };

  function getData(clip){
    var id = clip.id;
    var pub = clip["public"];
    var tags = clip.tag?clip.tag:[];
    var bubs = App.ClipApp.getDefaultBubbs();
    //var note = clip.note?clip.note:"";
    //var text = "";
    tags = _(tags).map(function(e){return e.toLocaleLowerCase();});
    /*
    if(!_.isEmpty(note)){
      var _ns = _(note).select(function(e){return e.text; });
      if(!_.isEmpty(_ns)){
	var ns = _(_ns).map(function(e){ return e.text; });
	_(ns).each(function(n){ text += n+" "; });
      }
    }
    */
    o_data = {tag:tags,"public":pub};
    var tag_main = _(_(bubs).map(function(e){
      return { tag:e, checked:(_.indexOf(tags,e) != -1) };
    })).value();
    var tag_obj = _.difference(tags, bubs);
    return {id:id,main_tag:tag_main,obj_tag:tag_obj,pub:pub};
  };

  // 触发更新clip中的注的事件
  var ok = function(data, cid){
    if(memoType == "update"){
      var model = new MemoModel(data);
      model.save({}, {
	type:'PUT',
	url: App.ClipApp.encodeURI(P+"/clip/"+cid),
	success: function(model, res){
	  ClipMemo.close();
	  App.vent.trigger("app.clipapp.clipmemo:success", model);
	},
	error:function(model,res){}
      });
    }else if(memoType == "add"){
      ClipMemo.close();
      App.vent.trigger("app.clipapp.clipadd:memo", data);
    }
  };

  var close = function(n_data){
    ClipMemo.close(n_data);
  };

  var ClipMemo = {};
  var memoType,defaultNote = _i18n('clipmemo.memo'),o_data;
  function showMemo(data){
    var memoModel = new MemoModel(data);//此model作显示用
    var memoView = new MemoView({model:memoModel});
    App.popRegion.show(memoView);
    $('#obj_tag').tagsInput({});
  }

  // 此处只有区分 update 和 add
  ClipMemo.show = function(args){
    memoType = _.isObject(args) ? "add" : "update";
    if(memoType == "update"){
      var cid = args;
      var detailModel = new App.Model.DetailModel({id:cid});
      detailModel.fetch({
	success:function(model,res){
	  var data = getData(model.toJSON());// 从detail中取得的model
	  //console.log(data);
	  showMemo(data);
	},
	error:function(model,res){}
      });
    }else if(memoType == "add"){
      var clip = args;
      var data = getData(clip);
      // var data = getData(model.get("clip"));//从clip add 中取得的model
      showMemo(data);
    }
  };

  ClipMemo.close=function(n_data){
    var flag = true;
    if(!n_data){
      App.popRegion.close();
    }else{
      if(o_data['public'] != 'false'){
	o_data['public'] = 'true';
      }
      //flag = flag && ($.trim(o_data.note)==$.trim(n_data.note[0].text));
      flag = flag && n_data.tag.length==o_data.tag.length && _.difference(n_data.tag,o_data.tag).length==0;
      flag = flag && n_data['public'] == o_data['public'];
      if(flag){
	App.popRegion.close();
      }else{
	App.ClipApp.showAlert("memo_save", null, function(){
	  App.popRegion.close();
	});
      }
    }
  };

  // TEST
  // App.bind("initialize:after", function(){ ClipMemo.show(); });
  return ClipMemo;
})(App,Backbone,jQuery);
App.ClipApp.Query = (function(App,Backbone,$){
  var Query = {};
  var flag = false;
  var QueryModel = App.Model.extend({});
  var QueryView = App.ItemView.extend({
    tagName: "div",
    template: "#queryclip-view-template",
    events:{
      "click .add": "addClip",
      "click .more": "showMore",
      "click li"   :"showHelp",
      "mouseout .more":"closeMysetup",
      "mouseover ul.options":"keepOpenMysetup",
      "mouseout ul.options":"closeMysetupMust",
      "click .search_btn" : "query",
      "click .text":"inputAction"
    },
    addClip: function(){
      App.ClipApp.showClipAdd();
    },
    showMore:function(){
      if(/language=en/.test(document.cookie)){
	$("ul.options").removeClass("zh");
	$("ul.options").addClass("en");
      }else{
	$("ul.options").removeClass("en");
	$("ul.options").addClass("zh");
      }
      $("ul.options").toggle();
    },
    showHelp:function(e){//重写url打开的方式
      e.preventDefault();
      var id = (e.currentTarget.id).split("_")[1];
      hist = Backbone.history.fragment;
      App.ClipApp.Help.show(id,hist);
      Backbone.history.navigate("help/"+id, false);
    },
    keepOpenMysetup: function(){
      flag = true;
      $("ul.options").show();
    },
    closeMysetup: function(){
      setTimeout(function(){
	if(!flag){
	  $("ul.options").css("display","none");
	}
      },200);
    },
    closeMysetupMust: function(){
      flag = false;
      $("ul.options").css("display","none");
    },
    query : function(){
      var word = this.$(".text").val();
      this.$(".text").val("");
      App.ClipApp.siteQuery(word, null);
    },
    inputAction: function(){
      $(".text").unbind("keydown");
      $('.text').keydown(function(e){
	if(e.keyCode==13){ // 响应回车事件
	  $('.search_btn').click();
	}
      });
    }
  });

  function show(){
    var queryModel = new QueryModel();
    var queryView = new QueryView({
      model: queryModel
    });
    App.searchRegion.show(queryView);
  };

  App.bind("initialize:after", function(){
    show();
  });

  return Query;

})(App,Backbone,jQuery);

// app.clipapp.face.js
App.ClipApp.Face = (function(App, Backbone, $){
  var Face = {};
  var user_id = null;
  var faceView = null;
  var P = App.ClipApp.Url.base;
  var UserModel = App.Model.extend({
    defaults:{
      name:"",
      id:"",
      following:"",
      follower:"",
      face:"",
      relation:[]
    },
    url:function(){
      return App.ClipApp.encodeURI(P+"/user/"+ this.id + "/info");
    }
  });

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "userface-view",
    template: "#userface-view-template",
    events: {
      "click #user_zhui": "followAction",
      "click #user_stop": "stopAction",
      "click .following": "following",
      "click .follower": "follower",
      "mouseenter .user_head": "mouseEnter",
      "mouseleave .user_head": "mouseLeave",
      "focus #input_keyword" : "cleanDefault",
      "blur #input_keyword"  : "blurAction",
      "click #input_keyword" : "inputAction",
      "click .search_btn"    : "queryUser"
    },
    initialize: function(e){
      this.model.bind("change", this.render, this);
      this.bind("@show", this.show);
      this.bind("@change", this.change);
    },
    change: function(follow){
      var relation = this.model.get("relation");
      var follower = this.model.get("follower");
      if(_.isEmpty(relation) && !_.isEmpty(follow)){ // follow 成功 表示非空
	this.model.set("relation", follow);
	this.model.set("follower", follower > 0 ? follower + 1 : 1);
      }else if(!_.isEmpty(relation) && _.isEmpty(follow)){
	this.model.set("relation", []);
	this.model.set("follower", follower > 0 ? follower - 1 : 0);
      }
    },
    show: function(follow){
      var relation = this.model.get("relation");
      if(_.isEmpty(relation) && !_.isEmpty(follow)){ // follow 成功 表示非空
	this.model.set("relation", follow);
      }else if(!_.isEmpty(relation) && _.isEmpty(follow)){
	this.model.set("relation", []);
      }
    },
    mouseEnter: function(e){
      $(e.currentTarget).children(".user_i").show();
    },
    mouseLeave: function(e){
      $(e.currentTarget).children(".user_i").hide();
    },
    followAction: function(){
      App.vent.trigger("app.clipapp.bubb:follow",this.model.id,'*');
    },
    stopAction: function(){
      App.vent.trigger("app.clipapp.bubb:unfollow",this.model.id,'*');
    },
    following: function(){
      App.ClipApp.showFollowing(user_id);
    },
    follower: function(){
      App.ClipApp.showFollower(user_id);
    },
    cleanDefault: function(e){
      var def = null;
      if(App.ClipApp.isSelf(user_id)){
	def = _i18n('userface.mysearch');
      }else{
	def = _i18n('userface.search');
      }
      $(e.currentTarget).val($.trim($(e.currentTarget).val()) == def ? "" :$(e.currentTarget).val() );
    },
    blurAction:function(e){
      var def = null;
      if(App.ClipApp.isSelf(user_id)){
	def = _i18n('userface.mysearch');
      }else{
	def = _i18n('userface.search');
      }
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? def : $(e.currentTarget).val() );
    },
    inputAction: function(e){
      var view = this;
      var id = e.currentTarget.id;
      $(".text").unbind("keydown");
      $(".text").keydown(function(e){
	if(e.keyCode==13){ // 响应回车事件
	  view.queryUser();
	}
      });
    },
    queryUser: function(){
      var word = $.trim(this.$("#input_keyword").val());
      var def = null;
      if(App.ClipApp.isSelf(user_id)) def = _i18n('userface.mysearch');
      else def = _i18n('userface.search');
      if(word == def) word = null;
      App.ClipApp.userQuery(user_id, word);
    }
  });

  var getUser=function(uid,callback){
    var url = "";
    if(uid == App.ClipApp.getMyUid()){
      // url中带上随机数 防止ie的缓存导致不能向服务器发出请求
      url = App.ClipApp.encodeURI(P + "/my/info");
    }else{
      url = App.ClipApp.encodeURI(P + "/user/"+ uid + "/info");
    }
    var user=new UserModel();
    user.fetch({url: url});
    user.onChange(function(user){
      callback(user);
    });
  };

  Face.show = function(uid){
    user_id = uid;
    if(uid){
      if(App.ClipApp.Me.me.id == uid){
	faceView = new FaceView({model: App.ClipApp.Me.me});
	App.faceRegion.show(faceView);
      }else{
	getUser(uid, function(user){
	  faceView = new FaceView({model: user});
	  App.faceRegion.show(faceView);
	});
      }
    }else{
      faceView = null;
      App.faceRegion.close();
    }
  };

  Face.getUserId = function(){
    return user_id;
  };

  function change(follow){
    if(faceView){
      faceView.trigger("@change", follow);
    }
  };

  function show(follow){
    if(faceView){
      faceView.trigger("@show", follow);
    }
  }

  App.vent.bind("app.clipapp.follow:success", function(follow){
    change(follow);
  });

  App.vent.bind("app.clipapp.unfollow:success", function(follow){
    change(follow);
  });

  App.vent.bind("app.clipapp.follow:get", function(follow){
    show(follow);
  });

  // 当me改变之后face的modle有change事件会自动render
  App.vent.bind("app.clipapp.face:changed", function(){
    if(/my/.test(window.location.hash)){
      App.ClipApp.Face.show(App.ClipApp.getMyUid("id"));
    }
  });

  return Face;
})(App, Backbone, jQuery);
//app.clipapp.followinglist.js
App.ClipApp.FollowingList=(function(App, Backbone, $){
  var collection = {};
  var page = App.ClipApp.Url.page;
  var start = 1, end = page;
  var base_url = "", url = "";
  var collection_length, new_page, loading = false;
  var FollowingModel=App.Model.extend({
      defaults:{
	user:[]
      }
  });
  var FollowingList=App.Collection.extend({
    model:FollowingModel
  });
  var FollowingView=App.ItemView.extend({
    tagName:"div",
    template:"#following-view-template",
    onRender:function(){//动态设置宽度
      var tags_num=this.model.get("tag").length;
      var widths = tags_num*58+"px";
      this.$(".items").css({width:widths});
    },
    events:{
      "mouseover .box"      :  "MouseOver"
    },
    MouseOver:function(e){
      var XPath = this.$(".box").offset().left;
      var MouseX = e.pageX;
      var left =MouseX-XPath;
      var tags_num=this.model.get("tag").length;
      var widths = tags_num*58;
      var position = "-"+(left/545)*(widths-545)+"px";
      this.$(".items").css({left:position});
    }

  });

  var FollowingListView=App.CompositeView.extend({
    tagName:"div",
    className:"following-item",
    template:"#following-top-view-template",
    itemView:FollowingView,
    events:{
      "click #following" : "followingOpen",
      "click #follower" : "followerOpen"
    },
    followingOpen:function(e){
      App.ClipApp.showFollowing(App.ClipApp.getFaceUid());
    },
    followerOpen:function(e){
      App.ClipApp.showFollower(App.ClipApp.getFaceUid());
    }
  });

  FollowingList.showUserFollowing=function(uid){
    var flag=false;
    collection=new FollowingList();
    start = 1;
    end = page;
    base_url = App.ClipApp.Url.base+"/user/"+uid+"/following";
    url=App.ClipApp.encodeURI(base_url+"/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(followinglist){
      if(!_.isEmpty(followinglist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length == page ? true :false;
      var followinglistView=new FollowingListView({
	collection:followinglist
      });
      $("#follow").show();
      $("#list").hide();
      App.followRegion.show(followinglistView);
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8"))
	  $(document.body).scrollTop(0);
      }
      //console.info(App.followRegion.currentView.$el[0].className);
      setTimeout(function(){//IE8兼容性问题marionate也作了更改
	if(flag) $(".empty_user").css("display","none");
      },0);
    });
  };

  FollowingList.close=function(){
    App.followRegion.close();
  };

  App.vent.bind("app.clipapp:nextpage", function(){
    if(loading)return;
    if(!App.followRegion.currentView)return;
    if(App.followRegion.currentView.$el[0].className=="following-item"&&new_page){
      loading = true;
      start += page;
      end += page;
      url = App.ClipApp.encodeURI(base_url + "/" + start + ".." + end);
      collection.fetch({
	url:url,
	add:true,
	error :function(){
	  new_page = false;
	  loading = false;
	},
	success :function(){
	  if(collection.length-collection_length >= page){
	    collection_length = collection.length;
	  }else{
	    new_page = false;
	  }
	  setTimeout(function(){
	    loading = false;
	  },500);
	}
      });
    }
  });

  return FollowingList;

})(App,Backbone,jQuery);
//app.clipapp.followerlist.js
App.ClipApp.FollowerList=(function(App, Backbone, $){
  var precliplength=0;
  var collection = {};
  var page = App.ClipApp.Url.page;
  var start = 1, end = page;
  var base_url = "", url = "";
  var collection_length, new_page, loading = false;
  var FollowerModel=App.Model.extend({
    defaults:{
      uid:"",
      user:{},
      tag:""
    }
  });
  var FollowerList=App.Collection.extend({
    model:FollowerModel
  });
  var FollowerView=App.ItemView.extend({
    tagName:"div",
    template:"#follower-view-template",
    onRender:function(){
      var user_num = this.model.get("user").length;
      var widths = user_num*58+"px";
      this.$(".items").css({width:widths});
    },
    events:{
      "mouseover .box"   :  "MouseOver"
    },
    MouseOver:function(e){
      var XPath = this.$(".box").offset().left;
      var MouseX = e.pageX;
      var left =MouseX-XPath;
      var user_num = this.model.get("user").length;
      var widths = user_num*53;
      var position = "-"+(left/545)*(widths-545)+"px";
      this.$(".items").css({left:position});
    }
  });
  var FollowerListView=App.CompositeView.extend({
    tagName:"div",
    className:"follow-item",
    template: "#follow-view-template",
    itemView:FollowerView,
    events : {
      "click #following" : "followingOpen",
      "click #follower" : "followerOpen"
    },
    followingOpen:function(evt){
      App.ClipApp.showFollowing(App.ClipApp.getFaceUid());
    },
    followerOpen:function(evt){
      App.ClipApp.showFollower(App.ClipApp.getFaceUid());
    }
  });

  FollowerList.showUserFollower=function(uid){
    var flag=false;
    collection=new FollowerList({id:uid});
    start = 1;
    end = page;
    base_url = App.ClipApp.Url.base +"/user/"+uid+"/follow";
    url=App.ClipApp.encodeURI(base_url+"/"+start+".."+end);
    collection.fetch({url:url});
    collection.onReset(function(followerlist){
      if(!_.isEmpty(followerlist.toJSON())) flag=true;
      collection_length = collection.length;
      new_page = collection.length == page ? true :false;
      var followerlistView = new FollowerListView({collection:followerlist});
      $("#follow").show();
      $("#list").hide();
      App.followRegion.show(followerlistView);
      if( $(window).scrollTop()>99){
	window.location.href="javascript:scroll(0,99)";
	if($('html').hasClass("lt-ie8")){
	  $(document.body).scrollTop(0);
	}
      }
      //console.info(App.followRegion.currentView.$el[0].className);
      setTimeout(function(){//IE8兼容性问题marionate也作了更改
   	if(flag) $(".empty_user").css("display","none");
      },0);
    });
  };

  FollowerList.close=function(){
    App.followRegion.close();
  };

  // 更新“谁追我”列表
  App.vent.bind("app.clipapp.unfollow:success", function(){ refresh(); });
  App.vent.bind("app.clipapp.follow:success", function(){ refresh(); });

  function refresh(){
    if(App.followRegion.currentView.className =='follow-item'){
      FollowerList.showUserFollower(App.ClipApp.getFaceUid());
    }
  };

  App.vent.bind("app.clipapp:nextpage", function(){
    if(loading)return;
    if(!App.followRegion.currentView)return;
    if(App.followRegion.currentView.$el[0].className=="follow-item"&&new_page){
      loading = true;
      start += page;
      end += page;
      url = App.ClipApp.encodeURI(base_url + "/" + start + ".." + end);
      collection.fetch({
	url:url,
	add:true,
	error :function(){
	  new_page = false;
	  loading = false;
	},
	success :function(){
	  if(collection.length-collection_length >= page){
	    collection_length = collection.length;
	  }else{
	    new_page = false;
	  }
	  setTimeout(function(){
	    loading = false;
	  },500);
	}
      });
    }
  });

  return FollowerList;
})(App,Backbone,jQuery);
App.ClipApp.FindPass=(function(App,Backbone,$){
  var FindPass = {};

  var FindPassModel = App.Model.extend({
    url: function(){
      return App.ClipApp.encodeURI(App.ClipApp.Url.base+"/password/find");
    },
    validate:function(attrs){
      var error = {};
      if(!attrs.address){
	error["address"] = "is_null";
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });
  var FindPassView=App.DialogView.extend({
    tagName:"div",
    className:"findpass-view",
    template:"#findpass-view-template",
    events:{
      "focus #address"  :"clearmsg",
      "keydown #address": "keydownAction",
      "click #submit"   :  "submit",
      "click #cancel"   :  "cancel",
      "click .masker"   :  "masker",
      "click .close_w"  :  "cancel"
    },
    initialize:function(){
      this.bind("@success", success);
      this.bind("@cancel", cancel);
    },
    clearmsg:function(e){
      this.cleanError(e);
    },
    keydownAction : function(e){
      $('#address').unbind("keydown");
      if(e.keyCode==13){
	$("#address").blur();
	$('#submit').click();
      }
    },
    submit:function(e){
      e.preventDefault();
      var that = this;
      var address = this.$("#address").val();
      this.model.save({address:address},{
	type:"POST",
	success:function(model,res){
	  that.trigger("@success",res.address);
	},
	error:function(model, res){
	  that.showError('findpass',res);
	}
      });
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.trigger("@cancel");
      }
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });

  FindPass.show=function(){
    var findPassModel=new FindPassModel();
    var findPassView=new FindPassView({model:findPassModel});
    App.popRegion.show(findPassView);
  };

  FindPass.close=function(){
    App.popRegion.close();
  };

  var success = function(address){
    Backbone.history.navigate("",true);
    FindPass.close();
    App.ClipApp.showConfirm("go_resetpass",address);
  };

  var cancel = function(){
    FindPass.close();
    Backbone.history.navigate("",true);
    App.ClipApp.showLogin();
  };

 //App.bind("initialize:after", function(){ FindPass.show(); });
  return FindPass;
})(App,Backbone,jQuery);
App.ClipApp.ResetPass=(function(App,Backbone,$){
  var ResetPass = {};
  var P = App.ClipApp.Url.base;

  var ResetPassModel = App.Model.extend({
    url:function(){
      return App.ClipApp.encodeURI(P+"/password/reset/"+this.get("link"));
    },
    validate:function(attrs){
      var error = {};
      if(!attrs.newpass){
	error["newpass"] = "is_null";
      }
      if(!attrs.confirm){
	error["conpass"] = "is_null";
      }
      if(attrs.newpass && attrs.confirm && attrs.newpass != attrs.confirm){
	error["confirm"] = "password_diff";
      }
      if(_.isEmpty(error)) return null;
      else return error;
    }
  });
  var ResetPassView=App.ItemView.extend({
    tagName:"div",
    className:"resetpass-view",
    template:"#resetpass-view-template",
    events:{
      "focus #newpass":"clearmsg",
      "focus #confirm":"clearmsg",
      "keydown #confirm": "keydownAction",
      "click #submit" :  "submit",
      "click #reset"  :  "reset",
      "click .close_w":  "cancel"
    },
    initialize: function(){
      this.bind("@success", success);
      this.bind("@cancel",cancel);
    },
    clearmsg:function(e){
      this.cleanError(e);
    },
    keydownAction : function(e){
      $('#confirm').unbind("keydown");
      if(e.keyCode==13){
	$("#confirm").blur();
	$('#submit').click();
      }
    },
    submit:function(e){
      e.preventDefault();
      that=this;
      var newpass = $("#newpass").val();
      var conpass = $("#confirm").val();
      this.model.save({newpass:newpass,confirm:conpass},{
	type:"PUT",
	success:function(model,res){
	  this.trigger("@success",res);
	},
	error:function(model,res){
	  if(res.link){
	    App.ClipApp.showConfirm(res,null,function(){
	      ResetPass.close();
	      Backbone.history.navigate("",true);
	    });
	  }else{
	    that.showError('resetpass',res);
	  }
	}
      });
    },
    reset:function(e){
      e.preventDefault();
      $("#newpass").val("");
      $("#confirm").val("");
    },
    cancel:function(e){
      e.preventDefault();
      this.trigger("@cancel");
    }
  });
  ResetPass.show=function(link){
    var resetPassModel=new ResetPassModel({link:link});
    var resetPassView=new ResetPassView({model:resetPassModel});
    App.popRegion.show(resetPassView);
  };
  ResetPass.close=function(){
    App.popRegion.close();
  };

  var success = function(res){
    ResetPass.close();
    App.ClipApp.showSuccess("resetpwd_success");
    App.vent.trigger("app.clipapp.login:gotToken",res);
  };

  var cancel = function(){
    ResetPass.close();
    Backbone.history.navigate("",true);
  };

   return ResetPass;
})(App,Backbone,jQuery);
App.ClipApp.Message = (function(App, Backbone, $){
  var Message = {};

  var MessageModel = App.Model.extend({
    defaults:{message:""}
  });

  var MessageView = App.DialogView.extend({
    tagName: "div",
    className: "message-view",
    template: "#message-view-template",
    events: {
      "click .masker":"Masker",
      "click #sure": "MessageSure"
    },
    initialize:function(){
      this.bind("@closeView", close);
    },
    Masker: function(e){
      e.preventDefault();
      if($(e.target).attr("class") == "masker"){
	this.MessageSure(e);
      }
    },
    MessageSure: function(){
      this.trigger("@closeView");
      App.vent.trigger("app.clipapp.message:sure");
    }
  });

  var SuccessView = App.ItemView.extend({
    tagName: "div",
    className: "success-view",
    template: "#success-view-template"
  });

  var WarningView = App.DialogView.extend({
    tagName: "div",
    className: "message-view",
    template: "#warning-view-template",
    events: {
      "click .masker":"Masker",
      "click #sure": "MessageSure",
      "click #cancel":"MessageClose"
    },
    initialize:function(){
      this.bind("@closeView", close);
    },
    MessageSure: function(e){
      e.preventDefault();
      this.trigger("@closeView");
      App.vent.trigger("app.clipapp.message:sure");
    },
    Masker: function(e){
      e.preventDefault();
      if($(e.target).attr("class") == "masker"){
	this.MessageClose(e);
      }
    },
    MessageClose: function(e){
      e.preventDefault();
      this.trigger("@closeView");
      App.vent.trigger("app.clipapp.message:cancel");
    }
  });

  function show(type, message){
    var messageModel = new MessageModel({message:message});
    if(type == "warning"){
      var view = new WarningView({model: messageModel});
    }else if(type == "confirm"){
      var view = new MessageView({model : messageModel});
    }else{
      var view = new SuccessView({model : messageModel});
      setTimeout(function(){
	close();
      },1000);
    }
    App.setpopRegion.show(view);
  };

  var close = function(){
    App.setpopRegion.close();
  };

  Message.success = function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('message.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('message'+'.'+k+'.'+key[k], value);
      }
    }
    show("success", message);
  };

  Message.confirm = function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('message.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('message'+'.'+k+'.'+key[k], value);
      }
    }
    show("confirm", message);
  };

  Message.alert = function(key, value){
    var message = null;
    if(typeof(key)=="string"){
      message = _i18n('warning.'+key, value);
    }else if(typeof(key)=="object"){
      for(var k in key){
	message = _i18n('warning'+'.'+k+'.'+key[k], value);
      }
    }
    show("warning", message);
  };

  return Message;
})(App, Backbone, jQuery);
App.ClipApp.TagList=(function(App,Backbone,$){

  var TagList = {};
  var P = App.ClipApp.Url.base;
  var TagListModel = App.Model.extend({
    url : function(){
      return  App.ClipApp.encodeURI(P+"/user/"+this.id+"/meta/0..19");
    },
    defaults : {
      taglist : []
    }
  });

  var TagListView=App.ItemView.extend({
    tagName:"div",
    className:"taglist-view",
    template:"#taglist-view-template",
    events:{
      "click .li-list"          :  "getTagAction",
      "mouseover .li-list"      :  "MouseOver",
      "mouseout  .li-list"      :  "MouseOut"
    },
    getTagAction:function(e){
      var id=e.target.id;
      var tag=document.getElementById(id).innerHTML;
      App.vent.trigger("app.clipapp.taglist:gettag",tag);
    },
    MouseOver:function(e){
      var div = $(".taglistDiv").children().children();
      _(div).each(function(e){
	$(e).css("background-color","");
      });
      $(e.currentTarget).css("background-color","#888");
    },
    MouseOut:function(e){
      $(e.currentTarget).css("background-color","");
    }
  });

  var bubs = App.ClipApp.getDefaultBubbs();
  var baseTag = getDefaultTags();

  function getDefaultTags(){
    var lang = App.versions.getLanguage(); // 用户语言设置
    if(lang == "en"){
      return ["music","novel","film","technology","handy"];
    }else{
      return ["音乐", "小说", "电影", "港台","牛叉", "技术", "好用"];
    }
  };

  function setbaseTag(tags){
    baseTag = _.difference(_.union(tags,baseTag), bubs);
  };

  function resetBase(){
    var my = App.ClipApp.getMyUid();
    if(my){
      var tagModel =  new TagListModel({id: my});
      tagModel.fetch();
      tagModel.onChange(function(model){
	baseTag = _.difference(_.union(model.get("tag"), baseTag), bubs);
      });
    }
  };

  App.vent.bind("app.tagsinput:taglist",function(str){
    TagList.tagListRegion = new App.Region({el:".taglistDiv"});
    var myTags = [];
    var tags = _.compact($("#obj_tag").val().split(","));
    var obj_tag = _.difference(baseTag, tags);
    if(str){
      var len = str.length;
      _(obj_tag).each(function(tag){
	if(tag.substring(0,len) == str){
	  myTags.push(tag);
	}
      });
    }else{
      myTags = obj_tag;
    }
    var model = new TagListModel({taglist:myTags});
    var view = new TagListView({model:model});
    TagList.tagListRegion.show(view);
  });

  App.vent.bind("app.clipapp.taglist:close",function(){
    if(TagList.tagListRegion){
      TagList.tagListRegion.close();
    }
  });

  App.vent.bind("app.clipapp.clipadd:success", function(addmodel){
    setbaseTag(addmodel.get("tag"));
  });

  App.vent.bind("app.clipapp.clipdelete:success", function(){
    resetBase();
  });

  App.vent.bind("app.clipapp.login:success", function(){
    resetBase();
  });

  App.vent.bind("app.clipapp.clipmemo:success", function(){
    resetBase();
  });

  App.vent.bind("app.clipapp.recliptag:success", function(tag){
    setbaseTag(args.tag);
  });

  App.vent.bind("app.clipapp.reclip:success", function(args){
    setbaseTag(args.tag);
  });

  App.bind("initialize:after", function(){
    resetBase();
  });

  return TagList;
})(App,Backbone,jQuery);