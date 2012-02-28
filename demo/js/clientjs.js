var scriptPath = null ;
var nodes = document.getElementsByTagName("script") ;
for(var i=0; i<nodes.length; i++){
  var node = nodes[i] ;
  if(node.src && node.src.indexOf("/clientjs.js")>=0){
    scriptPath = node.src.substring(0, node.src.indexOf("/clientjs.js")+1) ;
    break;
  }
}
function _Loadscript(src){
  if(src.indexOf("http")<0)
    src = scriptPath + src ;
  var _script='<'+'script src="'+src+'"'+' type="text/javascript"><'+'/script>';
  document.write(_script);
}

function _loadClientScript(){
  _Loadscript("jslib/jquery-1.6.4.min.js") ;
  _Loadscript("jslib/tempo.min.js") ;
  //_Loadscript("jslib/underscore-min.js") ;
  //_Loadscript("jslib/backbone-min.js") ;
  _Loadscript("jslib/underscore.js") ;
  _Loadscript("jslib/backbone.js") ;
  _Loadscript("plugin/jquery.corner.js") ;
  _Loadscript("plugin/jquery.mousewheel.min.js");

  _Loadscript("clientjs/namespace.js") ;
  _Loadscript("clientjs/Constants.js") ;
  _Loadscript("clientjs/events/GlobalEvent.js") ;
  _Loadscript("clientjs/Messages.js") ;
  _Loadscript("clientjs/RequestUtil.js") ;
  _Loadscript("clientjs/ToolUtil.js") ;
  _Loadscript("clientjs/EventHandler.js") ;
  _Loadscript("clientjs/clipper_tag.js");


  _Loadscript("clientjs/model/ClipInfo.js") ;
  _Loadscript("clientjs/model/UserInfo.js") ;
  _Loadscript("clientjs/model/MetaUnit.js") ;
  _Loadscript("clientjs/model/MetaList.js") ;
  _Loadscript("clientjs/model/ClipPreview.js") ;
  _Loadscript("clientjs/model/PreviewList.js") ;
  _Loadscript("clientjs/model/EmailList.js") ;
  _Loadscript("clientjs/model/ClipDetail.js") ;
  _Loadscript("clientjs/model/FriendInfo.js") ;

  _Loadscript("clientjs/GlobalRouter.js") ;
  _Loadscript("clientjs/GlobalApp.js") ;

  _Loadscript("clientjs/widget/PopUpWidget.js") ;
  _Loadscript("clientjs/widget/RegisterWidget.js") ;
  _Loadscript("clientjs/widget/LoginWidget.js") ;

  _Loadscript("clientjs/widget/CommentWidget.js") ;
  _Loadscript("clientjs/widget/DeleteWidget.js") ;
  _Loadscript("clientjs/widget/CollectWidget.js") ;
  _Loadscript("clientjs/widget/UserUnitWidget.js") ;
  _Loadscript("clientjs/widget/UserEmailWidget.js") ;
  _Loadscript("clientjs/widget/SearchWidget.js") ;
  _Loadscript("clientjs/widget/UpdatePwdWidget.js") ;
  _Loadscript("clientjs/widget/SortMetaWidget.js") ;
  _Loadscript("clientjs/widget/ClipWidget.js") ;
  _Loadscript("clientjs/widget/ClipDetailWidget.js") ;
  _Loadscript("clientjs/widget/ClipAddWidget.js") ;
  _Loadscript("clientjs/widget/FriendWidget.js") ;
  _Loadscript("clientjs/widget/RecomWidget.js") ;

  _Loadscript("clientjs/widget/RecommentWidget.js") ;
  _Loadscript("clientjs/widget/OrganizeWidget.js") ;

}
_loadClientScript();
 //]]>
