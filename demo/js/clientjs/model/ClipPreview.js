/**
 * ClipPreview
 * Class specified to implement the model bean of preview clip
 */
ClipPreview = Backbone.Model.extend({
		defaults:{
			id:"",
			name:"",
			content:{
				text:"",//text:String
				image:"",//image:imgid || url
			},
			
			
			note:{
				text:"",//{text:string}
				sound:""//{sound:sndid}
			},
			device:"",
			city:"",
			source:{
				type:""//type : "browser" | "clipboard" | "photolib" | "camera"
			}
			/*
			content:{
				type:""
			},
			preview:{
				image:"",
				text:"",
				note:"",
				hassoundnot:false
			},
			*/
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