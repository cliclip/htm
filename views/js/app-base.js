// app.js

App = new Backbone.Marionette.Application();

App.Model = Backbone.Model.extend({
  constructor:function(){
    var args = Array.prototype.slice.call(arguments);
    Backbone.Model.prototype.constructor.apply(this, args);
    this.onChangeCallbacks = new Backbone.Marionette.Callbacks();
    this.on("change", this.runOnChangeCallbacks, this);
  },
  onChange: function(callback){
    // console.info(callback);
    this.onChangeCallbacks.add(callback);
  },
  runOnChangeCallbacks: function(){
    this.onChangeCallbacks.run(this, this);
  },
  sync: function(method, model, options){
    var success = options.success;
    var error = options.error;
    options.success = function(resp, status, xhr){
      if(resp[0] == 0){
	// console.info("sync success:");console.dir(resp[1]);
	if(success) success.apply(model, [resp[1], status, xhr]);
      } else {
	//console.log("sync error:");console.dir(resp[1]);
	if(error) error.apply(model, [resp[1], status, xhr]);
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
	//console.log("collection.sync error:");console.dir(resp[1]);
	if(error) error.apply(model, [resp[1], status, xhr]);
      }
    };
    Backbone.sync.apply(Backbone, [method, model, options]);
  }
});

App.ItemView = Backbone.Marionette.ItemView.extend({
  showError:function(error){
    error = App.ClipApp.Message.getError(error);
    for(var key in error){
      this.$("#"+key).addClass("error");
      this.$("#"+key).after("<span class='error'>"+error[key]+"</span>");
      if(this.$("#"+key).attr("type") == "password")
	this.$("#"+key).val("");
    }
  },
  cleanError:function(e){
    var id = e.currentTarget.id;
    this.$("#"+id).siblings("span.error").remove();
    this.$("#"+id).removeClass("error");
  },
  getInput:function(){
    var data = {};
    _.each(this.$(":input").serializeArray(), function(obj){
      data[obj.name] = obj.value == "" ? undefined : obj.value;
    });
    return data;
  },
  setModel:function(model, data){
    var view = this;
    model.set(data, {
      error: function(model, error){
	view.showError(error);
      }
    });
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
  };
  function getRoutePath(routeParts){
    //console.info(routeParts);
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
  setpopRegion:"#setpop",
  searchRegion:".search"
});

App.bind("initialize:after", function(){
  if(Backbone.history){
    Backbone.history.start();
  }

  var fixed = function(paddingTop){
    $(".user_detail").addClass("fixed").css({"margin-top": "0px", "top": paddingTop});
   // $("#bubb").addClass("fixed").css({"margin-top": $(".user_detail").height()+"px", "top": paddingTop});
    //var y = $(".user_detail").height() ? $(".user_detail").height() + 5 :0;
    var y = $(".user_detail").height()+5;
    $("#bubb").addClass("fixed").css({"margin-top":y+"px", "top": paddingTop});
  };

  var remove_fixed = function(paddingTop){
    $(".user_detail").removeClass("fixed").css("margin-top", paddingTop);
    $("#bubb").removeClass("fixed").css("margin-top", 5+"px");
  };
  function Reload(flag){
    $("#list").masonry("reload");
    if(flag){
      setTimeout(function(){
	Reload();
      },1000);
    }
  }

  var time_gap = true;
  var paddingTop = 0 + "px";
  //Reload(true);
  remove_fixed(paddingTop);
  $(window).scroll(function() {
    remove_fixed(paddingTop);
    var st = $(window).scrollTop();
    //var mt = $(".clearfix").offset().top + $(".user_info").height()-$(".user_detail").height();
    //var gap = document.getElementById("user_info").style.paddingTop;
    //console.info(gap);
    var shifting =$(".user_head").height() ? $(".user_head").height()+ 15 : 0;
    var mt = $(".clearfix").offset().top + shifting;
    //console.info(shifting);
    //mt = $(".user_detail").height() ? $(".user_detail").offset().top:$(".clearfix").offset().top;
    if(st>0){
      $(".return_top").show();
    }else{
      $(".return_top").hide();
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

    if((st + wh - 500 > last_top || st + wh > lt)&& time_gap==true ){
      time_gap = false;
      //console.info("trigger nextpge");
      App.vent.trigger("app.clipapp:nextpage");
      setTimeout(function(){
	time_gap = true;
      },500);
    }

  });

});
