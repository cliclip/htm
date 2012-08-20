(function(){

var GKFN = {
  feedback_base_url : 'http://geekui.com',
  showFeedback : function() {
    var feedback_on_html = document.getElementsByTagName('html')[0];
    var feedback_iframe = document.getElementById('feedback_iframe');
    var feedback_overlay = document.getElementById('feedback_overlay');
    var feedback_container = document.getElementById('feedback_container');
    var feedback_loading = document.getElementById('feedback_loading');
    var feedback_close = document.getElementById('feedback_close');
    feedback_overlay.className = '';
    feedback_loading.className = '';
    feedback_close.className = '';
    feedback_iframe.src = GKFN.feedback_url;
    feedback_on_html.className = feedback_on_html.className + ' feedback_tab_on';
    var container_left = document.documentElement.clientWidth/2 - 338 + 'px';
    feedback_container.style.left = container_left;
    if (feedback_iframe.addEventListener) {
      feedback_iframe.addEventListener('load', GKFN.feedbackLoaded, false);
    } else if (feedback_iframe.attachEvent) {
      feedback_iframe.attachEvent('onload', GKFN.feedbackLoaded);
    }
  },
  hideFeedback : function() {
    var feedback_iframe = document.getElementById('feedback_iframe');
    var feedback_overlay = document.getElementById('feedback_overlay');
    var feedback_on_html = document.getElementsByTagName('html')[0];
    feedback_overlay.className = 'dn';
    feedback_iframe.className = 'dn';
    feedback_iframe.src = GKFN.feedback_base_url + '/static/img/widgets/blank.gif';
    feedback_on_html.className = feedback_on_html.className.replace('feedback_tab_on', '');
    if (feedback_iframe.addEventListener) {
      feedback_iframe.removeEventListener('load', GKFN.feedbackLoaded, false);
    } else if (feedback_iframe.attachEvent) {
      feedback_iframe.detachEvent('onload', GKFN.feedbackLoaded);
    }
  },
  feedbackLoaded : function() {
    document.getElementById('feedback_loading').className="dn";
    document.getElementById('feedback_iframe').className = '';
    document.getElementById('feedback_close').className = 'loaded';
  },
  feedback_widget : function(options) {
    GKFN.options = options;
    if (GKFN.options.display == 'overlay') {
      if (options.product_sub_url) {
	GKFN.feedback_url = GKFN.feedback_base_url + '/widget/feedback?company_sub_url=' + GKFN.options.company_sub_url + '&product_sub_url=' + GKFN.options.product_sub_url + '&display=' + GKFN.options.display;
      } else {
	GKFN.feedback_url = GKFN.feedback_base_url + '/widget/feedback?company_sub_url=' + GKFN.options.company_sub_url + '&display=' + GKFN.options.display;
      }
      GKFN.addCSSFile();
      GKFN.iframe_html = '<iframe id="feedback_iframe" allowTransparency="true" scrolling="no" frameborder="0" class="dn" src="'+GKFN.feedback_base_url + '/static/img/widgets/blank.gif"></iframe>';
      var feedback_class = 'geekui_feedback_tab';
      if (GKFN.options.placement == 'right') {
	feedback_class += ' right';
      } else if (GKFN.options.placement == 'left') {
	feedback_class += ' left';
      } else {
	feedback_class += ' bottom_right';
      }
      if (GKFN.options.tab_define) {
	feedback_class += ' define';
	var radius_style = '';
	var radius = ' ' + GKFN.options.border_radius + 'px ';
	if (GKFN.options.placement == 'right') {
	  radius_style = '-moz-border-radius:' + radius + '0 0' + radius + ';-webkit-border-radius:' + radius + '0 0' + radius + ';border-radius:' + radius + '0 0' + radius + ';';
	} else if (GKFN.options.placement == 'left') {
	  radius_style = '-moz-border-radius: 0' + radius + radius + '0;-webkit-border-radius: 0' + radius + radius + '0;border-radius: 0' + radius + radius + '0;';
	} else {
	  radius_style = '-moz-border-radius: ' + radius + radius + '0 0;-webkit-border-radius: ' + radius + radius + '0 0;border-radius: ' + radius + radius + '0 0;';
	}
	var style = 'color: ' + GKFN.options.font_color + ';background-color: ' + GKFN.options.background_color + ';' + radius_style;
	if (GKFN.options.show_border == 'yes') {
	  feedback_class += ' border';
	  style += 'border-color: ' + GKFN.options.border_color + ';';
	} else {
	  style += 'border-width: 0px;';
	}
	if (GKFN.options.show_logo == 'yes') {
	  feedback_class += ' logo';
	}
	GKFN.tab_html = '<a href="javascript:void(0)" id="feedback_tab" class="' + feedback_class + '" style="' + style + '">' + GKFN.options.tab_name + '</a>';
      } else {
	feedback_class += ' pic';
	GKFN.tab_html = '<a href="javascript:void(0)" id="feedback_tab" class="' + feedback_class + '" ><img src="' + GKFN.feedback_base_url + '/static/img/widgets/' + GKFN.options.style + '" /></a>';
      }
      var container_left = document.documentElement.clientWidth/2 - 338 + 'px';
      GKFN.overlay_html = '<div id="feedback_overlay" class="dn"><div id="feedback_container" style="left: ' + container_left + ' "><a href="javascript:void(0)" id="feedback_close"></a><div id="feedback_loading" class="dn"><p class="t-c" style="position:absolute;top:130px;left:170px"></p><img src="' + GKFN.feedback_base_url + '/static/img/widgets/ajax-loader.gif" /></div>' + GKFN.iframe_html + '</div><div id="feedback_screen"></div></div>';
      var body = document.getElementsByTagName('body')[0];
      var div1 = document.createElement('div');
      div1.innerHTML = GKFN.tab_html + GKFN.overlay_html ;
      body.appendChild(div1);
      // document.write(GKFN.tab_html);
      // document.write(GKFN.overlay_html);
      var feedback_obj = GKFN;
      document.getElementById('feedback_tab').onclick = function() {
	feedback_obj.showFeedback();
	return false;
      };
      document.getElementById('feedback_close').onclick = function() {
	feedback_obj.hideFeedback();
	return false;
      };
    } else {
      if (options.product_sub_url) {
	GKFN.feedback_url = GKFN.feedback_base_url + '/widget/feedback/page?company_sub_url=' + GKFN.options.company_sub_url + '&product_sub_url=' + GKFN.options.product_sub_url + '&display=' + GKFN.options.display;
      } else {
	GKFN.feedback_url = GKFN.feedback_base_url + '/widget/feedback/page?company_sub_url=' + GKFN.options.company_sub_url + '&display=' + GKFN.options.display;
      }
      GKFN.iframe_html = '<iframe id="feedback_iframe_page" allowTransparency="true" scrolling="no" frameborder="0" src="' + GKFN.feedback_url + '" style="width: 100%; height: 675px"></iframe>';
      var body = document.getElementsByTagName('body')[0];
      var div1 = document.createElement('div');
      div1.innerHTML = GKFN.iframe_html;
      body.appendChild(div1);
      // document.write(GKFN.iframe_html);
    }
  },
  addCSSFile : function() {
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = GKFN.feedback_base_url +'/static/css/feedback_widgets-1.0.1.3.css';
    head.appendChild(style);
  }
};

var feedback_widget = new GKFN.feedback_widget({
  product_sub_url:"web",
  company_sub_url:"cliclip",
  placement:"right",
  tab_define:true,
  display:"overlay",
  tab_name:"意见反馈",
  font_color:"#ffffff",
  background_color:"#a0a0a0",
  border_radius:"0",
  show_border:"no",
  border_color:"#a9a9a9",
  show_logo:"no"
});

})();
