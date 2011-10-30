PreviewList = Backbone.Collection.extend({
	model:ClipPreview,
	parse:function(response){
		if(response[0]==0){
			return response[1];
		}else if(response[0] == 1){
			//server response exception 
		}
	}
})