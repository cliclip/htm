App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var ImgModel = App.Model.extend({});
  var originalFace;
  var LocalImgView = App.ItemView.extend({
    tagName: "form",
    className: "localImg-view",
    template: "#localImg-view-template"
  });

  var EditModel = App.Model.extend({
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

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editUser",
    template: "#editUser-view-template",
    events: {
      "click #popup_ContactClose":"editClose"
    },
    editClose:function(){
      UserEdit.close();
    }
  });

  UserEdit.onUploadImgChange = function(sender){
    if( !sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      alert('图片格式无效！');
      return false;
    }else{
      var objPreview = document.getElementById('myface-image' );
      if( sender.files &&sender.files[0] ){
	objPreview.src = window.URL.createObjectURL(sender.files[0]);
      }
      return true;
    }
  };

/*  UserEdit.image_change = function(){
    var sender = document.getElementById("formUpload");
    if (!sender.value.match(/.jpg|.gif|.png|.bmp/i)){
      alert('图片格式无效！');
      return false;
    }else{
      return true;
    }
  };*/

  UserEdit.saveFace = function(editModel,params){
    editModel.save(params,{
      url: P+"/user/"+ editModel.id+"/face",
      type: "POST",
      success:function(model,res){
	App.popRegion.close();
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

  UserEdit.show = function(){
    var editModel = new EditModel();
    editModel.fetch({
      success:function(){
	//console.info("originalFace:" + editModel.get("face"));
	originalFace = editModel.get("face");
	var user = editModel.get("id");
	var url = P+"/user/" + user + "/image";
	editModel.set("actUrl",url);
	editModel.onChange(function(editModel){
	  var editView = new EditView({model: editModel});
	  App.popRegion.show(editView);
	});
	UserEdit.LocalImgRegion = new App.Region({el:"#faceUploadDiv"});
	if($("#faceUploadDiv").html() == ""){
	  $("#post_frame").load(function(){ // 加载图片
	    var returnVal = this.contentDocument.documentElement.textContent;
	    if(returnVal != null && returnVal != ""){
	      var returnObj = eval(returnVal);
	      if(returnObj[0] == 0){
		var ids = returnObj[1][0].split(":");
		var url =  P + "/user/" + ids[0]+ "/image/" + ids[1];
		var img = $("<img class='face-image' src= "+url+" height='240' width='240'>");
		$("#userFace").empty();
		$("#userFace").append(img);
		var currentFace = returnObj[1][0];
		if(currentFace){
		  var editmodel = new EditModel({id:user});
		  if(originalFace){
		    UserEdit.removeFace(editmodel,originalFace);
		  }
		  UserEdit.saveFace(editmodel,{face:currentFace});
		}
	      }
	    }
	  });
	}
      },
      error:function(){}
    });
  };

  UserEdit.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.useredit:show",function(){
    UserEdit.show();
  });

  App.bind("initialize:after", function(){
    // UserEdit.show();
  });

  return UserEdit;

})(App, Backbone, jQuery);