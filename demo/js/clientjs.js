//<![CDATA[ 
var scriptPath = null ;
var nodes = document.getElementsByTagName("script") ;
for(var i=0; i<nodes.length; i++)
{
  var node = nodes[i] ;
  if(node.src && node.src.indexOf("/clientjs.js")>=0)
  {
    scriptPath = node.src.substring(0, node.src.indexOf("/clientjs.js")+1) ;
    break;
  }
}
function _Loadscript(src)
{
  if(src.indexOf("http")<0)
    src = scriptPath + src ;
  var _script='<'+'script src="'+src+'"'+' type="text/javascript"><'+'/script>';
  document.write(_script);
}

function _loadClientScript()
{
  _Loadscript("namespace.js") ;
  _Loadscript("jslib/jquery-1.6.4.min.js") ;
  _Loadscript("plugin/jquery.corner.js") ;
  _Loadscript("jslib/tempo.min.js") ;
  _Loadscript("jslib/underscore-min.js") ;
  _Loadscript("jslib/backbone-min.js") ; 
  _Loadscript("clientjs/Constants.js") ;
  _Loadscript("clientjs/GlobalCache.js") ;
  _Loadscript("clientjs/Messages.js") ;
  _Loadscript("clientjs/EventHandler.js") ;
  _Loadscript("clientjs/model/UserInfo.js") ;
  _Loadscript("clientjs/GlobalApp.js") ;
  _Loadscript("clientjs/widget/RegisterWidget.js") ;
  _Loadscript("clientjs/widget/LoginWidget.js") ;
  _Loadscript("clientjs/widget/SearchWidget.js") ;
}
_loadClientScript();
 //]]>
