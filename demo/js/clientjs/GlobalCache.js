/**
 * GlobalCache
 * This Class cache the global variables
 */
 GlobalCache = function(name,options){
   this.name = name;
   this.options = options;
   this.isLocal = false;
   if(window.localStorage){
     this.isLocal = true;
     var storage = localStorage.getItem(this.name);
     this.dataCache = (store && JSON.parse(storage)) || {};
   }else{
     this.dataCache = {};
   }
 }

 GlobalCache.prototype ={
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
 };