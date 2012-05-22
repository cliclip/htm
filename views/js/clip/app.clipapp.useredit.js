App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var face_change_flag = false;
  var face_remote_flag = false;
  var EditModel = App.Model.extend({});

  var FaceModel = App.Model.extend({
    url:function(){
      var my = App.util.getMyUid();
      return P+"/user/"+my+"/face";
    }
  });
  var PassEditModel = App.Model.extend({
    url:function(){
      var my = App.util.getMyUid();
      return P+"/user/" + my + "/passwd";
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
    },
    defaults: {
      newpass : "请输入新密码", confirm : "确认密码"
    }
  });
  var NameModel = App.Model.extend({
    url:function(){
      var my = App.util.getMyUid();
      return  P + "/user/" + my + "/name";
    },
    validate:function(attrs){
      if(!attrs.name || attrs.name == ""){
	return {name: "is_null"};
      }else if(! (/^[a-zA-Z0-9.]{5,20}$/.test(attrs.name))){
	return {name: "invalidate"};
      }else{
	return null;
      }
    }
  });

  var EmailEditModel = App.Model.extend({
    url:function(){
      var my = App.util.getMyUid();
      if(this.get("address")){
	return P+"/user/"+ my +"/email/"+this.get("address");
      }
      return App.util.unique_url(P+"/user/"+ my +"/email");
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
      App.vent.trigger("app.clipapp.message:alert", "delemail", address);
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.useredit:@emaildel",address);
      });
    }
  });

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
      "blur #confirm" : "blurAction"
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
      view.setModel(passModel, data);
      if(passModel.isValid()){
	passModel.save({},{
	  type: 'PUT',
  	  success: function(model, res){
	    UserEdit.showPassEdit();
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

  UserEdit.showEmail = function(){
    var emailModel = new EmailEditModel();
    UserEdit.emailRegion = new App.Region({el:"#email"});
    emailModel.fetch();
    emailModel.onChange(function(emailModel){
      var emailView = new EmailView({model: emailModel});
      UserEdit.emailRegion.show(emailView);
    });
  };

  UserEdit.showPassEdit = function(){
    var passModel = new PassEditModel();
    var passView = new PassView({model: passModel});
    UserEdit.passeditRegion = new App.Region({el:".right_bar"});
    UserEdit.passeditRegion.show(passView);
  };

  UserEdit.showUserEdit = function(){
    var editModel = new EditModel();
    var editView = new EditView({model: editModel});
    App.mysetRegion.show(editView);
    UserEdit.showFace();
    UserEdit.showEmail();
    App.ClipApp.RuleEdit.show();
    UserEdit.showPassEdit();
  };


  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "faceEdit",
    template: "#faceEdit-view-template",
    events: {
      "click .edit_name" : "setName",
      "error": "showError",
      "focus #name": "cleanError",
      "click #confirm_face" : "submitFace"
    },
    setName: function(e){
      e.preventDefault();
      var view = this;
      var uid = this.model.id;
      if(!$(e.currentTarget).hasClass("set_ok")){$("#set-name").empty();}
      $(".edit_name").addClass("set_ok").val("确定");
      $(".set_ok").unbind("click");
      $("#name").show();
      $(".set_ok").click(function(){
	var nameModel = new NameModel();
	var data = view.getInput();
	view.setModel(nameModel, data);
	if(nameModel.isValid()){
	  nameModel.save({} ,{
	    type: 'PUT',
	    success:function(model,res){
	      App.vent.trigger("app.clipapp.message:confirm","rename_success");
	      App.vent.trigger("app.clipapp.useredit:@showface");
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
	  $('.edit_name').click();
	}
      });
    },
    submitFace:function(event){
      $("#confirm_face").hide();
      if(face_remote_flag){
	event.preventDefault();
	App.vent.trigger("app.clipapp.message:confirm","faceUp_success");
	face_remote_flag = false;
	face_change_flag = true;
      }
    }
  });

  UserEdit.showFace = function(flag){
    var face = App.util.getMyFace();
    var uid = App.util.getMyUid();
    var faceModel = new FaceModel(face);
    if(flag){
      faceModel.fetch({
	url:App.util.unique_url(P+"/my/info")
      });
      faceModel.onChange(function(faceModel){
	UserEdit.faceRegion = new App.Region({el:".left_bar"});
	var faceView = new FaceView({model: faceModel});
	UserEdit.faceRegion.show(faceView);
	faceLoad(face.face,uid);//修改头像
      });
    }else{
      UserEdit.faceRegion = new App.Region({el:".left_bar"});
      var faceView = new FaceView({model: faceModel});
      UserEdit.faceRegion.show(faceView);
      faceLoad(face.face,uid);//修改头像
    }
  };

  UserEdit.onUploadImgChange = function(sender){
    if( !sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      App.vent.trigger("app.clipapp.message:confirm","imageUp_fail");
      return false;
    }else{
      if(sender.files && sender.files[0]&&(navigator.userAgent.indexOf("Firefox")>0||(window.google && window.chrome))){
	$("#confirm_face").show();
	preview_face(sender);// ff chrome 之外其他浏览器预览头像
	//$("#myface").attr("src",img.src);
	return true;
      }else if(sender.value && window.navigator.userAgent.indexOf("MSIE")>=1){
	$("#confirm_face").show();
	sender.select();
	sender.blur();
	var src = document.selection.createRange().text;
	document.getElementById("head_img").innerHTML= "<div id='head'></div>";
	var obj = document.getElementById("head");
	var obj1 =  document.getElementById("preview_size_fake");
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
/*
  function saveFace(facemodel,params){
    facemodel.save(params,{
      url: P+"/user/"+ facemodel.id+"/face",
      type: "POST",
      success:function(model,res){
	App.vent.trigger("app.clipapp.message:confirm","faceUp_success");
	face_change_flag = true;
      },
      error:function(model,res){
	//console.info("error!!!!!!!!!!");
      }
    });
  };
*/
  function faceLoad(originalFace,uid){
    $("#post_frame_face").unbind("load");
    $("#post_frame_face").load(function(){ // 加载图片
      if(window.navigator.userAgent.indexOf("MSIE")>=1){
	var returnVal = this.contentWindow.document.documentElement.innerText;
      }else{
	var returnVal = this.contentDocument.documentElement.textContent;
      }
      if(returnVal != null && returnVal != ""){
	var returnObj = eval(returnVal);
	if(returnObj[0] == 0){
	  var currentFace = returnObj[1][0];
	  if(currentFace){
	    var facemodel = new FaceModel({face:currentFace});
	    facemodel.save({},{
	      success:function(model,res){
		if(face_remote_flag){
		  $("#myface").attr("src",App.util.face_url(returnObj[1][0]),240);
		  $("#confirm_face").show();
		}else{
		  App.vent.trigger("app.clipapp.message:confirm","faceUp_success");
		  face_change_flag = true;
		}
	      },
	      error:function(model,res){
		//console.info("error!!!!!!!!!!");
	      }
	    });
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
//ff chrome 之外的其他浏览器本地预览头像
  function preview_face(sender){
      var reader = new FileReader();
      reader.onload = function(evt){
	var img = new Image();
	img.src = evt.target.result;
	img.onload=function(){
	  if(img.complete ||img.readyState=="complete"||img.readyState=="loaded"){
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

  UserEdit.close = function(){
    if(face_change_flag){
      App.vent.trigger("app.clipapp.face:reset",App.util.getMyUid());
      face_change_flag = false;
    }
    App.mysetRegion.close();
  };

  App.vent.bind("app.clipapp.useredit:@close", function(){
    UserEdit.close();
  });

  App.vent.bind("app.clipapp.useredit:show", function(uid){
    UserEdit.showUserEdit (uid);
  });

  App.vent.bind("app.clipapp.useredit:@showface",function(){
    //设置用户名后需要重新显示faceview
    App.vent.trigger("app.clipapp.face:reset",App.util.getMyUid());
    UserEdit.showFace(true);
  });

  App.vent.bind("app.clipapp.useredit:@emaildel",function(address){
    var delModel = new EmailEditModel({id:1, address:address});
    delModel.destroy({ // destroy要求model必须要有id
      success: function(model, res){
	UserEdit.showEmail();
      },
      error: function(model, res){
	// console.info(res);
      }
    });
  });

  App.vent.bind("app.clipapp.useredit:rename", function(){
    $(".edit_name").click(); // 触发设置用户名的动作
    $(".set_username").focus(); // 先让输入框聚焦
  });

  App.bind("initialize:after", function(){
   //UserEdit.showUserEdit(App.util.getMyUid());
  });

  return UserEdit;

})(App, Backbone, jQuery);