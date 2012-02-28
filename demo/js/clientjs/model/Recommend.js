Recommend = Backbone.Model.extend({
  defaults:{
    uid:"",
    text:"",
    date:"",
    clip:ClipPreview
  },
  validate:function(){},
  initialize:function(){},
  parse : function(resp, xhr) {
    console.info(resp);
    return resp;
  }
});