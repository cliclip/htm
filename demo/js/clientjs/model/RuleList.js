RuleList = Backbone.Model.extend({
  defaults:{
    title:"",
    to:[],
    cc:[]
  },
  validate:function(){
  },
  initialize:function(){
  },
  parse : function(resp, xhr) {
    console.info({RuleInfo_resp:resp,RuleInfo_xhr:xhr});
    return resp;
  }
});

