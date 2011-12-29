ClipDetailWidget = function(_container,options){
	this.container = _container;
	this.options = options;
	this.widgetType = "ClipDetailWidget";
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
			this.tempScrollTop = $(document).scrollTop();
			$("#contentWrapper").animate({"width":0,"opacity":0},"slow","swing",function(){
				$(this).css("display","none");
				view.render();
				view.el.children(".detail-container").animate({"width":view.el.width(),"opacity":1},"slow","swing",function(){
					$(document).scrollTop(0);
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
								
								/*
								window.callback = function(result){
									if(result[0] == 0){
										var imgid = result[1];
										var imgUrl = actionUrl + "/" +result[1];
										var img = $("<img class='detail-image' src= "+url+">");
										uploadTemplate.remove();
										contentContainer.append(img);
									}
								};*/
								
							});
							
						}else{
						/*
						  var data = contentContainer.html();
						  var result = [];
						  var imgSrc = /<img\s* (src=\"?)([\w\-:\/\.]+)?\"?\s*.*\/?>/;
						  var imgReg = /<img[^>]+\/>|<img[^>]+>/;
						  while(data.length){
							if(imgReg.test(data)){
							  var i = data.indexOf('<img');
							  if(i == 0){
								var match = data.match(imgSrc);
								result.push({image:match[2]});
								data = data.replace(imgReg,"");
							  }else{
								var text = data.substring(0,i);
								text = text.replace(/(^\s*)|(\s*$)/g,"");
								result.push({text:text});
								data = data.substring(i,data.length);
							  }
							}else{
							  result.push({text:data});
							  break;
							}
						  }
						*/
						/*
						contentContainer.children().each(function(){
							if($(this).attr("src")){
								console.info($(this)[0].src);
							}else if($(this).text()){
								console.info($(this).text().replace(/(^\s*)|(\s*$)/g,""));
							}
							console.info($(this));
						})
						*/
						/*
						console.info(contentContainer.contents().filter(function(){
							
							return this.nodeType == 3;
						}));
						contentContainer.contents().filter(function(){
							
							return this.nodeType == 3;
						}).wrap("<p class='detail-text'></p>").end().filter('br').remove().filter('div').remove();
						*/
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
						/*
						var result = [];
						var children = contentContainer.children();
						for(var i=0;i<children.length;i++){
							var p = $(children[i]).find("p");
							var img = $(children[i]).find("img");
							if(p){
								result.push($(p).text().replace(/(^\s*)|(\s*$)/g,""));
							}
							if(img){
								result.push(img.src);
							}
						}*/
						//console.info(result);
						
						/*
						var img = contentContainer.find("img");
						var p = contentContainer.find("p");
						for(var i=0;i<img.length;i++){
							console.info(img[i].src);
						}
						for(var i=0;i<p.length;i++){
							console.info($(p[i]).text());
						}
						
							console.info(contentContainer.find("img"));
							console.info(contentContainer.find("p"));
						*/
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
					/*
					var reasonContainer = $(this).find(".detail-reason");
					reasonContainer.editFlag = false;
					reasonContainer.bind("dblclick",function(evt){
						reasonContainer.editFlag = !noteContainer.editFlag;
						if(reasonContainer.editFlag == true){
							reasonContainer.addClass("contentEdit");
							var reasonlist = reasonContainer.find(".reason-text");
							for(var i=0;i<reasonlist.length;i++){
								var reason = $(reasonlist[i]);
								reason.addClass("reason-edit");
								reason.attr("contenteditable",true);
							}
							
							
							var addReasonBtn = $("<span class='addReasonBtn'>+</span>");
							addReasonBtn.bind("click",function(){
								var span = $("<span class='reason-text reason-edit'></span>");
								span.width(20);
								span.attr("contenteditable",true);
								span.insertBefore($(this));
							});
							reasonContainer.append(addReasonBtn);
							
							if(reasonlist.length>0){
								for(var i=0;i<reasonlist.length;i++){
									var editReason = $("<span class='reason-edit'>"+reasonlist[i].innerText+"</span>");
									reasonContainer.append(editReason);
								}
							}*/
							
						}else{
							
						}
					})
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