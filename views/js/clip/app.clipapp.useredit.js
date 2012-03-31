App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var originalFace;
  var flag = false;

  var EditModel = App.Model.extend({});

  var FaceEditModel = App.Model.extend({
    defaults:{
      id:"",
      name:"",
      face:"",
      actUrl:""
    },
    url:function(){
      return P+"/my/info";
    }
  });
  var EmailEditModel = App.Model.extend({
    defaults:{
      email:[]
    },
    url:function(){
      return P+"/user/"+this.id+"/email";
    }
  });

  var RuleEditModel = App.Model.extend({
    defaults:{
      rule:[]
    },
    url:function(){
      return P+"/user/"+this.id+"/rule";
    }
  });

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editUser",
    template: "#editUser-view-template",
    events: {
    }
  });

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "faceEdit",
    template: "#faceEdit-view-template",
    events: {
      "click .resetUserName" : "setName",
      "click #popup_ContactClose":"editClose",
      "click #confirm[type=submit]":"submit"
    },
    setName: function(){
      console.info($("#set-name").html());
      if($("#set-name").html()==""){
	//$("#set-name").
	console.info("ssss");
      }
    },
    editClose:function(){
      FaceEdit.close();
    },
    submit:function(form){
      if(!flag){
	form.preventDefault();//此处阻止提交表单
	alert("上传有误");
      }
    }
  });

  var EmailView = App.ItemView.extend({
    tagName: "div",
    className: "emailEdit",
    template: "#emailEdit-view-template",
    events: {
      "click #add_email":"emailAdd",
      "click .email_cut":"emailCut"
    },
    emailAdd:function(e){
      App.vent.trigger("app.clipapp.emailadd:show",this.model.id);
    },
    emailCut:function(e){
      e.preventDefault();
      var id = e.currentTarget.id;
      var address = $("#"+id.split("_")[1]).text();
      App.vent.trigger("app.clipapp.useredit:emaildel",this.model,address,id);
    }
  });

  var RuleView = App.ItemView.extend({
    tagName: "div",
    className: "ruleEdit",
    template: "#ruleEdit-view-template",
    events: {
      "click #update_rule" : "ruleUpdate",
      "keydown #copy-to" : "setCC",
      "keydown #send" : "setTO"

    },
    setCC:function(e){
      var key = e.keyCode;
      var str = $("#copy-to").val();
      var last_str = str.charAt(str.length - 1);
      if(last_str!=";"&&last_str!=" "&&(key==9||key==32||key==59)){
	$("#copy-to").val(str+"; ");
	if(key==59||key==32) return false;
      }
    },
    setTO:function(e){
      var key = e.keyCode;
      var str = $("#send").val();
      var last_str = str.charAt(str.length - 1);
      var penultimate = str.charAt(str.length -2,1);
      if(last_str!=";"&&last_str!=" "&&(key==9||key==32||key==59)){
	$("#send").val(str+"; ");
	if(key==59||key==32) return false;
      }
    },
    ruleUpdate: function(){
      var title = $("#title").val();
      var cc =  _.compact($("#copy-to").val().split(";"));
      var to =  _.compact($("#send").val().split(";"));
      var enable = false;
      if($("#open_rule").attr("checked")){
	enable =true;
      }
      var params = {title:title,to:to,cc:cc,enable:enable};
      App.vent.trigger("app.clipapp.useredit:ruleupdate",this.model,params);
    }
  });


  UserEdit.showUserEdit = function(uid){
    var editModel = new EditModel({id:uid});
    var editView = new EditView({model: editModel});
    App.viewRegion.show(editView);
    UserEdit.showFace(uid);
    //UserEdit.showEmail(uid);
    //UserEdit.showRule(uid);
  };

  UserEdit.showFace = function(uid){
    var faceModel = new FaceEditModel({id:uid});
    UserEdit.faceRegion = new App.Region({
      el:".face"
    });
    faceModel.fetch({
      success:function(){
	//console.info("originalFace:" + editModel.get("face"));
	originalFace = faceModel.get("face");
	var user = faceModel.get("id");
	var url = P+"/user/" + user + "/image";
	faceModel.set("actUrl",url);
	faceModel.onChange(function(faceModel){
	  var faceView = new FaceView({model: faceModel});
	  UserEdit.faceRegion.show(faceView);
	});
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var currentFace = returnObj[1][0];
	      if(!flag){ //flag为true时图片改变并有效，为false时图片没改变或者无效
		FaceEdit.close();
	      }else{
		if(currentFace){
		  var facemodel = new FaceEditModel({id:user});
		  if(originalFace){
		    UserEdit.removeFace(facemodel,originalFace);
		  }
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

  UserEdit.showEmail = function(uid){
    var emailModel = new EmailEditModel({id:uid});
    UserEdit.emailRegion = new App.Region({
      el:".email"
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
      el:".rule"
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

  UserEdit.onUploadImgChange = function(sender){
    if( !sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      alert('图片格式无效！');
      return flag;
    }else{
      var objPreview = document.getElementById('myface' );
      if( sender.files &&sender.files[0] ){
	objPreview.src = window.URL.createObjectURL(sender.files[0]);
	flag =true;
	return flag;
      }
    }
  };

  UserEdit.saveFace = function(editModel,params){
    editModel.save(params,{
      url: P+"/user/"+ editModel.id+"/face",
      type: "POST",
      success:function(model,res){
	var uid = editModel.get("id");
	alert("上传成功!");
      },
      error:function(model,res){
	//console.info("error!!!!!!!!!!");
      }
    });
  };

  UserEdit.removeFace = function(editModel,face_id){
    editModel.destroy({
      url: P+"/user/"+ editModel.id+"/face/" +face_id,
      success:function(){
	//console.info("delete success!!!!!!!!!!");
      },
      error:function(){
	//console.info("delete error!!!!!!!!!!");
      }
    });
  };

/*
  UserEdit.close = function(){
    App.viewRegion.close();
  };
*/
  App.vent.bind("app.clipapp.useredit:showface",function(uid){
    UserEdit.showFace(uid);
  });
  App.vent.bind("app.clipapp.useredit:showrule",function(uid,model,error){
    UserEdit.showRule(uid,model,error);
  });

  App.vent.bind("app.clipapp.useredit:emaildel",function(emailModel,address,id){
    var url = P+"/user/"+emailModel.id+"/email/"+address;
    emailModel.destroy({
      url:url,
      success: function(model, res){
	$("."+id).remove();
	App.vent.trigger("app.clipapp.useredit:showemail",model.id);
      },
      error: function(model, res){
	App.vent.trigger("app.clipapp.useredit:showemail",model.id,model,res);
      }
    });
  });
  App.vent.bind("app.clipapp.useredit:ruleupdate",function(ruleModel,params){
    var url = P+"/user/"+ruleModel.id+"/rule";
    ruleModel.save(params,{
	url: url,
	type: "POST",
  	success: function(model, res){
  	  App.vent.trigger("app.clipapp.useredit:success", model.id);
	  alert("更新邮件规则成功！");
  	},
  	error:function(model, res){
  	  App.vent.trigger("app.clipapp.useredit:error", model, res);
  	}
      });
  });

  App.bind("initialize:after", function(){
    // UserEdit.show();
  });

  return UserEdit;

})(App, Backbone, jQuery);