ClipDetailWidget = function (_container,_options){
  this.container = _container;
  this.options = _options;
  this.widgetType = "ClipDetailWidget";
  var clipDetailWidget = this;
  var _view = Backbone.View.extend({
    el:$(_container),
    events:{
      "click .manage":"Manage" // 对clip的操作管理 评 转 收 || 注 改 删
    },

    clip_template: _.template($("#detail_templatec").html()),
    user_template: _.template($("#detail_templatel").html()),
    mana_template: _.template($("#detail_templater").html()),
    initialize:function(){},
    render:function(_model){
      if(_model){
	model = _model.toJSON();
      }else{
	model = this.model.toJSON();
      }
      model.time = model.time.match(/\d{4}-\d{2}-\d{2}/);
      for(var i=0;i<model.content.length;i++){
	if(model.content[i].image && model.content[i].image.length == 32){
	  model.content[i].image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "user/"+model.user+"/image/"+model.content[i].image;
	}
      }
      var clip_html = this.clip_template(model);
      this.el.append(clip_html);
      this.options.model = model;
      this.options.id = this.id;
      // ** right
      if(model.user != 1){ // 确认clip是否为自己的
	var mana_html = this.mana_template({"manage":["收","转","评"]});
	this.el.append(mana_html);
      }else{
	var mana_html = this.mana_template({"manage":["注","改","删"]});
	this.el.append(mana_html);
      }
      // ** left
      var user_html = this.user_template({users:[]});
      this.el.append(user_html);
    },
    Manage:function(evt){
      var id = evt.target.id;
      var value = $("#"+id).val();
      switch(value){
	case '评': this.comment(); break;
	case '转': this.recomment(); break;
	case '收': this.reclip(); break;
	case '注': this.remake(); break;
	case '改': this.update(); break;
	case '删': this.remove(); break;
      }
    },
    comment:function(){ // 弹出评论窗口

    },
    recomment:function(){ // 弹出转播窗口

    },
    reclip:function(){ // 进行reclip的动作
      var data = {"olduid":"1","oldcid":"1:1","token":"2:551ccf95e69955875a77121236e59c7c"};
      var _clipid = "1:1";
      // 在用户登录之后就已经设置好了
      document.cookie = "token=2:551ccf95e69955875a77121236e59c7c";
      RequestUtil.postFunc({
	data: data,
	url: client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL +"clip/"+_clipid+"/reclip",
	successCallBack:function(response){
	  if(response[0] == 0){
	    var id = response[1];
	  }else{
	    // alert(response[0]);
	  }
	},
	erroeCallBack:function(response){}
      });
    },
    remarke:function(){ // 注明

    },
    update:function(){ //修改 [独立]
      // new 一个新的view
      // console.info(this.options.model);
      location.href = location.href + "/edit"; // 再次刷新会回到 超链接界面
      new ClipEditWidget($("#editContact"),this.options);
    },
    delete:function(){ // 删除

    }

  });
  this.view = new _view();
};
ClipDetailWidget.prototype.initialize = function(){
  this.view.initialize();
};
ClipDetailWidget.prototype.loadDetail = function(id, model){
  this.view.el = $("#detailContact");
  this.view.id = id;
  this.view.model = model;
  this.view.render();
};
ClipDetailWidget.prototype.terminalize = function(){
  this.view.el.empty();
}
