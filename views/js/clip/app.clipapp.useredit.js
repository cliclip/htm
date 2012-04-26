App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var face_flag = false;
  var EditModel = App.Model.extend({});
  var PassEditModel = App.Model.extend({
    url:function(){
      return P+"/user/"+this.id+"/passwd";
    },
    defaults: {
      newpass : "请输入新密码", confirm : "确认密码"
    }
  });
  var NameModel = App.Model.extend({
    defaults:{
      id:""
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

  var RuleEditModel = App.Model.extend({
    defaults:{
      title:"",
      to:[],
      cc:[]
    },
    url:function(){
      return P+"/user/"+this.id+"/rule";
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
      "click .set_username" : "setName"
  //    "click #confirm_face[type=submit]":"submit"
    },
    setName: function(e){
      if($("#set-name").html()=="您还没有用户名"){
	$("#set-name").empty();
	var username = '<input type="text" id="username"/>';
	$("#set-name").append(username);
	$('#username').unbind("keydown");
	$('#username').keydown(function(e){
	  if(e.keyCode==13){
	    var nameModel = new NameModel({id:App.util.getMyUid()});
	    UserEdit.saveName(nameModel,{name:$("#username").val()});
	  }
	});
      }
    }
/*
    submit:function(form){
      form.preventDefault();//此处阻止提交表单
      if(!flag){
	form.preventDefault();//此处阻止提交表单
	//alert("请选择上传照片");
      }
    }
*/
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
      var params = {id:this.model.id,address:e.currentTarget.id};
      App.vent.trigger("app.clipapp.message:alert", "删除绑定邮件!");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.useredit:@emaildel",params);
      });
    }
  });

  var RuleView = App.ItemView.extend({
    tagName: "div",
    className: "ruleEdit",
    template: "#ruleEdit-view-template",
    events: {
      "click #update_rule[type=submit]" : "ruleUpdate",
      "keydown #copy-to" : "setCC",
      "blur #copy-to" : "blurAction",
      "keydown #send" : "setTO",
      "blur #send" : "blurAction"

    },
    setCC:function(e){
      var key = e.keyCode;
      dealEmail(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    setTO:function(e){
      var key = e.keyCode;
      dealEmail(e);
      if(key==188||key==59||key==32) return false;
      else return true;
    },
    ruleUpdate: function(){
      var title = $("#title").val().trim();
      var cc =  _.compact($("#copy-to").val().trim().split(";"));
      var to =  _.compact($("#send").val().trim().split(";"));
      var enable = false;
      if($("#open_rule").attr("checked")){
	enable =true;
      }
      var params = {id:this.model.id,title:title,to:to,cc:cc,enable:enable};
      var message = mail_validate(params);
      if(!message){
	App.vent.trigger("app.clipapp.useredit:@ruleupdate",params);
      }else{
	App.ClipApp.EmailAdd.showActive(message+"    邮件不合法!");
      }
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      var str = $("#"+id).val().trim();
      if(str){
	var arr = [];
	_.each(str.split(";"),function(a){
	  arr.push(a.trim());
	});
	$("#"+id).val(_.compact(arr).join(";")+";");
      }
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
      "blur #new_pass" : "blurAction",
      "blur #con_pass" : "blurAction"
    },
    focusAction:function(e){
      var id = e.currentTarget.id;
      $("#"+id).hide();
      $("#"+id+"_pass").show();
      $("#"+id+"_pass").focus();
      $(".alert").hide();
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      if(id=="new_pass" && $("#"+id).val()==""){
	$("#"+id).hide();
	$("#new").show();
      }else if(id=="con_pass" && $("#"+id).val()==""){
	$("#"+id).hide();
	$("#con").show();
      }
    },
    passUpdate:function(){
      var newpass = $("#new_pass").val();
      var confirm = $("#con_pass").val();
      var params = {id:this.model.id,newpass:newpass,confirm:confirm};
      var error = pass_validate(newpass,confirm);
      if(!_.isEmpty(error)){
  	App.vent.trigger("app.clipapp.useredit:@showpass", this.model.id,this.model, App.util.getErrorMessage(error));
      }else{
	App.vent.trigger("app.clipapp.useredit:@passchange",params);
      }
    }
  });

  function dealEmail(e){
    var key = e.keyCode;
    var str = ($(e.currentTarget).val()).trim();
    //按键为 tab 空格 , ; 时处理输入框中的字符串
    if((key==9||key==32||key==188||key==59)){
      if(str){
	// 以;把字符串分为数组，取出没个email的前后空格。
	var arr = [];
	_.each(str.split(";"),function(a){
	  arr.push(a.trim());
	});
	//在取出无用数据后（空字符串等），再放回输入框
	$(e.currentTarget).val(_.compact(arr).join(";")+";");
      }

    }
  }

  function mail_validate(params){
    var email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
    var message = "";
    if(!message&&!_.isEmpty(params.to)){
      _(params.to).each(function(t){
	if(!message&&!email_pattern.test(t)){
	  message = t;
	}
      });
    }
    if(!message&&!_.isEmpty(params.cc)){
      _(params.cc).each(function(c){
	if(!message&&!email_pattern.test(c)){
	  message = c;
	}
      });
    }
    return message;
  }

  function pass_validate(newpass,confirm){
    var error = {};
    if(!newpass){
      error["pass"] = "is_null";
    }
    if(!confirm){
      error["confirm"] = "is_null";
    }
    if(newpass&&confirm&&newpass!=confirm){
      error["confirm"] = "password_diff";
    }
    return error;
  }

  UserEdit.showEmail = function(uid){
    var emailModel = new EmailEditModel({id:uid});
    UserEdit.emailRegion = new App.Region({
      el:"#email"
    });
    emailModel.fetch();
    emailModel.onChange(function(emailModel){
      var emailView = new EmailView({model: emailModel});
      UserEdit.emailRegion.show(emailView);
    });
  };

  UserEdit.showRule = function(uid,model,error){
    var ruleModel = new RuleEditModel({id:uid});
    if (model) ruleModel.set(model.toJSON());
    if (error) ruleModel.set("error", error);
    UserEdit.ruleRegion = new App.Region({
      el:"#rule"
    });
    ruleModel.fetch();
    ruleModel.onChange(function(ruleModel){
      var ruleView = new RuleView({model: ruleModel});
      UserEdit.ruleRegion.show(ruleView);
    });
  };

  UserEdit.showPassEdit = function(uid,model,error){
    var passModel = new PassEditModel({id:uid});
    if (model) passModel.set(model.toJSON());
    if (error) passModel.set("error", error);
    var passView = new PassView({model: passModel});
    UserEdit.passeditRegion = new App.Region({
      el:".right_bar"
    });
    UserEdit.passeditRegion.show(passView);
    if(error){
      if(error.pass){
	$("#pass").show();
      }
      if(error.confirm){
	$("#confirm").show();
      }
    }else{
      $(".alert").hide();
    }
  };

  UserEdit.showUserEdit = function(uid){
    var editModel = new EditModel({id:uid});
    var editView = new EditView({model: editModel});
    App.mysetRegion.show(editView);
    UserEdit.showFace(uid);
    UserEdit.showEmail(uid);
    UserEdit.showRule(uid);
    UserEdit.showPassEdit(uid);
  };

  UserEdit.showFace = function(uid){
    var faceModel = new App.Model.MyInfoModel({id:uid});
    UserEdit.faceRegion = new App.Region({
      el:".left_bar"
    });
    faceModel.fetch({
      success:function(){
	//console.info("originalFace:" + editModel.get("face"));
	var originalFace = faceModel.get("face");
	faceModel.onChange(function(faceModel){
	  var faceView = new FaceView({model: faceModel});
	  UserEdit.faceRegion.show(faceView);
	});
	faceLoad(originalFace,uid);//修改头像
      },
      error:function(){}
    });
  };

  UserEdit.onUploadImgChange = function(sender){
    // console.info("imagechange");
    if( !sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      App.vent.trigger("app.clipapp.message:alert","上传图片格式无效");
      return false;
    }else{
      if( sender.files &&sender.files[0] ){
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
	App.vent.trigger("app.clipapp.message:alert","头像上传成功");
	$("#confirm_face").hide();
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
	    if(originalFace && originalFace!=currentFace){
	      removeFace(facemodel,originalFace,function(){ //删除原始头像
		saveFace(facemodel,{face:currentFace}); //保存新上传的头像
	      });
	    }else {
	      saveFace(facemodel,{face:currentFace});
	    }
	  }
	}
      }
    });
  }

  UserEdit.saveName = function(nameModel,params){
    nameModel.save(params,{
      type: "PUT",
      success:function(model,res){
	App.vent.trigger("app.clipapp.message:alert","恭喜，命名成功!");
	App.vent.trigger("app.clipapp.useredit:@showface",App.util.getMyUid());
      },
      error:function(model,res){
	if(res.name== "invalidate"){
	  App.vent.trigger("app.clipapp.message:alert","名称不合法！");
	}else if(res.name == "is_null" ){
	  App.vent.trigger("app.clipapp.message:alert","用户名不能为空");
	}else if(res.name == "has_name"){
	  App.vent.trigger("app.clipapp.message:alert","用户名已存在");
	}
      }
    });
  };

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
  App.vent.bind("app.clipapp.useredit:@showrule",function(uid,model,error){
    UserEdit.showRule(uid,model,error);
  });
  App.vent.bind("app.clipapp.useredit:@showpass",function(uid,model,error){
    UserEdit.showPassEdit(uid,model,error);
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

  App.vent.bind("app.clipapp.useredit:@ruleupdate",function(params){
    var ruleModel = new RuleEditModel(params);
    ruleModel.save(params,{
      type: "POST",
      success: function(model, res){
	UserEdit.showRule(params.id);
	App.vent.trigger("app.clipapp.message:alert","更新邮件规则成功！");
      },
      error:function(model, res){
  	UserEdit.showRule(params.id,model, App.util.getErrorMessage(res));
      }
    });
  });

  App.vent.bind("app.clipapp.useredit:active", function(key){
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.Url.base+"/active/"+key,
      type: "POST",
      success:function(model,response){
	// 不只是弹出提示框这么简单
	App.vent.trigger("app.clipapp.message:alert", "邮件激活成功，您可以方便的是有该邮件地址进行数据的存储了");
      },
      error:function(model,error){

      }
    });
  });

  App.vent.bind("app.clipapp.useredit:@passchange",function(params){
    var passModel = new PassEditModel(params);
    passModel.save({},{
	type: "PUT",
  	success: function(model, res){
	  UserEdit.showPassEdit(params.id);
	  App.vent.trigger("app.clipapp.message:alert","修改密码成功！");
	  document.cookie = "token="+res.token;
  	},
  	error:function(model, res){
	  UserEdit.showPassEdit(params.id,model,App.util.getErrorMessage(res));
  	}
      });
  });

  App.bind("initialize:after", function(){
   //UserEdit.showUserEdit(App.util.getMyUid());
  });

  return UserEdit;

})(App, Backbone, jQuery);