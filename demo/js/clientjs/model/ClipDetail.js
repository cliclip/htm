﻿/**
 * ClipDetail
 * Class specified to implement the model bean of detail clip
 */
ClipDetail = Backbone.Model.extend({
		defaults:{
			id:"",
			name:"",
			content:[
				{text:""},//text:String
				{image:""}//image:imgid || url
			],
			note:[
				{text:""},//text:String
				{sound:""}//sound:sndid
			],
			reason:[],
			purpose:[],
			device:"",
			city:"",
			source:{
				type:"",//type : "browser" | "clipboard" | "photolib" | "camera"
				url:"", 
				rss:"", 
				title:"", 
				keyword:[], 
				tag:[]
			},
			time:"",
			ip:""
		/*
			user:"",
			content:{
				type:"",
				text:"",
				html:"",
				image:[]
			},
			note:{
				text:"",
				sound:[]
			},
			reason:[],
			purpose:[],
			
			source:{
				type:"",
				url:"",
				rss:"",
				title:"",
				keyword:"",
				tag:""
			},
			
			device:"",
			city:"",
			time:"",
			ip:""
		*/
		},
		validate:function(){
			
		},
		initialize:function(){
			
		},
		parse : function(resp, xhr) {
			if(resp[0] == 0){
				return resp[1];
			}else{
			
			}
		},
});