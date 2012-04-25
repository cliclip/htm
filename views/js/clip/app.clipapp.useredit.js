App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var face_flag = false;
  var EditModel = App.Model.extend({});
  var PassEditModel = App.Model.extend({
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
  var FaceEditModel = App.Model.extend({
    defaults:{
      id:"",
      name:"",
      face:""
    },
    url:function(){
      return P+"/my/info";
    }
  });
  var EmailEditModel = App.Model.extend({
    url:function(){
      return P+"/user/"+this.id+"/email";
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
      App.vent.trigger("app.clipapp.useredit:close");
      //UserEdit.close();
    }
  });

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "faceEdit",
    template: "#faceEdit-view-template",
    events: {
      "click .set_username" : "setName"
  //    "click #popup_ContactClose":"editClose"
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
    editClose:function(){
      FaceEdit.close();
    },
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
      var address = e.currentTarget.id;
      var that = this;
      App.vent.trigger("app.clipapp.message:alert", "删除绑定邮件!");
      App.vent.bind("app.clipapp.message:sure",function(){
	App.vent.trigger("app.clipapp.useredit:emaildel",that.model,address);
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
      var str = $("#copy-to").val();
      var last_str = str.charAt(str.length - 1);
      //当字符串最后一个字符不是;或者空格
      //并且按键为 tab 空格 , ; 时处理输入框中的字符串
      if(last_str!=";"&&last_str!=" "&&(key==9||key==32||key==188||key==59)){
	if(str){
	  // 以;把字符串分为数组，去点无用数据
	  var arr = _.compact($("#copy-to").val().split(";"));
	  // 去掉数组最后一项的的前后空格，保证邮件前后没空格
	  var str1=_.last(arr).replace(/(^\s*)|(\s*$)/g,"");
	  arr[arr.length-1] = str1;
	  //在最后放回输入框
	  $("#copy-to").val(arr.join(";")+";");
	}
	if(key==188||key==32||key==59) return false;
      }
      return true;
    },
    setTO:function(e){
      var key = e.keyCode;
      var str = $("#send").val();
      var last_str = str.charAt(str.length - 1);
      if(last_str!=";"&&last_str!=" "&&(key==9||key==32||key==59||key==188)){
	if(str){
	  var arr = _.compact($("#send").val().split(";"));
	  var str1=_.last(arr).replace(/(^\s*)|(\s*$)/g,"");
	  arr[arr.length-1] = str1;
	  $("#send").val(arr.join(";")+";");
	}
	if(key==188||key==59||key==32) return false;
      }
      return true;
    },
    ruleUpdate: function(){
      var email_pattern = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-\9]+\.[a-zA-Z]{2,3}$/;
      var title = "";
      if($("#title").val()){
	_.last($("#title").val()).replace(/(^\s*)|(\s*$)/g,"");
	title = $("#title").val();
      }
      var cc =  _.compact($("#copy-to").val().split(";"));
      var to =  _.compact($("#send").val().split(";"));
      //console.info(cc);
      var enable = false;
      var message = "";
      flag = true;
      if($("#open_rule").attr("checked")){
	enable =true;
      }
      var params = {title:title,to:to,cc:cc,enable:enable};
      if(!_.isEmpty(cc)){
	_(cc).each(function(c){
	  if(!email_pattern.test(c)){
	    flag = false;
	    message = c;
	  }else{
	    flag = true;
	  }
	});
      }
      if(flag&&!_.isEmpty(to)){
	_(to).each(function(t){
	  if(!email_pattern.test(t)){
	    message = t;
	    flag = false;
	  }else{
	    flag = true;
	  }
	});
      }
      if(flag){
	App.vent.trigger("app.clipapp.useredit:ruleupdate",this.model,params);
      }else{
	App.ClipApp.EmailAdd.showActive(message+"    邮件不合法!");
      }
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      var str = $("#"+id).val();
      if(str){
	var arr = $("#"+id).val().split(";");
	var str1=_.last(arr).replace(/(^\s*)|(\s*$)/g,"");
	arr[arr.length-1] = str1;
	arr = _.compact(arr);
	$("#"+id).val(arr.join(";")+";");
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
      $("#"+id).css("display","none");
      $("#"+id+"_pass").css("display","block");
      $("#"+id+"_pass").focus();
      $(".alert").css("display","none");
    },
    blurAction:function(e){
      var id = e.currentTarget.id;
      if(id=="new_pass" && $("#"+id).val()==""){
	$("#"+id).css("display","none");
	$("#new").css("display","block");
      }else if(id=="con_pass" && $("#"+id).val()==""){
	$("#"+id).css("display","none");
	$("#con").css("display","block");
      }
    },
    passUpdate:function(){
      var newpass = $("#new_pass").val();
      var confirm = $("#con_pass").val();
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
      if(!_.isEmpty(error)){
  	App.vent.trigger("app.clipapp.useredit:showpass", this.model.id,this.model, App.util.getErrorMessage(error));
      }else{
	var params = {newpass:newpass,confirm:confirm};
	App.vent.trigger("app.clipapp.useredit:passchange",this.model,params);
      }
    }
  });


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
      if(ruleModel.get("rule")&&ruleModel.get("rule").enable){
	$("#open_rule").attr("checked",true);
      }
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
	$("#pass").css("display","block");
      }
      if(error.confirm){
	$("#confirm").css("display","block");
      }
    }else{
      $(".alert").css("display","none");
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
    var faceModel = new FaceEditModel({id:uid});
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
	$("#post_frame_face").unbind("load");
	$("#post_frame_face").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var currentFace = returnObj[1][0];
	      if(currentFace){
		var facemodel = new FaceEditModel({id:faceModel.get("id")});
		if(originalFace && originalFace!=currentFace){
		  UserEdit.removeFace(facemodel,originalFace,function(){
		    UserEdit.saveFace(facemodel,{face:currentFace});
		  });
		}else {
		  UserEdit.saveFace(facemodel,{face:currentFace});
		}
	      }
	    }
	  }
	});
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
	    document.getElementById('myface').src = img.src;
	    var _height,_width,_top, _left;
	    var preview = document.getElementById('myface');
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

  UserEdit.removeFace = function(facemodel,face_id,callback){
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

  UserEdit.saveFace = function(facemodel,params){
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
  UserEdit.saveName = function(nameModel,params){
    nameModel.save(params,{
      type: "PUT",
      success:function(model,res){
	App.vent.trigger("app.clipapp.message:alert","恭喜，命名成功!");
	App.vent.trigger("app.clipapp.useredit:showface",App.util.getMyUid());
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

  App.vent.bind("app.clipapp.useredit:close", function(){
    UserEdit.close();
  });

  App.vent.bind("app.clipapp.useredit:show", function(uid){
    UserEdit.showUserEdit (uid);
  });

  App.vent.bind("app.clipapp.useredit:showface",function(uid){
    UserEdit.showFace(uid);
  });
  App.vent.bind("app.clipapp.useredit:showemail",function(uid){
  UserEdit.showEmail(uid);
  });
  App.vent.bind("app.clipapp.useredit:showrule",function(uid,model,error){
    UserEdit.showRule(uid,model,error);
  });
  App.vent.bind("app.clipapp.useredit:showpass",function(uid,model,error){
    UserEdit.showPassEdit(uid,model,error);
  });

  App.vent.bind("app.clipapp.useredit:emaildel",function(emailModel,address){
    var url = P+"/user/"+emailModel.id+"/email/"+address;
    emailModel.destroy({
      url:url,
      success: function(model, res){
	App.vent.trigger("app.clipapp.useredit:showemail",model.id);
      },
      error: function(model, res){
	App.vent.trigger("app.clipapp.useredit:showemail",model.id,model,App.util.getErrorMessage(res));
      }
    });
  });

  App.vent.bind("app.clipapp.useredit:ruleupdate",function(ruleModel,params){
    var url = P+"/user/"+ruleModel.id+"/rule";
    ruleModel.save(params,{
      url: url,
      type: "POST",
      success: function(model, res){
  	App.vent.trigger("app.clipapp.useredit:showrule", model.id);
	App.ClipApp.EmailAdd.showActive("更新邮件规则成功！");
      },
      error:function(model, res){
  	App.vent.trigger("app.clipapp.useredit:showrule", model.id,model, App.util.getErrorMessage(res));
      }
    });
  });

  App.vent.bind("app.clipapp.useredit:active", function(key){
    console.log("active :: key = "+key);
    var model = new App.Model();
    model.save({},{
      url: App.ClipApp.Url.base+"/active/"+key,
      type: "POST",
      success:function(model,response){
	console.log("success :: " + response);
      },
      error:function(model,error){
	console.log("success :: " + error);
      }
    });
  });

  App.vent.bind("app.clipapp.useredit:passchange",function(passModel,params){
    var url = P+"/user/"+passModel.id+"/passwd";
    passModel.save(params,{
	url: url,
	type: "PUT",
  	success: function(model, res){
  	  App.vent.trigger("app.clipapp.useredit:showpass", model.id);
	  App.ClipApp.EmailAdd.showActive("修改密码成功");
	  document.cookie = "token="+res;
  	},
  	error:function(model, res){
  	  App.vent.trigger("app.clipapp.useredit:showpass", model.id,model, res);
  	}
      });
  });

  App.bind("initialize:after", function(){
   //UserEdit.showUserEdit(App.util.getMyUid());
  });

  return UserEdit;

})(App, Backbone, jQuery);