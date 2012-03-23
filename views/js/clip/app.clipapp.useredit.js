App.ClipApp.UserEdit = (function(App, Backbone, $){
  var UserEdit = {};
  var P = App.ClipApp.Url.base;
  var ImgModel = App.Model.extend({});
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
      //"click #localImg":"localImg",
      "click #confirm":"confirmAction",
      "click #popup_ContactClose":"editClose"
    },
    localImg:function(){
      console.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      UserEdit.LocalImgRegion = new App.RegionManager({el: "#faceUploadDiv"});
      if($("#faceUploadDiv").html() == ""){
	var user = this.model.get("id");
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  console.info(returnVal);
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var editmodel = new EditModel({id:1});
	      UserEdit.saveFace(editmodel,{face:returnObj[1][0]});
	    }
	  }
	});
      }
    },
    confirmAction:function(){
      var uid = this.model.get("id");
      App.vent.trigger("app.clipapp.face:show",uid);
      UserEdit.close();
    },
    editClose:function(){
      var uid = this.model.get("id");
      App.vent.trigger("app.clipapp.face:show",uid);
      UserEdit.close();
    }
  });

  UserEdit.image_change = function(that){
    // console.info("@@@@@@@@@!!!!!!!!!!!!!");
    that.form.submit();
  },

  UserEdit.saveFace = function(editModel,params){
    editModel.save(params,{
      url: P+"/user/"+ editModel.id+"/face",
      type: "POST",
      success:function(model,res){
	console.info("success!!!!!!!!!!");
      },
      error:function(model,res){
	console.info("error!!!!!!!!!!");
      }
    });
  },

  UserEdit.show = function(){
    var editModel = new EditModel();
    editModel.fetch({
      success:function(){
	var user = editModel.get("id");
	var url = P+"/user/" + user + "/image";
	editModel.set("actUrl",url);
	editModel.onChange(function(editModel){
	  var editView = new EditView({model: editModel});
	  App.popRegion.show(editView);
	});
	UserEdit.LocalImgRegion = new App.RegionManager({el:"#faceUploadDiv"});
	if($("#faceUploadDiv").html() == ""){
	  $("#post_frame").load(function(){ // 加载图片
	    var returnVal = this.contentDocument.documentElement.textContent;
	    if(returnVal != null && returnVal != ""){
	      var returnObj = eval(returnVal);
	      if(returnObj[0] == 0){
		var url = P+"/user/"+ user+"/image/" +returnObj[1][0];
		var img = $("<img class='face-image' src= "+url+" height='240' width='240'>");
		$("#userFace").empty();
		$("#userFace").append(img);
		var editmodel = new EditModel({id:user});
		UserEdit.saveFace(editmodel,{face:returnObj[1][0]});
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