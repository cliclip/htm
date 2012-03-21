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
      face:""
    },
    url : function(){
      return P+"/my/info";
    }
  });

  var EditView = App.ItemView.extend({
    tagName: "div",
    className: "editUser",
    template: "#editUser-view-template",
    events: {
      "click #exImg":"extImg",
      "click #localImg":"localImg",
      "click #confirmImg":"confirmImg"
    },
    extImg:function(evt){
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      var img = $("<img class='detail-image' src= "+url+">");
      // contentContainer.append(img);
      $(".editContent-container").append(img);
    },
    localImg:function(){
      var user = this.model.get("id");
      var url =	P+"/user/" + user + "/image";
      console.log(url);
      var imgModel = new ImgModel();
      imgModel.set("actUrl",url);
      var localImgView = new LocalImgView({
	model: imgModel
      });
      UserEdit.LocalImgRegion = new App.RegionManager({el: "#faceUploadDiv"});
      if($("#faceUploadDiv").html() == ""){
	UserEdit.LocalImgRegion.show(localImgView);
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var editmodel = new EditModel();
	      editmodel.set({id:user});
	      UserEdit.saveFace(editmodel,{face:returnObj[1][0]});
	    }
	  }
	});
      }else{
	$("#imgUploadDiv").empty();
      }
    },
    confirmImg:function(){
      UserEdit.close();
    }
  });

  UserEdit.saveFace = function(editModel,params){
    editModel.save(params,{
      url: P+"/user/"+editModel.id+"/face",
      type: "POST"
    });
  },

  UserEdit.show = function(){
    var editModel = new EditModel();
    editModel.fetch();
    editModel.onChange(function(editModel){
      var editView = new EditView({model: editModel});
      App.popRegion.show(editView);
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