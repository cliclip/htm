/**
 * ClipPreview
 * Class specified to implement the model bean of preview clip
 */
ClipPreview = Backbone.Model.extend({
		defaults:{
			id:"",
			name:"",
			content:{
				type:""
			},
			source:{
				type:""
			},
			preview:{
				image:"",
				text:"",
				note:"",
				hassoundnot:false
			},
			device:"",
			city:"",
			time:""
		},
		validate:function(){
			
		},
		initialize:function(){
			
		},
		parse : function(resp, xhr) {
			console.info(resp);
		  return resp;
		},
});