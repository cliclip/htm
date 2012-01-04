ClipDetailWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	this.widgetType = "ClipDetailWidget";
	var clipDetailWidget = this;
	var _view = Backbone.View.extend({
		el:$(_container),
		initialize:function(){

		},
		render:function(_model){
			var model;
			if(_model){
				model = _model.toJSON();
			}else{
				model = this.model.toJSON();
			}
			
			for(var i=0;i<model.content.length;i++){
				if(model.content[i].image && !isNaN(model.content[i].image))
					model.content[i].image = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name+"/image/"+model.content[i].image;
			}
			var template = _.template($("#detail_template").html(),model);
			this.el.append(template);
		},
		animateIn:function(){
			var view = this;
			var reasons = clipDetailWidget.parentApp.sortMetaWidget.view.reasonList.pluck("content");
			var purposes = clipDetailWidget.parentApp.sortMetaWidget.view.purposeList.pluck("content");
			this.tempScrollTop = $(document).scrollTop();
			$("#contentWrapper").animate({"width":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.render();
				view.el.children(".detail-container").animate({"width":view.el.width(),"opacity":1},"slow","swing",function(){
					$(document).scrollTop(0);
					view.detailCache = $(this).html();
					console.info(view.detailCache);
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
					
					$("#detailEdit").click(function(){
						location.href = location.href + "/edit";
						$("#detailDelete").css("display"," none");
						$("#manipulation").css("display","");
						editFlag = true;
						
						contentContainer.attr("contenteditable",true);
						contentContainer.children("p").attr("contenteditable",false);
						contentContainer.addClass("contentEdit");
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
						
						noteContainer.addClass("contentEdit");
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
						reasonContainer.addClass("contentEdit");
						var reasonText = reasonContainer.children(".reasonText");
						$("<span style='margin-top:2px;' class='tag_add'>+</span>").insertBefore(reasonText);
						$("<input style='margin-top: 2px; display: none;' type='text' size='4'>").insertBefore(reasonText);
						reasonText.addClass("tags");
						var reasonEnables = view.model.get("reason")||[];
						clipper_tag.show(reasonContainer.children(".tags")[0],reasonEnables,reasons);
						
						purposeContainer.addClass("contentEdit");
						var purposeEnables = view.model.get("purpose")||[];
						var purposeText = purposeContainer.children(".purposeText");
						$("<span style='margin-top:2px;' class='tag_add'>+</span>").insertBefore(purposeText);
						$("<input style='margin-top: 2px; display: none;' type='text' size='4'>").insertBefore(purposeText);
						purposeText.addClass("tags");
						clipper_tag.show(purposeContainer.children(".tags")[0],purposeEnables,purposes);
						
						notesWrapper.children(".detail-device").css("display","none");
						notesWrapper.children(".detail-city").css("display","none");
						notesWrapper.children(".detail-time").css("display","none");
						
					});
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
							url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name +"/clip/"+view.id,
							data:_data,
							successCallBack:function(response){
								if(response[0] == 0){
									view.el.children(".detail-container").remove();
									location.href = location.href.substring(0,location.href.length-5);
								}else{
									alert(response[0]);
								}
							},
							erroeCallBack:function(response){
								
							}
						});	
					})
					/*
					// edit clip detail content
					var contentContainer = $(this).find(".content-container");
					contentContainer.editFlag = false;
					contentContainer.bind("dblclick",function(evt){
						//var container = view.el.children(".detail-container").find(".content-container");
						contentContainer.editFlag = !contentContainer.editFlag;
						if(contentContainer.editFlag == true){
							contentContainer.addClass("contentEdit");
							contentContainer.attr("contenteditable",true);
							$("#insImg").css("display","");
							$("#exImg").bind("click",function(evt){
								var url = prompt("url","http://");
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
							
						}else{
							contentContainer.contents().filter(function(){
								return this.nodeType == 3;
							}).wrap("<p class='detail-text'></p>").end().filter('br').remove();
							var dirty = contentContainer.find('p img');
							if(dirty.length>0){
								$(dirty).unwrap();
							}
							var result = [];
							contentContainer.children().each(function(){
								var text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
								var src = this.src;
								if(text == "" && !src){
									$(this).remove();
								}
								if(text){//&& text.replace(/(^\s*)|(\s*$)/g,"") != ""){
									result.push({text:text});//.replace(/(^\s*)|(\s*$)/g,"") );
								}else if(src){
									var prefix = client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name + "/image/";
									if(src.indexOf(prefix) != -1){
										id = src.split(prefix);
										src = id[1];
									}
									result.push({image:src});
								}
							});
							console.info(result);
							RequestUtil.postFunc({
								url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name +"/clip/"+view.id,
								data:{content:result},
								successCallBack:function(response){
									if(response[0] == 0){
										contentContainer.removeClass("contentEdit");
										contentContainer.attr("contenteditable",false);
										$("#insImg").css("display","none");
										console.info(response);
									}else{
										alert(response[0]);
									}
								},
								erroeCallBack:function(response){
									
								}
							});	
							
						}
					});
					var noteContainer = $(this).find(".detail-note");
					noteContainer.editFlag = false;
					noteContainer.bind("dblclick",function(evt){
						//var container = view.el.children(".detail-container").find(".content-container");
						noteContainer.editFlag = !noteContainer.editFlag;
						var result = [];
						if(noteContainer.editFlag == true){
							noteContainer.addClass("contentEdit");
							var noteText = $(noteContainer.find(".note-text")[0]);
							
							var text = noteText.text().replace(/(^\s*)|(\s*$)/g,"");
							var h = noteContainer.height()*2;
							var w = noteContainer.width()-30;
							noteText.empty();
							
							var textarea = $(document.createElement("textarea"));
							textarea.val(text);
							textarea.width(w);
							textarea.height(h);
							noteContainer.append(textarea);
							textarea.focus();
							
						}else{
							var noteText = $(noteContainer.find(".note-text")[0]);
							var textarea= $(noteContainer.find("textarea")[0]);
							var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
							console.info(text);
							result.push({text:text});
							
							RequestUtil.postFunc({
							url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name +"/clip/"+view.id,
							data:{note:result},
							successCallBack:function(response){
								if(response[0] == 0){
									textarea.remove();
									noteText.text(text);
									noteContainer.removeClass("contentEdit");
								}else{
									console.info(response);
								}
							},
							errorCallBack:function(response){
								
							}
						});	
						}
					})
					
					var reasonContainer = $(this).find(".detail-reason");
					reasonContainer.editFlag = false;
					reasonContainer.bind("dblclick",function(evt){
						reasonContainer.editFlag = !reasonContainer.editFlag;
						if(reasonContainer.editFlag == true){
							reasonContainer.addClass("contentEdit");
							var reasonlist = reasonContainer.find(".reason-text");
							for(var i=0;i<reasonlist.length;i++){
								var reason = $(reasonlist[i]);
								reason.addClass("reason-edit");
								reason.attr("contenteditable",true);
							}
							var addReasonBtn = $("<span class='addReasonBtn'>&nbsp;+&nbsp;</span>");
							addReasonBtn.bind("click",function(){
								var span = $("<span class='reason-text reason-edit'>新标签&nbsp;&nbsp;</span>");
								span.attr("contenteditable",true);
								span.insertBefore($(this));
								span.focus();
							});
							reasonContainer.append(addReasonBtn);
						}else{
							var result = [];
							var reasons = reasonContainer.children(".reason-text");
							for(var i=0;i<reasons.length;i++){
								var text = reasons[i].innerHTML.replace(/(^\s*)|(\s*$)/g,"");
								result.push(text);
							}
							RequestUtil.postFunc({
								url:client.URL.HOST_URL + client.SYMBOL.SLASH + client.URL.BASE_URL + client.GLOBAL_CACHE["userInfo"].name +"/clip/"+view.id,
								data:{reason:result},
								successCallBack:function(response){
									if(response[0] == 0){
										reasonContainer.children(".addReasonBtn").remove();
										reasonContainer.children(".reason-text").removeClass("reason-edit").attr("contenteditable",false);
										reasonContainer.removeClass("contentEdit");
									}else{
										console.info(response);
									}
								},
								errorCallBack:function(response){
									
								}
							});
						}
					})
					reasonContainer.delegate(".reason-text","keyup",function(){
						if($(this).text() == ""){
							$(this).remove();
						}
					});
					*/
				})
				
			});
			/*
			this.el.children(".preview-item").animate({"height":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.render();
				var h = view.el.children(".detail-container")[0].scrollHeight;
				view.el.children(".detail-container").animate({"height":h,"opacity":1},"slow","swing",function(){
					var hh = $(this)[0].scrollHeight;
					if(h < hh);
						$(this).animate({height:hh},"slow","swing");
				});

			});
			*/
			/*
			this.el.children(".preview-item").slideUp("slow",function(){
				view.render();
				view.el.children(".detail-container").height(0);
				view.el.children(".detail-container").slideDown("slow",function(){
				
				});
			});
			*/
		},
		animateOut:function(){
			var view = this;
			this.el.children(".detail-container").animate({"width":0,"opacity":0},"slow","swing",function(){
			/*
				$(this).css("display","none");
				view.el.children(".detail-container").remove();
				view.el.children(".preview-item").css("display","");
				var h = view.el.children(".preview-item")[0].scrollHeight;
				view.el.children(".preview-item").animate({"opacity":1,"height":h},"slow","swing");
			*/
				$(this).css("display","none");
				view.el.children(".detail-container").remove();
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
ClipDetailWidget.prototype.initialize = function(){
	this.view.initialize();
}
ClipDetailWidget.prototype.terminalize = function(){
	this.view.el.empty();
	this.parentApp.removeChild(this);
	this.parentApp.clipDetailWidget = null;
}
ClipDetailWidget.prototype.render = function(options){
	this.view.render(options);
}
ClipDetailWidget.prototype.loadDetail = function(id,model){
	//this.view.el = $("#container_"+id);
	this.view.el = $("#page-home");
	this.view.id = id;
	this.view.model = model;
	this.view.animateIn();
}
ClipDetailWidget.prototype.cancelDetail = function(id){
	//this.view.el = $("#container_"+id);
	this.view.el = $("#page-home");
	this.view.animateOut();
}