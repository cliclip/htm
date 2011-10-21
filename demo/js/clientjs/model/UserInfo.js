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
		
	})
	this.model = new _model();
}