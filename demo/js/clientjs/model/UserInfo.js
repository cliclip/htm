/**
 * UserInfo
 * Class specified to implement the model bean of user info
 */
UserInfo = function(_url,options){
	this.url = _url;
	this.options = options;
	this.model = new Backbone.Model.extend({
		url:_url,
		defaults:{
			name:"",
			pass:"",
			token:""
		},
		validate:function(){
			
		},
		initialize:function(){
			this.bind("change name",function(){
				
			})
		}
		
	})
}