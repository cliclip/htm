EmailList = Backbone.Collection.extend({
  // 未使用该模版 需要的是字符串数组 经过此处则变成字符对象
  model:Backbone.Model.extend({
    defaults:{}
  }),
  parse:function(response){
    if(response[0]==0){
      return response[1];
    }else if(response[0] == 1){
      //server response exception
    }
  }
});