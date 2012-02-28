/**
 * ClipDetail
 * Class specified to implement the model bean of detail clip
 */
ClipDetail = Backbone.Model.extend({
  defaults:{
    id:"",
    name:"",
    content:[
      {text:""},//text:String
      {image:""}//image:imgid || url
    ],
    note:[
      {text:""},//text:String
      {sound:""}//sound:sndid
    ],
    reason:[],
    purpose:[],
    device:"",
    city:"",
    source:{
      type:"",//type : "browser" | "clipboard" | "photolib" | "camera"
      url:"",
      rss:"",
      title:"",
      keyword:[],
      tag:[]
    },
    time:"",
    ip:""
    /*
     user:"",
     content:{
     type:"",
     text:"",
     html:"",
     image:[]
     },
     note:{
     text:"",
     sound:[]
     },
     reason:[],
     purpose:[],

     source:{
     type:"",
     url:"",
     rss:"",
     title:"",
     keyword:"",
     tag:""
     },

     device:"",
     city:"",
     time:"",
     ip:""
     */
  },
  validate:function(){},
  initialize:function(){},
  generatePastTime:function(model){
    var ftime = new Date(model.time);
    var ttime = new Date();
    model.pastTime = ToolUtil.subTimes(ftime,ttime) + "前";
  },
  transformHtmlToJson:function(data){
    this.content = this.content || [];
    var src = /<img\s* (src=\"?)([\w\-:\/\.]+)?\"?\s*.*\/?>/;
    var rg = /<img[^>]+\/>|<img[^>]+>/;
    while(data.length){
      if(rg.test(data)){
	var i = data.indexOf('<img');
	if(i == 0){
	  var match = data.match(src);
	  this.content.push({image:match[2]});
	  data = data.replace(rg,"");
	}else{
	  var text = data.substring(0,i);
	  text = text.replace(/(^\s*)|(\s*$)/g,"");
	  this.content.push({text:text});
	  data = data.substring(i,data.length);
	}
      }else{
	this.content.push({text:data});
	break;
      }
    }
    //return result;
  },
  parse : function(resp, xhr) {
    if(resp[0] == 0){
      this.generatePastTime(resp[1]);
      return resp[1];
    }else{

    }
  },
});