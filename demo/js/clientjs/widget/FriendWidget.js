FriendWidget = function(_container,options){
  this.container = _container;
  this.options = options;
  this.widgetType = "FriendWidget";
  var _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      this.iniFriendInfo();
    },
    render:function(info){
      var collection={};
      if(info){
	collection = info;
      }else{
	collection = this.friendinfo.toJSON();
      }
      var template = _.template($("#friendinfo_template").html(),{friendinfo:collection});
      this.el.append(template);
    },
    events:{
    },
    iniFriendInfo:function(){
      //数据库中没有相关数据 填充模拟数据：
      var view = this;
      var friendinfo = {image : "/img/a.jpg",
                        name : "test111",
		        uid : 1,
		        i : options.i};
      view.render(friendinfo);
      //为头像和用户名绑定事件
      $(".userhomepage"+friendinfo.i).bind("mousemove",function(){
	//alert("显示用户信息");
      });
    }
  });
  this.view = new _view();
};
FriendWidget.prototype.initialize = function(){
  if(!this.view)
    return;
  this.view.initialize();
};
FriendWidget.prototype.terminalize = function(){
  this.view.el.empty();
  this.parentApp.removeChild(this);
  this.parentApp.friendWidget = null;
};




