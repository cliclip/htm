RegisterWidget = function(contaier,options){
	this.container = container;
	this.options = options;
	this.view = new Backbone.View.extend({
		el:$(container),
		initialize:function(){
			this.render();
		},
		render:function(){
			var template = _.template($("#register_template").html(),{});
			this.el.html(template);
		},
		events:{
			"click input[type=button]":"registerAction",
			"change input[type=text]" :"userNameValidation",
			"keyup input[type=password]" : "passwordValidation",
		},
		registerAction:function(evt){
			
		},
		userNameValidation:function(evt){
		
		},
		passwordValiation:function(evt){
		
		}
	})
}
RegisterWidget.prototype.render = function(){
	this.view.render();
}