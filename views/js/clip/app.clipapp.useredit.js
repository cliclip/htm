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
	model.save({lang:lang},{
	  type:'PUT',
	  url : App.ClipApp.encodeURI(P+"/user/"+App.ClipApp.getMyUid()+"/lang"),
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
      var is_randName = (view.model.get("name")).match("@") ? true : false ;
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
	    //更新缓存window.cache内容
	    var uid = App.util.getMyUid();
	    // App.util.cacheSync("/info.json.js","name",res.name);
	    if(App.util.isLocal()){
	      window.cache["/" + uid +"/info.json.js" ].name = res.name;
	    }
	    view.model.set("name", res.name);
	    if(is_randName) App.ClipApp.showConfirm("remindModifyPass");
	    else  App.ClipApp.showSuccess("rename_success");
	    // App.vent.trigger("app.clipapp.face:changed");
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
    App.vent.unbind("app.clipapp:upload");
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
    if( !sender.value.match(/.jpeg|.jpg|.gif|.png|.bmp/i) ){
      App.ClipApp.showConfirm("imageUp_error");
      return false;
    }else{
      if(sender.files && sender.files[0]&&Modernizr.filereader){
	$("#confirm_face").show();
	preview_face(sender);// ff chrome
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
    App.vent.bind("app.clipapp:upload",function(returnVal){
      if(returnVal != null && returnVal != ""){
	var returnObj = eval(returnVal);
	if(returnObj[0] == 0){//上传成功
	  var currentFace = returnObj[1];
	  if(currentFace){
	    var uid = App.util.getMyUid();
	    // 更新缓存window.cache内容
	    // App.util.cacheSync("/info.json.js","face",currentFace);
	    if(App.util.isLocal()){
	      window.cache["/" + uid +"/info.json.js" ].face = currentFace;
	    }
	    if(face_remote_flag){ // 此标记的作用是什么
	      $("#myface").attr("src",App.util.face_url(returnObj[1]),240);
	      $("#confirm_face").show();
	    }else{
	      App.ClipApp.showSuccess("faceUp_success");
	      face_change_flag = true;
	    }
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