App.ClipApp.EditPaste = (function(App, Backbone, $){
  var EditPaste = {};
  var isIE=(navigator.appName.indexOf("Microsoft")!=-1)?true:false;
  // 不能正确处理<pre>标签的内容
  EditPaste.initEditor = function(){
    var ifrm=document.getElementById("editor");
    ifrm.contentWindow.document.designMode = "On";
    ifrm.contentWindow.document.write("<body style=\"font-size:70%;font-family:Verdana,Arial,sans-serif;margin:0;min-height:20px\"></body>");
    ifrm.contentWindow.document.close();
    if(isIE){
      ifrm.contentWindow.document.documentElement.attachEvent("onpaste", function(e){return pasteClipboardData(ifrm.id,e);});
    }else{
      ifrm.contentWindow.document.addEventListener("paste", function(e){return pasteClipboardData(ifrm.id,e);},false);
    }
  };

  EditPaste.getContent = function(editorId){
    var objEditor = document.getElementById(editorId); // 取得编辑器对象
    if(isIE){
      return objEditor.contentWindow.document.body.innerText;
    }else{
      return objEditor.contentWindow.document.body.innerHTML;
    }
  };

  // 与getContent对称 该js内部实现 [没有必要]
  EditPaste.setContent = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    if(isIE){ // TODO

    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, data);
    }
  };

  // data 可以是一个对象 没有必要设为数组
  EditPaste.insertImage = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    var img = "";
    if(data.url)
      img = "<img src="+data.url+" />";
    if(isIE){ // TODO
      var ifmTemp=document.getElementById("ifmTemp");
      ifmTemp.contentWindow.document.execCommand("Paste",false,img);
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
    // console.log(str);
    //remove link break
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove &nbsp; entities at the start of contents
    str = str.replace(/^\s*(&nbsp;)+/ig,"");
    //remove &nbsp; entities at the end of contents
    str = str.replace(/(&nbsp;|<br[^>]*>)+\s*$/ig,"");
    // Remove comments
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    // str = str.replace(/<!--.*-->/gi,"");
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
  var filterPasteText = function(str){
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove html body form
    str = str.replace(/<\/?(html|body|form)(?=[\s\/>])[^>]*>/ig, "");
    //remove doctype
    str = str.replace(/<(!DOCTYPE)(\n|.)*?>/ig, "");
    // Word comments like conditional comments etc
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    //remove xml tags
    str = str.replace(/<(\/?(\?xml(:\w+)?|xml|\w+:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //remove head
    str = str.replace(/<head[^>]*>(\n|.)*?<\/head>/ig, "");
    //remove <xxx />
    str = str.replace(/<(script|style|link|title|meta|textarea|option|select|iframe|hr)(\n|.)*?\/>/ig, "");
    //remove empty span
    str = str.replace(/<span[^>]*?><\/span>/ig, "");
    //remove <xxx>...</xxx>
    str = str.replace(/<(head|script|style|textarea|button|select|option|iframe)[^>]*>(\n|.)*?<\/\1>/ig, "");
    //remove table and <a> tag,<input> tag (this can help filter unclosed tag)
    str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|input|iframe|div)[^>]*>/ig, "");
    //remove table and <a> tag, <img> tag,<input> tag (this can help filter unclosed tag)
    // str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|img|input|iframe|div)[^>]*>/ig, "");
    //remove bad attributes
    do {
      len = str.length;
      str = str.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|class|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
    } while (len != str.length);
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
    return filterPasteText(originalText);
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
  return EditPaste;
})(App, Backbone, jQuery);