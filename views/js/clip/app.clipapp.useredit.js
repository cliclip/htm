App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var face_flag = false;
  var EditModel = App.Model.extend({});
  var PassEditModel = App.Model.extend({
    url:function(){
      return P+"/user/"+this.id+"/passwd";
    },
    validate:function(attrs){
      var error = {};
      if(!attrs.newpass){
	error["pass"] = "is_null";
      }
      if(!attrs.confirm){
	error["confirm"] = "is_null";
      }
      if(attrs.newpass && attrs.confirm && attrs.newpass != attrs.confirm){
	error["confirm"] = "password_diff";
      }
      if(_.isEmpty(error)) return null;
      else return error;
    },
    defaults: {
      newpass : "请输入新密码", confirm : "确认密码"
    }
  });
  var NameModel = App.Model.extend({
    defaults:{
      id:""
    },
    validate:function(attrs){
      if(!attrs.name || attrs.name == ""){
	return {name: "is_null"};
      }else if(! (/^[a-zA-Z0-9.]{5,20}$/.test(attrs.name))){
	return {name: "invalidate"};
      }else{
	return null;
      }
    },
    url:function(){
     return  P + "/user/" + this.id + "/name";
    }
  });

  var EmailEditModel = App.Model.extend({
    url:function(){
      if(this.get("address")){
	return P+"/user/"+this.id+"/email/"+this.get("address");
      }else{
	return P+"/user/"+this.id+"/email";
      }
    }
  });

  var EditView = App.ItemView.extend({
    tagName: "section",
    className: "edit",
    template: "#editUser-view-template",
    events: {
      "click .close_w" : "cancel"
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.useredit:@close");
    }
  });

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "faceEdit",
    template: "#faceEdit-view-template",
    events: {
      "click .set_username" : "setName",
      "error": "showError",
      "focus #name": "cleanError",
      "click #confirm_face" : "submitFace"
    },
    setName: function(e){
      e.preventDefault();
      var view = this;
      var uid = this.model.id;
      if(!$(e.currentTarget).hasClass("set_ok")){$("#set-name").empty();}
      $(".set_username").addClass("set_ok").val("确定");
      $(".set_ok").unbind("click");
      $("#name").show();
      $(".set_ok").click(function(){
	var nameModel = new NameModel({id: uid});
	var data = {};
	_.each(this.$(":input").serializeArray(), function(obj){
	  data[obj.name] = obj.value;
	});
	nameModel.set(data, {
	  error: function(model, error){
	    view.showError(error);
	  }
	});
	if(nameModel.isValid()){
	  nameModel.save({} ,{
	    success:function(model,res){
	      App.vent.trigger("app.clipapp.message:confirm","rename_success");
	      App.vent.trigger("app.clipapp.useredit:@showface",uid);
	    },
	    error:function(model,res){
	      view.showError(res);
	    }
	  });
	};
      });
      $('#name').unbind("keydown");
      $('#name').keydown(function(e){
	if(e.keyCode==13){
	  $('.set_username').click();
	}
      });
    },
    submitFace:function(){
      $("#confirm_face").hide();
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
    emailAdd:function(e){
      App.vent.trigger("app.clipapp.emailadd:show",this.model.id);
    },
    emailCut:function(e){
      e.preventDefault();
      App.vent.unbind("app.clipapp.message:sure");// 解决请求多次的问题
      var address = e.currentTarget.id;
      var params = {id:this.model.id,address:address};
      App.vent.trigger("app.clipapp.message:alert", "delemail", address);
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.useredit:@emaildel",params);
      });
    }
  });

  var PassView = App.ItemView.extend({
    tagName: "div",
    className: "passEdit",
    template: "#passEdit-view-template",
    events: {
      "click #pass_confirm[type=submit]" : "passUpdate",
      "focus #con" : "focusAction",
      "focus #new" : "focusAction",
      "error": "showError", // 虽然是有这样绑定但是，不能直接调用trigger触发
      "focus #pass" : "cleanError",
      "focus #confirm": "cleanError",
      "blur #pass" : "blurAction",
      "blur #confirm" : "blurAction"
    },
    focusAction:function(e){
      var id = e.currentTarget.id;
      $(e.currentTarget).hide();
      if(id == "new")
	$(e.currentTarget).siblings("#pass").show().focus();
      if(id == "con")
	$(e.currentTarget).siblings("#confirm").show().focus();
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      if(id=="pass" && $("#"+id).val()==""){
	$("#"+id).hide();
	$("#new").show();
      }else if(id=="confirm" && $("#"+id).val()==""){
	$("#"+id).hide();
	$("#con").show();
      }
    },
    passUpdate:function(){
      var view = this;
      var uid = this.model.id;
      var data = {};
      _.each(this.$(":input").serializeArray(), function(obj){
	data[obj.name] = obj.value;
      });
      var passModel = new PassEditModel({id: uid});
      passModel.set(data,{
	error: function(model, error){
	  view.showError(error);
	}
      });
      if(passModel.isValid()){
	passModel.save({},{
  	  success: function(model, res){
	    UserEdit.showPassEdit(uid);
	    App.vent.trigger("app.clipapp.message:confirm", "passwd_success");
	    document.cookie = "token="+res.token;
  	  },
  	  error:function(model, res){
	    view.showError(res);
  	  }
	});
      }
    }
  });

  UserEdit.showEmail = function(uid){
    var emailModel = new EmailEditModel({id:uid});
    UserEdit.emailRegion = new App.Region({el:"#email"});
    emailModel.fetch();
    emailModel.onChange(function(emailModel){
      var emailView = new EmailView({model: emailModel});
      UserEdit.emailRegion.show(emailView);
    });
  };

  UserEdit.showPassEdit = function(uid){
    var passModel = new PassEditModel({id:uid});
    var passView = new PassView({model: passModel});
    UserEdit.passeditRegion = new App.Region({el:".right_bar"});
    UserEdit.passeditRegion.show(passView);
  };

  UserEdit.showUserEdit = function(uid){
    var editModel = new EditModel({id:uid});
    var editView = new EditView({model: editModel});
    App.mysetRegion.show(editView);
    UserEdit.showFace(uid);
    UserEdit.showEmail(uid);
    App.ClipApp.RuleEdit.show(uid);
    UserEdit.showPassEdit(uid);
  };

  UserEdit.showFace = function(uid){
    var faceModel = new App.Model.MyInfoModel({id:uid});
    UserEdit.faceRegion = new App.Region({el:".left_bar"});
    faceModel.fetch({
      success:function(){
	//console.info("originalFace:" + editModel.get("face"));
	var originalFace = faceModel.get("face");
	faceModel.onChange(function(faceModel){
	  var faceView = new FaceView({model: faceModel});
	  UserEdit.faceRegion.show(faceView);
	});
	//originalFace 在保存头像时删除不用再次请求，此参数现在没用了
	faceLoad(originalFace,uid);//修改头像
      },
      error:function(){}
    });
  };

  UserEdit.onUploadImgChange = function(sender){
    if( !sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      App.vent.trigger("app.clipapp.message:confirm","imageUp_fail");
      return false;
    }else{
      if( sender.files && sender.files[0] ){
	$("#confirm_face").show();
	var img = new Image();
	img.src = App.util.get_img_src(sender.files[0]);
	img.onload=function(){
	  if(img.complete){
	    $("#myface").attr("src",img.src);
	    var _height,_width,_top, _left;
	    //var preview = $("#myface");
	    if(img.width<img.height){
	      _width = 240;
	      _height = img.height*240/img.width;
	      _top ="-" + (_height-240)/2+"px";
	      _left = 0 + "px";
	    }else{
	      _height = 240;
	      _width =  img.width*240/img.height;
	      _left = "-" + (_width-240)/2+"px";
	      _top = 0 + "px";
	    }
	    $("#myface").css({"height":_height,"width":_width,"margin-top":_top,"margin-left":_left});
	  }
	};
	return true;
      }
      return false;
    }
  };

  function removeFace(facemodel,face_id,callback){
    facemodel.destroy({
      url: P+"/user/"+ facemodel.id+"/face/" +face_id,
      success:function(){
	callback(true);
	//console.info("delete success!!!!!!!!!!");
      },
      error:function(){
	callback(false);
	//console.info("delete error!!!!!!!!!!");
      }
    });
  };

  function saveFace(facemodel,params){
    facemodel.save(params,{
      url: P+"/user/"+ facemodel.id+"/face",
      type: "POST",
      success:function(model,res){
	App.vent.trigger("app.clipapp.message:confirm","faceUp_success");
	face_flag = true;
      },
      error:function(model,res){
	//console.info("error!!!!!!!!!!");
      }
    });
  };

  function faceLoad(originalFace,uid){
    $("#post_frame_face").unbind("load");
    $("#post_frame_face").load(function(){ // 加载图片
      var returnVal = this.contentDocument.documentElement.textContent;
      if(returnVal != null && returnVal != ""){
	var returnObj = eval(returnVal);
	if(returnObj[0] == 0){
	  var currentFace = returnObj[1][0];
	  if(currentFace){
	    var facemodel = new App.Model.MyInfoModel({id:uid});
	    saveFace(facemodel,{face:currentFace});
	    /*if(originalFace && originalFace!=currentFace){
	      removeFace(facemodel,originalFace,function(){ //删除原始头像
		saveFace(facemodel,{face:currentFace}); //保存新上传的头像
	      });
	    }else {
	      saveFace(facemodel,{face:currentFace});
	    }*/
	  }
	}
      }
    });
  }

  UserEdit.close = function(){
    if(face_flag){
      App.vent.trigger("app.clipapp.face:reset",App.util.getMyUid());
      face_flag = false;
    }
    App.mysetRegion.close();
  };

  App.vent.bind("app.clipapp.useredit:@close", function(){
    UserEdit.close();
  });

  App.vent.bind("app.clipapp.useredit:show", function(uid){
    UserEdit.showUserEdit (uid);
  });

  App.vent.bind("app.clipapp.useredit:@showface",function(uid){
    UserEdit.showFace(uid);
  });

  App.vent.bind("app.clipapp.useredit:@emaildel",function(params){
    var delModel = new EmailEditModel(params);
    delModel.destroy({
      success: function(model, res){
	UserEdit.showEmail(params.id);
      },
      error: function(model, res){
	console.info(res);
      }
    });
  });

  App.vent.bind("app.clipapp.useredit:rename", function(){
    $(".set_username").click(); // 触发设置用户名的动作
    $(".edit_name").focus(); // 先让输入框聚焦
  });

  App.bind("initialize:after", function(){
   //UserEdit.showUserEdit(App.util.getMyUid());
  });

  return UserEdit;

})(App, Backbone, jQuery);