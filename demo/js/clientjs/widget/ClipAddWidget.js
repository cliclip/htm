ClipAddWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	this.widgetType = "ClipAddWidget";
	var clipAddWidget = this;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){

		},
		render:function(){
			var template = _.template($("#addClip_template").html());
			this.el.append(template);
		},
		animateIn:function(){
			var view = this;
			var reasons = clipAddWidget.parentApp.sortMetaWidget.view.reasonList.pluck("content");
			var purposes = clipAddWidget.parentApp.sortMetaWidget.view.purposeList.pluck("content");
			this.tempScrollTop = $(document).scrollTop();
			$("#contentWrapper").animate({"width":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.render();
				view.el.children(".addClip-container").animate({"width":view.el.width(),"opacity":1},"slow","swing",function(){
					$(document).scrollTop(0);
					view.detailCache = $(this).html();
					var contentContainer = $(this).children(".content-container");
					var notesWrapper= $(this).children(".notesWrapA");
					var noteContainer = notesWrapper.children(".detail-note");
					
					var reasonContainer = notesWrapper.children(".detail-reason");
					var purposeContainer = notesWrapper.children(".detail-purpose");
					var editFlag = false;
					
					$("#insText").bind("click",function(evt){
						var newText = $("<p class='detail-text'>新内容</p>");
						contentContainer.append(newText);
					});
					$("#exImg").bind("click",function(evt){
						var url = prompt("url","http://");
						if(url == "http://" || url == null)
							return;
						var img = $("<img class='detail-image' src= "+url+">");
						contentContainer.append(img);
					});
					$("#localImg").bind("click",function(evt){
						if($("#imgUploadDiv").html() == ""){
							var actionUrl = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/image";
							var uploadTemplate = _.template($("#imgUpload_template").html(),{actUrl:actionUrl});
							$("#imgUploadDiv").html(uploadTemplate);
							$("#post_frame").load(function(){
								var returnVal = this.contentDocument.documentElement.textContent;
								if(returnVal != null && returnVal != ""){
									var returnObj = eval(returnVal);
									if(returnObj[0] == 0){
										var imgids = returnObj[1];
										for(var i=0;i<imgids.length;i++){
											var url = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/image/" +imgids[i];
											var img = $("<img class='detail-image' src= "+url+">");
											contentContainer.append(img);
										}
									}
								}
							})
						}else{
							$("#imgUploadDiv").empty();
						}
					});

					contentContainer.attr("contenteditable",true);
					contentContainer.children("p").attr("contenteditable",false);
					//contentContainer.addClass("contentEdit");
					contentContainer.delegate("p","click",function(evt){
						var contentText = $(evt.target);
						contentText.attr("contenteditable",false);
						var text = contentText.text().replace(/(^\s*)|(\s*$)/g,"");
						var h = contentText.height()*1.1;
						var w = contentText.width();
						contentText.empty();
						
						var textarea = $(document.createElement("textarea"));
						textarea.val(text);
						textarea.width(w);
						textarea.height(h);
						contentText.append(textarea);
						textarea.focus();
						
						textarea.blur(function(evt){
							var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
							textarea.remove();
							contentText.text(text);
						}).click(function(evt){
							evt.stopPropagation();
							evt.preventDefault();
						})
					});
					
					//noteContainer.addClass("contentEdit");
					noteContainer.click(function(evt){
						var noteText = noteContainer.children("span");
						var text = noteText.text().replace(/(^\s*)|(\s*$)/g,"");
						var h = noteContainer.height()*2;
						var w = noteContainer.width()-70;
						noteText.empty();
						
						var textarea = $(document.createElement("textarea"));
						textarea.val(text);
						textarea.width(w);
						textarea.height(h);
						noteText.append(textarea);
						textarea.focus();
						
						textarea.blur(function(evt){
							var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
							textarea.remove();
							noteText.text(text);
						}).click(function(evt){
							evt.stopPropagation();
							evt.preventDefault();
						})
					})
					//reasonContainer.addClass("contentEdit");
					var reasonText = reasonContainer.children(".reasonText");
					$("<span style='margin-top:2px;' class='tag_add'>+</span>").insertBefore(reasonText);
					$("<input style='margin-top: 2px; display: none;' type='text' size='4'>").insertBefore(reasonText);
					reasonText.addClass("tags");
					var reasonEnables = [];
					clipper_tag.show(reasonContainer.children(".tags")[0],reasonEnables,reasons);
					
					//purposeContainer.addClass("contentEdit");
					var purposeEnables = [];
					var purposeText = purposeContainer.children(".purposeText");
					$("<span style='margin-top:2px;' class='tag_add'>+</span>").insertBefore(purposeText);
					$("<input style='margin-top: 2px; display: none;' type='text' size='4'>").insertBefore(purposeText);
					purposeText.addClass("tags");
					clipper_tag.show(purposeContainer.children(".tags")[0],purposeEnables,purposes);
						
						
					$("#detaiSave").click(function(evt){
						var _data = new Object();
						_data.content = [];
						_data.note = [];
						_data.reason = [];
						_data.purpose = [];
						contentContainer.children().each(function(){
							var _text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
							var src = this.src;
							if(_text == "" && !src){
								$(this).remove();
							}
							if(_text){//&& text.replace(/(^\s*)|(\s*$)/g,"") != ""){
								_data.content.push({text:_text});//.replace(/(^\s*)|(\s*$)/g,"") );
							}else if(src){
								var prefix = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/image/";
								if(src.indexOf(prefix) != -1){
									id = src.split(prefix);
									src = id[1];
								}
								_data.content.push({image:src});
							}
						});
						noteContainer.children("span").each(function(){
							var _text = $(this).text().replace(/(^\s*)|(\s*$)/g,"");
							_data.note.push({text:_text});
						});
						
						var _reasons = clipper_tag.get(reasonContainer.children(".tags")[0]);
						_data.reason = _reasons;
						
						var _purposes = clipper_tag.get(purposeContainer.children(".tags")[0]);
						_data.purpose = _purposes;
						
						console.info(_data);
						RequestUtil.postFunc({
							url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name +"/clip.json",
							data:_data,
							successCallBack:function(response){
								if(response[0] == 0){
									var id = response[1];
									view.el.children(".addClip-container").remove();
									location.href = "#/detail/"+id;
								}else{
									alert(response[0]);
								}
							},
							erroeCallBack:function(response){
								
							}
						});	
					});
					$("#detailAbandon").click(function(){
						view.animateOut();
					});
					
				})
				
			});
			
		},
		animateOut:function(){
			var view = this;
			this.el.children(".addClip-container").animate({"width":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.el.children(".addClip-container").remove();
				$("#contentWrapper").css("display","");
				$(document).scrollTop(view.tempScrollTop);
				$("#contentWrapper").animate({"opacity":1,"width":view.el.width()},"slow","swing",function(){
					
				});
			});
		},
		events:{
			
		}
	})
	this.view = new _view();
}
ClipAddWidget.prototype.initialize = function(){
	this.view.initialize();
}
ClipAddWidget.prototype.terminalize = function(){
	this.view.el.empty();
	this.parentApp.removeChild(this);
	this.parentApp.clipAddWidget = null;
}
ClipAddWidget.prototype.render = function(options){
	this.view.render(options);
}
ClipAddWidget.prototype.loadDetail = function(){
	//this.view.el = $("#container_"+id);
	this.view.el = $("#page-home");
	this.view.animateIn();
}
ClipAddWidget.prototype.cancelDetail = function(){
	this.view.el = $("#page-home");
	this.view.animateOut();
}