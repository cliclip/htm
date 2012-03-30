App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var ImgModel = App.Model.extend({});
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
      // email:[]
    },
    url:function(){
      return P+"/user/"+this.id+"/email";
    }
  });

  var RuleEditModel = App.Model.extend({
    defaults:{
      rule:""
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
      "click #resetUserFace" : "ChangeFace"
    },
    ChangeFace: function(){
      App.vent.trigger("app.clipapp.editface:show");
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
      "keydown #copy-to" : "getCC"
    },
    getCC:function(e){
      var key = e.keyCode;
      console.log(key);
      if(key==9||key==188||key==32){
	$("#copy-to").val($("#copy-to").val()+";");
      }
    },
    ruleUpdate: function(){
      if($(".rule_text").attr("disabled")=="disabled"){
	$(".rule_text").attr("disabled",false);
      }else{
	$(".rule_text").attr("disabled","disabled");
	var title = $("#title").val();
	var cc = $("#copy-to").val();
	var to = $("#send").val();
	var params = {title:title,to:to,cc:cc};
      }
    }
  });

  UserEdit.onUploadImgChange = function(sender){
    if( !sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      alert('图片格式无效！');
      return flag;
    }else{
      var objPreview = document.getElementById('myface-image' );
      if( sender.files &&sender.files[0] ){
	objPreview.src = window.URL.createObjectURL(sender.files[0]);
	flag = true;
      }
    }
  };

  UserEdit.saveFace = function(editModel,params){
    editModel.save(params,{
      url: P+"/user/"+ editModel.id+"/face",
      type: "POST",
      success:function(model,res){
	var uid = editModel.get("id");
	App.vent.trigger("app.clipapp.face:show",uid);
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

  UserEdit.showUserEdit = function(uid){
    var editModel = new EditModel({id:uid});
    var editView = new EditView({model: editModel});
    App.viewRegion.show(editView);
    UserEdit.showFace(uid);
    UserEdit.showEmail(uid);
    UserEdit.showRule(uid);
  };

  UserEdit.showFace = function(uid){
    var faceModel = new FaceEditModel({id:uid});
    UserEdit.faceRegion = new App.Region({
      el:".face"
    });
    faceModel.fetch();
    faceModel.onChange(function(faceModel){
      var faceView = new FaceView({model: faceModel});
      UserEdit.faceRegion.show(faceView);
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

  UserEdit.showRule = function(uid){
    var ruleModel = new RuleEditModel({id:uid});
    UserEdit.ruleRegion = new App.Region({
      el:".rule"
    });
    ruleModel.fetch();
    ruleModel.onChange(function(ruleModel){
      var ruleView = new RuleView({model: ruleModel});
      UserEdit.ruleRegion.show(ruleView);
      	if(ruleModel.get("enable")){
	  $("#open_rule").attr("checked",true);
	}
    });
  };


  UserEdit.close = function(){
    App.viewRegion.close();
  };

  App.vent.bind("app.clipapp.useredit:showface",function(uid){
    UserEdit.showFace(uid);
  });
  App.vent.bind("app.clipapp.useredit:showemail",function(uid){
    UserEdit.showEmail(uid);
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
	App.vent.trigger("app.clipapp.useredit:showemail",model.id);
      }
    });
  });

  App.bind("initialize:after", function(){
    // UserEdit.show();
  });

  return UserEdit;

})(App, Backbone, jQuery);