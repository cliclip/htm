App.Editor = (function(App, Backbone, $){
  var Editor = {};
  var isIE = App.util.isIE();
  Editor.init = function(){
    var ifrm=document.getElementById("editor");
    ifrm.contentWindow.document.designMode = "On";
    ifrm.contentWindow.document.write("<body style=\"font-size:16px;color:#333;line-height: 1.7;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;min-height:20px\"></body>");
    ifrm.contentWindow.document.close();
    if(isIE){
      ifrm.contentWindow.document.documentElement.attachEvent("onpaste", function(e){
	return pasteClipboardData(ifrm.id,e);
      });
    }else{
      // 用于保证chrome可以正确执行inserthtml和paste事件 [焦点获取方面的问题]
      ifrm.contentWindow.focus();
      ifrm.contentWindow.document.execCommand('inserthtml', false, "<br/>");
      ifrm.contentWindow.document.addEventListener("paste", function(e){
	return pasteClipboardData(ifrm.id,e);
      },false);
    }
  };

  Editor.getContent = function(editorId){
    var objEditor = document.getElementById(editorId); // 取得编辑器对象
    var data = objEditor.contentWindow.document.body.innerHTML;
    return data; // App.Convert.toUbb(data); // 此处的内容会提交到api层去
  };

  // 与getContent对称 该js内部实现 [没有必要]
  Editor.setContent = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    if(isIE){ // 光标设置不管用
      setTimeout(function(){
	objEditor.contentWindow.focus();
	var range = objEditor.contentWindow.document.selection.createRange();
	range.pasteHTML(data);
	range.moveStart("character", -data.length);
	range.collapse(true); // 将插入点移动到当前范围的开始
	range.select(); // 将当前选中区置为当前对象
      },200);
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, data);
      var el = objEditor.contentWindow.document;
      var range = objEditor.contentWindow.getSelection().getRangeAt(0);
      var sel = objEditor.contentWindow.getSelection();
      range.setStart(el.body.childNodes[0], 0);
      range.collapse(true); // 将光标移动到editor的起始位置
      sel.removeAllRanges();
      sel.addRange(range);
      el.body.focus();
    };
  };

  Editor.focus = function(editroId){
    var ifrm=document.getElementById(editroId);
    ifrm.contentWindow.focus();
  };

  // data 可以是一个对象 没有必要设为数组
  Editor.insertImage = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    var img = "";
    if(data.url)
      img = "<img src="+data.url+ " style='max-width:630px;' />";
    if(isIE){ // TODO
      if(data.ieRange){
	data.ieRange.pasteHTML(img);
	data.ieRange.select();
	data.ieRange=false;//清空下range对象
      }else{
	objEditor.contentWindow.focus();
	var editor = objEditor.contentWindow.document.selection.createRange();
	editor.pasteHTML(img);
      }
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, img);
    }
  };

  var getSel = function (w){
    return w.getSelection ? w.getSelection() : w.document.selection;
  };

  var setRange = function (sel,r){
    sel.removeAllRanges();
    sel.addRange(r);
  };

  var block = function(e){
    e.preventDefault();
  };

  var pasteClipboardData = function(editorId,e){
    var w,or,divTemp,originText;
    var newData;
    var objEditor = document.getElementById(editorId);
    var edDoc=objEditor.contentWindow.document;
    if(isIE){
      var ifmTemp=document.getElementById("ifmTemp");
      if(!ifmTemp){
	ifmTemp=document.createElement("IFRAME");
	ifmTemp.id="ifmTemp";
	ifmTemp.style.width="1px";
	ifmTemp.style.height="1px";
	ifmTemp.style.position="absolute";
	ifmTemp.style.border="none";
	ifmTemp.style.left="-10000px";
	ifmTemp.src="iframeblankpage.html";
	document.body.appendChild(ifmTemp);
	ifmTemp.contentWindow.document.designMode = "On";
	ifmTemp.contentWindow.document.open();
	ifmTemp.contentWindow.document.write("<body></body>");
	ifmTemp.contentWindow.document.close();
      }else{
	ifmTemp.contentWindow.document.body.innerHTML="";
      }
      originText=objEditor.contentWindow.document.body.innerText;
      ifmTemp.contentWindow.focus();
      // 用剪贴板中的内容覆盖当前选取
      ifmTemp.contentWindow.document.execCommand("Paste",false,null);

      objEditor.contentWindow.focus();
      var orRange=objEditor.contentWindow.document.selection.createRange();
      newData=ifmTemp.contentWindow.document.body.innerHTML;
      //filter the pasted data
      newData =  App.Convert.filter(newData);
      // paste the data into the editor
      orRange.pasteHTML(newData);
      //block default paste
      if(e){ // 取消默认的粘贴事件
	e.returnValue = false;
	if(e.preventDefault)
	  e.preventDefault();
      }
      return false;
    }else{
      var scrollbody = $("#editor").get(0).contentWindow.document.body;
      var clientheight = scrollbody.clientHeight;
      enableKeyDown=false;
      //create the temporary html editor
      divTemp=edDoc.createElement("DIV");
      divTemp.id='htmleditor_tempdiv';
      divTemp.innerHTML='\uFEFF';
      divTemp.style.left="-10000px";	//hide the div
      divTemp.style.height="1px";
      divTemp.style.width="1px";
      divTemp.style.position="absolute";
      divTemp.style.overflow="hidden";
      edDoc.body.appendChild(divTemp);
      //disable keyup,keypress, mousedown and keydown
      objEditor.contentWindow.document.addEventListener("mousedown",block,false);
      objEditor.contentWindow.document.addEventListener("keydown",block,false);
      enableKeyDown=false;
      //get current selection;
      w=objEditor.contentWindow;
      or=getSel(w).getRangeAt(0);

      //move the cursor to into the div
      var docBody=divTemp.firstChild;
      rng = edDoc.createRange();
      rng.setStart(docBody, 0);
      rng.setEnd(docBody, 1);
      setRange(getSel(w),rng);
      originText=objEditor.contentWindow.document.body.textContent;
      // console.log(originText);
      if(originText==='\uFEFF'){
	originText="";
      }
      window.setTimeout(function(){
	//get and filter the data after onpaste is done
	if(divTemp.innerHTML==='\uFEFF'){
	  newData="";
	  edDoc.body.removeChild(divTemp);
	  return;
	}
	newData=divTemp.innerHTML;
	// Restore the old selection
	if (or){
	  setRange(getSel(w),or);
	}
	edDoc.body.removeChild(divTemp);
	newData =  App.Convert.filter(newData);
	// divTemp.innerHTML=newData;
	// paste the new data to the editor
	objEditor.contentWindow.document.execCommand('inserthtml',false,newData );
	// webkit为核心的浏览器
	if($('html').hasClass('websqldatabase')){
	  objEditor.contentWindow.document.execCommand('inserthtml',false,'<p>&nbsp;</p><span id="cke_paste_marker" data-cke-temp="1"></span>');
	  var marker = objEditor.contentWindow.document.getElementById('cke_paste_marker');
	  var top = $(marker).position().top;
	  $(marker).remove();
	  marker = null;
	  // console.log("top = " + top + "clientheight =" + clientheight);
	  $(scrollbody).scrollTop(top - clientheight);
	  // console.log("after set " + $(scrollbody).scrollTop());
	}
      },0);
      //enable keydown,keyup,keypress, mousedown;
      enableKeyDown=true;
      objEditor.contentWindow.document.removeEventListener("mousedown",block,false);
      objEditor.contentWindow.document.removeEventListener("keydown",block,false);
      return true;
    };
  };
  return Editor;
})(App, Backbone, jQuery);