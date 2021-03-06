App.Convert = (function(App, Backbone, $){
  var Convert = {};
  // filter facility

  // 代替了filterPastetext的过滤方法
  Convert.filter = function (html) {
    if (isWord(html)) {html = cleanWord(html);}
     // 本身是在 cleanHtml中的因为要和cleanComment公用，所以挪出此句子
    html = html.replace(/\r\n|\n|\r/ig, "");
    html = _cleanHtml(html);
    html = _htmlToUbb(html);
    html = _ubbToHtml(html);
    return html;
  };

  Convert.cleanHtml = _cleanHtml;

  function isWord(strValue) {
    // var re = new RegExp(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig);
    var re = /(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig;
    return re.test(strValue);
  }

  var ensureUnits = function(v) {
    return v + ((v !== "0") && (/\d$/.test(v)))? "px" : "";
  };

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
    // keep img
    str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi, "");
    // str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,"");
    //convert word headers to strong
    str = str.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
    //remove lang attribute
    str = str.replace(/(lang)\s*=\s*([\'\"]?)[\w-]+\2/ig, "");
    // Examine all styles: delete junk, transform some, and keep the rest
    str = str.replace(/(<[a-z][^>]*)\sstyle="([^"]*)"/gi, function(str, tag, style) {
      var n = [],s = $.trim(style).replace(/&quot;/gi, "'").split(";");
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

  function _cleanHtml(str) {
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
    //remove <xxx>...</xxx>
    str = str.replace(/<(head|script|style|textarea|button|select|option|iframe)[^>]*>(\n|.)*?<\/\1>/ig, "");
    //remove <xxx />
    str = str.replace(/<(script|style|link|title|meta|textarea|option|select|iframe|hr)(\n|.)*?\/>/ig, "");
    //remove empty span
    str = str.replace(/<span[^>]*?><\/span>/ig, "");
    //remove table and <a> tag,<input> tag (this can help filter unclosed tag)
    // str = str.replace(/<\/?(input|iframe|div)[^>]*>/ig, "");
    str = str.replace(/<\/?(input|iframe)[^>]*>/ig, "");
    // keep img&a 需要在后边将div转换为\n
    // str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|img|input|iframe|div)[^>]*>/ig, "");
    str = str.replace(/<\/?(table|tr|td|tbody|thead|th|input|iframe)[^>]*>/ig, "");
    //remove bad attributes
    do {
      len = str.length;
      str = str.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|class|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
    } while (len != str.length);
    return str;
  }

  // 对与pre和code类的标签此处是作为文本内容进行处理的
  function _htmlToUbb(html){
    var text = html;
    // 先将不是html的网址转换成 a 标签"
    var re=/((https?|ftp|news):\/\/)?([A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"\s\u4E00-\u9FA5\uf900-\ufa2d])*)/g;
    var reg = /(="|='|=)(?=http:\/\/)/;
    var reg1 = /\*?url/;
    var no_transform_A,no_transform_B,url_front = "",url_back="";
    text = text.replace(re,function(a,b,c,d,e,f){
      // 使用a来拼正则表达式,报错
      if(c=="http" || c=="https" || c=="ftp" || c=="news"){
	url_front = text.substring(f-5,f-1);
	url_back = text.substring(f+a.length,f+a.length+4);
      }
      // url_front 可能是title
      no_transform_A = reg1.test(url_front) ? true : url_front == "ref=" ? true : url_front == "src=" ? true : url_front == "tle=" ? true : url_front == "itle" ? true : false ; //ref是A标签中的标志(href),src是图片标志，url是某些CSS背景图片,某些title也用了url地址
      no_transform_B = url_back == "</a>" ? true : url_back == "</A>" ? true : false;
      if(c == "" || c === undefined ) no_transform_A = true;
      // alert("a = " + a + " b = " + b + " c = " + c + " d = " + d + " e = " + e + " f = " + f + " notransform_A = " + no_transform_A + " notransform_B =" + no_transform_B);
      if(no_transform_A || no_transform_B){ // www.baidu.com、超链接直接返回
	return a;
      }else{
	return '<a href="'+a+'">'+a+'</a>&nbsp;'; // 火狐浏览器超链接截断
      }
    });
    //并不完善需没办法正确处理超链接图片
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

  function _ubbToHtml(ubb){
    // flag仅仅用来标识是否需要在text上加上p标签
    var text = ubb;
    text = text.replace(/\[b\](.*?)\[\/b\]/ig, "<b>$1</b>");
    text = text.replace(/\[i\](.*?)\[\/i\]/ig, "<i>$1</i>");
    text = text.replace(/\[u\](.*?)\[\/u\]/ig, "<u>$1</u>");
    text = text.replace(/\n{2,}/ig, "<\/p><p>");
    text = text.replace(/\n/ig, "<\/br>");
    text = text.replace(/\[url=(.*?)\](.*?)\[\/url\]/ig, "<a href=\"$1\">$2</a>");
    text = text.replace(/\[img=(.*?)\]/ig, "<img src=\"$1\" />");
    text = text.replace(/\[img\](.*?)\[\/img\]/ig, "<img src=\"$1\" onerror=\"App.util.img_error(this)\"" +" />");//详情页图片加载失败后加载统一图片
    text = "<p>" + text + "</p>";
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
    text = text.replace(/<\/?\s*p[^>]*>/gi, '\n\n');
    text = text.replace(/<\/?\s*h[1-6][^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dl[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dt[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dd[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*ol[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*ul[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*dir[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*address[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*blockquote[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*center[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*div[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*hr[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*pre[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*form[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*textarea[^>]*>/ig, '\n\n');
    text = text.replace(/<\/?\s*table[^>]*>/ig, '\n\n');

    /*var SingleLineTags = ['li', 'del', 'ins', 'fieldset', 'legend', 'tr', 'th', 'caption', 'thead', 'tbody', 'tfoot'];*/
    text = text.replace(/<\s*li[^>]*>/ig, '\n');
    text = text.replace(/<\s*del[^>]*>/ig, '\n');
    text = text.replace(/<\s*ins[^>]*>/ig, '\n');
    text = text.replace(/<\s*fieldset[^>]*>/ig, '\n');
    text = text.replace(/<\s*legend[^>]*>/ig, '\n');
    text = text.replace(/<\s*tr[^>]*>/ig, '\n');
    text = text.replace(/<\s*th[^>]*>/ig, '\n');
    text = text.replace(/<\s*caption[^>]*>/ig, '\n');
    text = text.replace(/<\s*thead[^>]*>/ig, '\n');
    text = text.replace(/<\s*tbody[^>]*>/ig, '\n');
    text = text.replace(/<\s*tfoot[^>]*>/ig, '\n');
    // Replace <br> and <br/> with a single newline
    text = text.replace(/<\s*br[^>]*\/?\s*>/ig, '\n');
    /*
    for (i = 0; i < DoubleLineTags.length; i++) {
      var r = RegExp('</?\\s*div[^>]*>', 'ig');
      console.log("r :: " + r);
      text = text.replace(r, '\n\n');
    }
    for (i = 0; i < SingleLineTags.length; i++) {
      var r = RegExp('<\\s*' + SingleLineTags[i] + '[^>]*>', 'ig');
      console.log("r :: " + r);
      text = text.replace(r, '\n');
    }*/
    // Replace <br> and <br/> with a single newline
    text = text.replace(/<\s*br[^>]*\/?\s*>/ig, '\n');
    text = text
    // Remove all remaining tags.
    .replace(/(<([^>]+)>)/ig, "")
    // Trim rightmost whitespaces for all lines
    .replace(/([^\n\S]+)\n/g, "\n")
    // .replace(/([^\n\S]+)$/, "")
    // Make sure there are never more than two
    // consecutive linebreaks.
    .replace(/\n{2,}/g, "\n\n")
    // Remove newlines at the beginning of the text.
    .replace(/^\n+/, "")
    // Remove newlines at the end of the text.
    .replace(/\n+$/, "");
    // .replace(/&([^;]+);/g, decode);
    // Decode HTML entities.
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
  return Convert;

})(App, Backbone, jQuery);
