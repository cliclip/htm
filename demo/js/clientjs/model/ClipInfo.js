/**
 * ClipInfo
 * Class specified to implement the model bean of clip info
 */
ClipInfo = function(_url,options){
  this.url = _url;
  this.options = options;
  var _model = Backbone.Model.extend({
    url:_url,
    validate:function(){},
    initialize:function(){},
    commentAction:function(params,options){
      this.save(params,{
	success:function(model,response){
	  if(response[0] == 0){
	    if(options.viewCallBack){
	      options.viewCallBack(0,client.MESSAGES["comment_success"]);
	    }
	  }else{
	    var mcode = response[1];
	    console.log(mcode);
	    if(options.viewCallBack){
	      options.viewCallBack(1,client.MESSAGES.getErrorMessage(mcode));
	    }
	  }
	},
	error:function(model,response){
	  var mcode = response;
	  if(options.viewCallBack){
	    options.viewCallBack(1,client.MESSAGES.getErrorMessage(mcode));
	  }
	}
      });
    },

    deleteAction:function(options){
       this.destroy({
	success:function(model,response){
	  if(response[0] == 0){
	    if(options.viewCallBack){
	      options.viewCallBack(0,client.MESSAGES["comment_success"]);
	    }
	  }else{
	    var mcode = response[1];
	    console.log(mcode);
	    if(options.viewCallBack){
	      options.viewCallBack(1,client.MESSAGES.getErrorMessage(mcode));
	    }
	  }
	},
	error:function(model,response){
	  var mcode = response;
	  if(options.viewCallBack){
	    options.viewCallBack(1,client.MESSAGES.getErrorMessage(mcode));
	  }
	}
      });
    }

  });
  this.model = new _model();
};

ClipInfo.prototype.commentAction = function(params,options){
  this.model.commentAction(params,options);
};

ClipInfo.prototype.deleteAction = function(options){
  this.model.deleteAction(options);
};