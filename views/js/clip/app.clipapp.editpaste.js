App.ClipApp.Editor = (function(App, Backbone, $){
  var Editor = {};
  var isIE = (navigator.appName.indexOf("Microsoft")!=-1)?true:false;
  Editor.init = function(){
    var ifrm=document.getElementById("editor");
    ifrm.contentWindow.document.designMode = "On";
    ifrm.contentWindow.document.write("<body style=\"font-size:70%;font-family:Verdana,Arial,sans-serif;margin:0;min-height:20px\"></body>");
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
    // i 是顺序号，从0开始；n 是img元素
/*  console.info(img_list);
    $(objEditor.contentWindow.document.body)
    .find("img.new").each(function(i,n){
      console.info(n);
      var at = $(n).attr("id");
      $(n).attr("src",img_list[at]);
    });
*/
    if(isIE){
      var data = objEditor.contentWindow.document.body.innerHTML;
    }else{
      var data = objEditor.contentWindow.document.body.innerHTML;;
    }
    return App.ClipApp.Filter.htmlToUbb(data);
  };
  // 与getContent对称 该js内部实现 [没有必要]
  Editor.setContent = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    if(isIE){
      objEditor.contentWindow.focus();
      var editor = objEditor.contentWindow.document.selection.createRange();
      editor.pasteHTML(data);
      //objEditor.contentWindow.document.execCommand('Paste', false, data);
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, data);
    }
  };

  // data 可以是一个对象 没有必要设为数组
  Editor.insertImage = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    var img = "";
    if(data.url)
      //img = "<img id="+data.id +" class='new' "+" src="+data.url+" style='max-width:475px;max-height:490px;' />";
      img = "<img src="+data.url+" style='max-width:475px;max-height:490px;' />";
    if(isIE){ // TODO
      objEditor.contentWindow.focus();
      var editor = objEditor.contentWindow.document.selection.createRange();
      editor.pasteHTML(img);
      //objEditor.contentWindow.document.execCommand("Paste", false, img);
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, img);
    }
  };

  var getSel = function (w){
    return w.getSelection ? w.getSelection() : w.document.selection;
  };

  var ensureUnits = function(v) {
    return v + ((v !== "0") && (/\d$/.test(v)))? "px" : "";
  };

  var setRange = function (sel,r){
    sel.removeAllRanges();
    sel.addRange(r);
  };


  var filterPasteWord = function(str){
    //remove link break
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove &nbsp; entities at the start of contents
    str = str.replace(/^\s*(&nbsp;)+/ig,"");
    //remove &nbsp; entities at the end of contents
    str = str.replace(/(&nbsp;|<br[^>]*>)+\s*$/ig,"");
    // Remove comments
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    // str = str.replace(/<!--.*-->/gi,""); // 上面的方法更合适
    // Remove scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
    str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    // console.log(str);
    // str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //convert word headers to strong
    str = str.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
    //remove lang attribute
    str = str.replace(/(lang)\s*=\s*([\'\"]?)[\w-]+\2/ig, "");
    // Examine all styles: delete junk, transform some, and keep the rest
    str = str.replace(/(<[a-z][^>]*)\sstyle="([^"]*)"/gi,function(str, tag, style) {
      var n = [],
      s = style.trim().replace(/&quot;/gi, "'").split(";");
      // Examine each style definition within the tag's style attribute
      for(var i=0;i<s.length;i++){
        v=s[i];
        var name, value,
        parts = v.split(":");
        if (parts.length == 2) {
          name = parts[0].toLowerCase();
          value = parts[1].toLowerCase();
          // Translate certain MS Office styles into their CSS equivalents
          switch (name) {
            case "mso-padding-alt":
            case "mso-padding-top-alt":
            case "mso-padding-right-alt":
            case "mso-padding-bottom-alt":
            case "mso-padding-left-alt":
            case "mso-margin-alt":
            case "mso-margin-top-alt":
            case "mso-margin-right-alt":
            case "mso-margin-bottom-alt":
            case "mso-margin-left-alt":
            case "mso-table-layout-alt":
            case "mso-height":
            case "mso-width":
            case "mso-vertical-align-alt":
              n[i++] = name.replace(/^mso-|-alt$/g, "") + ":" + ensureUnits(value);
	      continue;

	    case "horiz-align":
              n[i++] = "text-align:" + value;
	      continue;

	    case "vert-align":
              n[i++] = "vertical-align:" + value;
	      continue;

	    case "font-color":
            case "mso-foreground":
              n[i++] = "color:" + value;
	      continue;

	    case "mso-background":
            case "mso-highlight":
              n[i++] = "background:" + value;
	      continue;

	    case "mso-default-height":
              n[i++] = "min-height:" + ensureUnits(value);
	      continue;

	    case "mso-default-width":
              n[i++] = "min-width:" + ensureUnits(value);
	      continue;

	    case "mso-padding-between-alt":
              n[i++] = "border-collapse:separate;border-spacing:" + ensureUnits(value);
	      continue;

	    case "text-line-through":
	      if ((value == "single") || (value == "double")) {
                n[i++] = "text-decoration:line-through";
              }
	      continue;

	    case "mso-zero-height":
              if (value == "yes") {n[i++] = "display:none";}
	      continue;
	  }
	  // Eliminate all MS Office style definitions that have no CSS equivalent by examining the first characters in the name
	  if (/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?:align|decor|indent|trans)|top-bar|version|vnd|word-break)/.test(name)) {
            continue;
          }
	  // If it reached this point, it must be a valid CSS style
	  n[i++] = name + ":" + parts[1];
	  // Lower-case name, but keep value case
	}
      }
      // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
      return tag;/*
      if (i > 0) {
        return tag + ' style="' + n.join(';') + '"';
      } else {
        return tag;
      }*/
    });
    return str;
  };
  var isWordDocument = function(strValue){
    var re=new RegExp(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig);
      return re.test(strValue);
  };
  var filterPasteData = function(originalText){
    if(isWordDocument(originalText)){
      originalText=filterPasteWord(originalText);
    }
    // 之前是调用的filterPasteText
    return App.ClipApp.Filter.filter(originalText);
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
      var orRange=objEditor.contentWindow.document.selection.createRange();
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
      ifmTemp.contentWindow.document.execCommand("Paste",false,null);
      objEditor.contentWindow.focus();
      newData=ifmTemp.contentWindow.document.body.innerHTML;
      //filter the pasted data
      newData=filterPasteData(newData);
      ifmTemp.contentWindow.document.body.innerHTML=newData;
      //paste the data into the editor
      orRange.pasteHTML(newData);
      //block default paste
      if(e){
	e.returnValue = false;
	if(e.preventDefault)
	  e.preventDefault();
     }
     return false;
   }else{
     enableKeyDown=false;
     //create the temporary html editor
     // var divTemp=edDoc.createElement("DIV");
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
       // console.log(newData);
       newData=filterPasteData(newData);
       // console.log(newData);
       divTemp.innerHTML=newData;
       //paste the new data to the editor
       objEditor.contentWindow.document.execCommand('inserthtml', false, newData );
       edDoc.body.removeChild(divTemp);
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