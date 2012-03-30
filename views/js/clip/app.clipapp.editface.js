App.ClipApp.FaceEdit = (function(App, Backbone, $){
  var FaceEdit = {};
  var P = App.ClipApp.Url.base;
  var ImgModel = App.Model.extend({});
  var originalFace;
  var flag =false;

  var FaceModel = App.Model.extend({
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

  var FaceView = App.ItemView.extend({
    tagName: "div",
    className: "editFace",
    template: "#userInfo-view-template",
    events: {
      "click #popup_ContactClose":"editClose",
      "click #confirm[type=submit]":"submit"
    },
    editClose:function(){
      FaceEdit.close();
    },
    submit:function(form){
      if(!flag){
	form.preventDefault();//此处阻止提交表单
	FaceEdit.close();
      }
    }
  });

  FaceEdit.onUploadImgChange = function(sender){
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

  FaceEdit.saveFace = function(editModel,params){
    editModel.save(params,{
      url: P+"/user/"+ editModel.id+"/face",
      type: "POST",
      success:function(model,res){
	FaceEdit.close();
	var uid = editModel.get("id");
	App.vent.trigger("app.clipapp.useredit:showface",uid);
      },
      error:function(model,res){
	//console.info("error!!!!!!!!!!");
      }
    });
  };

  FaceEdit.removeFace = function(editModel,face_id){
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

  FaceEdit.show = function(){
    var editModel = new FaceModel();
    editModel.fetch({
      success:function(){
	//console.info("originalFace:" + editModel.get("face"));
	originalFace = editModel.get("face");
	var user = editModel.get("id");
	var url = P+"/user/" + user + "/image";
	editModel.set("actUrl",url);
	editModel.onChange(function(editModel){
	  var editView = new FaceView({model: editModel});
	  App.popRegion.show(editView);
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
		  var editmodel = new FaceModel({id:user});
		  if(originalFace){
		    FaceEdit.removeFace(editmodel,originalFace);
		  }
		  FaceEdit.saveFace(editmodel,{face:currentFace});
		}
	      }
	    }
	  }
	});
      },
      error:function(){}
    });
  };

  FaceEdit.close = function(){
    App.popRegion.close();
    flag = false;
  };

  App.vent.bind("app.clipapp.editface:show",function(){
    FaceEdit.show();
  });

  App.bind("initialize:after", function(){
    // UserEdit.show();
  });

  return FaceEdit;

})(App, Backbone, jQuery);