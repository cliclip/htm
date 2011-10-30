/**
 * UserInfo
 * Class specified to implement the model bean of user info
 */
UserInfo = function(_url,options){
	this.url = _url;
	this.options = options;
	var _model = Backbone.Model.extend({
		url:_url,
		defaults:{
			name:"",
			pass:""
		},
		validate:function(){
			
		},
		initialize:function(){
			this.bind("change name",function(){
				
			})
		},
		loginAction:function(params,options){
			//this.url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + "login";
			this.save(
			params,
			{
				success:function(model,response){
					if(response[0] == 0){
						client.GLOBAL_CACHE["userInfo"] = {
							name:params.name,
							pass:params.pass
						};
						client.GLOBAL_CACHE["token"] = response[1];
						document.cookie = "token="+client.GLOBAL_CACHE["token"];
						// refresh the user status 
						GlobalEvent.trigger(client.EVENTS.USER_REFRESH);
						
						if(options.viewCallBack){
							options.viewCallBack(0,client.MESSAGES["login_success"]);
						}
					}else{
						var mcode = response[1];
						if(options.viewCallBack){
							options.viewCallBack(1,client.MESSAGES[mcode] || mcode);
						}
					}
				},
				error:function(model,response){
					var mcode = response;
					if(options.viewCallBack){
						options.viewCallBack(1,client.MESSAGES[mcode] || mcode);
					}
				}
			});
		},
		registerAction:function(params,options){
			this.save(
			params,
			{
				success:function(model,response){
					if(response[0] == 0){
					/*
						client.GLOBAL_CACHE["userInfo"] = {
							name:params.name,
							pass:params.pass
						};
						client.GLOBAL_CACHE["token"] = response[1];
						// refresh the user status 
						GlobalEvent.trigger(client.EVENTS.USER_REFRESH);
					*/	
						if(options.viewCallBack){
							options.viewCallBack(0,client.MESSAGES["register_success"]);
						}
					}else{
						var mcode = response[1];
						if(options.viewCallBack){
							options.viewCallBack(1,client.MESSAGES[mcode]);
						}
					}
				},
				error:function(model,response){
					var mcode = response;
					if(options.viewCallBack){
						options.viewCallBack(1,client.MESSAGES[mcode] || mcode);
					}
				}
			});
		},
		updatePwdAction:function(params,options){
			
		}
		/*
		postFunc:function(){
			var params ={
				url:this.url,
				type:"POST",
				contentType:" application/json",
				//dataType:"json",
				//data:{"name":"TJ","pass":"foobar"},
				data:JSON.stringify(this.toJSON()),
				success:function(data){
					console.info("post method");
					console.info(data);
				},
				error:function(data){
					console.info("post error");
					console.info(data);
				}
			}
			console.info(params);
			$.ajax(params);
		}
		*/
		
	})
	this.model = new _model();
}
UserInfo.prototype.loginAction = function(params,options){
	this.model.loginAction(params,options);
};
UserInfo.prototype.registerAction = function(params,options){
	this.model.registerAction(params,options)
}