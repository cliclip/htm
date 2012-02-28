FriendInfo = Backbone.Model.extend({
  defaults:{
    name:"",
    image:"",
    uid:""
  },
  validate:function(){
  },
  initialize:function(){
  },
  parse : function(resp, xhr) {
    return resp;
  }
});
