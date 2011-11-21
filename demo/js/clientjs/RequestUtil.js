/**
 * RequestUtil
 * This Class implements the util ajax request method
 */
RequestUtil = {};
RequestUtil.postFunc = function(options){
	var params ={
				url:options.url,
				type:"POST",
				contentType:" application/json",
				data:JSON.stringify(options.data),
				success:function(response){
					options.successCallBack(response);
				},
				error:function(response){
					options.errorCallBack(response);
				}
			}
			$.ajax(params);
};