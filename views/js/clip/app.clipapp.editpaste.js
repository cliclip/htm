App.ClipApp.Editor = (function(App, Backbone, $){
  var Editor = {};
  var isIE=(navigator.appName.indexOf("Microsoft")!=-1)?true:false;
  // 不能正确处理<pre>标签的内容
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
    if(isIE){
      return objEditor.contentWindow.document.body.innerText;
    }else{
      return objEditor.contentWindow.document.body.innerHTML;
    }
  };

  // 与getContent对称 该js内部实现 [没有必要]
  Editor.setContent = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    if(isIE){
      objEditor.contentWindow.document.execCommand('Paste', false, data);
    }else{
      objEditor.contentWindow.document.execCommand('inserthtml', false, data);
    }
  };

  // data 可以是一个对象 没有必要设为数组
  Editor.insertImage = function(editorId, data){
    var objEditor = document.getElementById(editorId);
    var img = "";
    if(data.url)
      img = "<img src="+data.url+" style='max-width:485px;max-height:490px;' />";
    if(isIE){ // TODO
      // var ifmTemp=document.getElementById("ifmTemp");
      objEditor.contentWindow.document.execCommand("Paste", false, img);
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
/*
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
 */
  var isWordDocument = function(strValue){
    var re=new RegExp(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig);
      return re.test(strValue);
  };
  var filterPasteData = function(originalText){
    if(isWordDocument(originalText)){
      originalText=filterPasteWord(originalText);
    }
    // 之前是调用的filterPasteText
    return Filter.filter(originalText);
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
  return Editor;
})(App, Backbone, jQuery);


var Filter = (function(){
  var exports = {};
  // filter facility
  exports.filter = function (html) {
    // console.log(html);
    if (isWord(html)) {
      html = cleanWord(html);
      // console.log(html);
    }
    html = cleanHtml(html);
    // console.log(html);
    html = htmlToUbb(html);
    // console.log(html);
    html = ubbToHtml(html);
    // console.log(html);
    return html;
  };

  function isWord(strValue) {
    var re = new RegExp(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig);
    return re.test(strValue);
  }

  function cleanWord(str) {
    // console.log(str);
    //remove link break
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove &nbsp; entities at the start of contents
    str = str.replace(/^\s*(&nbsp;)+/ig, "");
    //remove &nbsp; entities at the end of contents
    str = str.replace(/(&nbsp;|<br[^>]*>)+\s*$/ig, "");
    // Remove comments
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    // Remove scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
    str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi, "");
    // keep img
    // str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //convert word headers to strong
    str = str.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
    //remove lang attribute
    str = str.replace(/(lang)\s*=\s*([\'\"]?)[\w-]+\2/ig, "");
    // Examine all styles: delete junk, transform some, and keep the rest
    str = str.replace(/(<[a-z][^>]*)\sstyle="([^"]*)"/gi, function(str, tag, style) {
      var n = [],s = style.trim().replace(/&quot;/gi, "'").split(";");
      // Examine each style definition within the tag's style attribute
      for (var i = 0; i < s.length; i++) {
        v = s[i];
        var name, value, parts = v.split(":");
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
            if (value == "yes") {
              n[i++] = "display:none";
            }
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
      return tag;
      /*
       *       // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
       *       if (i > 0) {
       *         return tag + ' style="' + n.join(';') + '"';
       *       } else {
       *         return tag;
       *       }
       *       */
       });
    return str;
  }

  function cleanHtml(str) {
    str = str.replace(/\r\n|\n|\r/ig, "");
        //remove html body form
    str = str.replace(/<\/?(html|body|form)(?=[\s\/>])[^>]*>/ig, "");
        //remove doctype
    str = str.replace(/<(!DOCTYPE)(\n|.)*?>/ig, "");
        // Word comments like conditional comments etc
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
        //remove xml tags
    str = str.replace(/<(\/?(\?xml(:\w+)?|xml|\w+:\w+)(?=[\s\/>]))[^>]*>/gi, "");
        //remove head
    str = str.replace(/<head[^>]*>(\n|.)*?<\/head>/ig, "");
        //remove <xxx />
    str = str.replace(/<(script|style|link|title|meta|textarea|option|select|iframe|hr)(\n|.)*?\/>/ig, "");
        //remove empty span
    str = str.replace(/<span[^>]*?><\/span>/ig, "");
        //remove <xxx>...</xxx>
    str = str.replace(/<(head|script|style|textarea|button|select|option|iframe)[^>]*>(\n|.)*?<\/\1>/ig, "");
        //remove table and <a> tag,<input> tag (this can help filter unclosed tag)
    str = str.replace(/<\/?(input|iframe|div)[^>]*>/ig, "");
        // keep img
    // str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|img|input|iframe|div)[^>]*>/ig, "");
    //remove bad attributes
    do {
      len = str.length;
      str = str.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|class|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
    } while (len != str.length);
    return str;
  }
  function htmlToUbb(html){
    var text = html;
    // Format anchor tags properly.
    // input - <a class='ahref' href='http://pinetechlabs.com/' title='asdfqwer\"><b>asdf</b></a>"
    // output - asdf (http://pinetechlabs.com/)"
     text = text.replace(/<\s*a[^>]*href=['"](.*?)['"][^>]*>([\s\S]*?)<\/\s*a\s*>/ig, "[url=$1]$2[/url]");
    // Format image tags properly.'
    // input - <img src="http://what.url.jpg" />'
    // output - [http://what.url.jpg]'
    text = text.replace(/<\s*img[^>]*src=['"](.*?)['"][^>]*>/ig, "[img]$1[/img]");
    text = toText(text);
    return text;
  }

  function ubbToHtml(ubb){
    var text = ubb;
    text = text.replace(/\[b\](.*?)\[\/b\]/ig, "<b>$1</b>");
    text = text.replace(/\[i\](.*?)\[\/i\]/ig, "<i>$1</i>");
    text = text.replace(/\[u\](.*?)\[\/u\]/ig, "<u>$1</u>");
    text = text.replace(/\[img=(.*?)\]/ig, "<img src=\"$1\"/>");
    text = text.replace(/\[img\](.*?)\[\/img\]/ig, "<img src=\"$1\"/>");
    text = text.replace(/\[url=(.*?)\](.*?)\[\/url\]/ig, "<a href=\"$1\">$2</a>");
    text = text.replace(/\n{2,}/ig, "<\/p><p>");
    text = text.replace(/\n/ig, "<\/br>");
    text = "<p>"+text+"</p>";
    return text;
  }

  // https://github.com/mtrimpe/jsHtmlToText/blob/master/jsHtmlToText.js

  /* I scanned http://en.wikipedia.org/wiki/HTML_element for all html tags.
   *   I put those tags that should affect plain text formatting in two categories:
   *   those that should be replaced with two newlines and those that should be
   *   replaced with one newline. */

  var DoubleLineTags = ['p', 'h[1-6]', 'dl', 'dt', 'dd', 'ol', 'ul', 'dir', 'address', 'blockquote', 'center', 'div', 'hr', 'pre', 'form', 'textarea', 'table'];

  var SingleLineTags = ['li', 'del', 'ins', 'fieldset', 'legend', 'tr', 'th', 'caption', 'thead', 'tbody', 'tfoot'];

  // 去掉 html 的所有标签，获取 html 内容的 text 格式
  function toText(html) {
    var text = html
      // Remove line breaks
    .replace(/(?:\n|\r\n|\r)/ig, " ")
      // Remove content in script tags.
    .replace(/<\s*script[^>]*>[\s\S]*?<\/script>/mig, "")
      // Remove content in style tags.
    .replace(/<\s*style[^>]*>[\s\S]*?<\/style>/mig, "")
      // Remove content in comments.
    .replace(/<!--.*?-->/mig, "")
      // Remove !DOCTYPE
    .replace(/<!DOCTYPE.*?>/ig, "");

  for (i = 0; i < DoubleLineTags.length; i++) {
    var r = RegExp('</?\\s*' + DoubleLineTags[i] + '[^>]*>', 'ig');
    text = text.replace(r, '\n\n');
  }

  for (i = 0; i < SingleLineTags.length; i++) {
    var r = RegExp('<\\s*' + SingleLineTags[i] + '[^>]*>', 'ig');
    text = text.replace(r, '\n');
  }

    // Replace <br> and <br/> with a single newline
  text = text.replace(/<\s*br[^>]*\/?\s*>/ig, '\n');
    text = text
      // Remove all remaining tags.
    .replace(/(<([^>]+)>)/ig, "")
      // Trim rightmost whitespaces for all lines
    .replace(/([^\n\S]+)\n/g, "\n").replace(/([^\n\S]+)$/, "")
      // Make sure there are never more than two
    // consecutive linebreaks.
    .replace(/\n{2,}/g, "\n\n")
      // Remove newlines at the beginning of the text.
    .replace(/^\n+/, "")
      // Remove newlines at the end of the text.
    .replace(/\n+$/, "")
      // Decode HTML entities.
    .replace(/&([^;]+);/g, decode);
    return text;
  }

  var DecodeMap = {
    'nbsp' : 160, 'iexcl' : 161, 'cent' : 162, 'pound' : 163,
    'curren' : 164, 'yen' : 165, 'brvbar' : 166, 'sect' : 167,
    'uml' : 168, 'copy' : 169, 'ordf' : 170, 'laquo' : 171,
    'not' : 172, 'shy' : 173, 'reg' : 174, 'macr' : 175,
    'deg' : 176, 'plusmn' : 177, 'sup2' : 178, 'sup3' : 179,
    'acute' : 180, 'micro' : 181, 'para' : 182, 'middot' : 183,
    'cedil' : 184, 'sup1' : 185, 'ordm' : 186, 'raquo' : 187,
    'frac14' : 188, 'frac12' : 189, 'frac34' : 190, 'iquest' : 191,
    'Agrave' : 192, 'Aacute' : 193, 'Acirc' : 194, 'Atilde' : 195,
    'Auml' : 196, 'Aring' : 197, 'AElig' : 198, 'Ccedil' : 199,
    'Egrave' : 200, 'Eacute' : 201, 'Ecirc' : 202, 'Euml' : 203,
    'Igrave' : 204, 'Iacute' : 205, 'Icirc' : 206, 'Iuml' : 207,
    'ETH' : 208, 'Ntilde' : 209, 'Ograve' : 210, 'Oacute' : 211, 'Ocirc' : 212,
    'Otilde' : 213, 'Ouml' : 214, 'times' : 215, 'Oslash' : 216,
    'Ugrave' : 217, 'Uacute' : 218, 'Ucirc' : 219, 'Uuml' : 220,
    'Yacute' : 221, 'THORN' : 222, 'szlig' : 223, 'agrave' : 224,
    'aacute' : 225, 'acirc' : 226, 'atilde' : 227, 'auml' : 228,
    'aring' : 229, 'aelig' : 230, 'ccedil' : 231, 'egrave' : 232,
    'eacute' : 233, 'ecirc' : 234, 'euml' : 235, 'igrave' : 236,
    'iacute' : 237, 'icirc' : 238, 'iuml' : 239, 'eth' : 240, 'ntilde' : 241,
    'ograve' : 242, 'oacute' : 243, 'ocirc' : 244, 'otilde' : 245,
    'ouml' : 246, 'divide' : 247, 'oslash' : 248, 'ugrave' : 249,
    'uacute' : 250, 'ucirc' : 251, 'uuml' : 252, 'yacute' : 253, 'thorn' : 254,
    'yuml' : 255, 'quot' : 34, 'amp' : 38, 'lt' : 60, 'gt' : 62, 'OElig' : 338,
    'oelig' : 339, 'Scaron' : 352, 'scaron' : 353, 'Yuml' : 376, 'circ' : 710,
    'tilde' : 732, 'ensp' : 8194, 'emsp' : 8195, 'thinsp' : 8201,
    'zwnj' : 8204, 'zwj' : 8205, 'lrm' : 8206, 'rlm' : 8207, 'ndash' : 8211,
    'mdash' : 8212, 'lsquo' : 8216, 'rsquo' : 8217, 'sbquo' : 8218,
    'ldquo' : 8220, 'rdquo' : 8221, 'bdquo' : 8222, 'dagger' : 8224,
    'Dagger' : 8225, 'permil' : 8240, 'lsaquo' : 8249, 'rsaquo' : 8250,
    'euro' : 8364
  };

function decode(m, n) {
  var code;
  if (n.substr(0, 1) == '#') {
    if (n.substr(1, 1) == 'x') {
      code = parseInt(n.substr(2), 16);
    } else {
      code = parseInt(n.substr(1), 10);
    }
  } else {
    code = DecodeMap[n];
  }
  return (code === undefined || code === NaN) ? '&' + n + ';' : String.fromCharCode(code);
  }
  return exports;

})();
