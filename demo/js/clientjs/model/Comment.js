Comment = Backbone.Model.extend({
  defaults:{
    // id:"",
    // pid:"",
    // uid:"",
    // text:"",
    // layer:""
  },
  validate:function(){},
  initialize:function(){},
  setLayer:function(layer, res, children){
    for(var i=0; i<children.length; i++){
      e = children[i];
      e.layer = layer+1;
      var child = e.children;
      delete e.children;
      res.comment.push(e);
      if(child && child.length > 0){
	this.setLayer(layer+1, res, child);
      }
    }
  },
  parse : function(resp, xhr) { //be called in fetch or save.
    if(resp[0] == 0){
      //改变返回值的格式方便显示
      var comment = resp[1];
      var res ={comment:[]};
      for(var v in comment){
	if(comment[v].pid == 0)
	  comment[v].layer = 0;
	var child = comment[v].children;
	delete comment[v].children;
	res.comment.push(comment[v]);
	if(child && child.length > 0){
	  this.setLayer(0, res, child);
	}
      }
      return res;
    }else{
      return null;
    }
  }
});

/*
CommentList = new BackBone.Collection({
  model:Comment,
  parse:function(response){
    if(response[0]==0){
      return response[1];
    }else{
      //server response exception
      return null;
    }
  }
});
*/