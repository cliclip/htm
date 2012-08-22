window._gaq = [];
_gaq.push(['_setAccount', 'UA-34226123-1']);
_gaq.push(['_setDomainName', 'cliclip.com']);
_gaq.push(['_addOrganic', 'google', 'as_q']);
_gaq.push(['_addOrganic', 'baidu', 'word']);
_gaq.push(['_addOrganic', 'baidu', 'w']);
_gaq.push(['_addOrganic', 'baidu', 'q1']);
_gaq.push(['_addOrganic', 'baidu', 'q2']);
_gaq.push(['_addOrganic', 'baidu', 'q3']);
_gaq.push(['_addOrganic', 'baidu', 'q4']);
_gaq.push(['_addOrganic', 'baidu', 'q5']);
_gaq.push(['_addOrganic', 'baidu', 'q6']);
_gaq.push(['_addOrganic', 'soso', 'w']);
_gaq.push(['_addOrganic', 'youdao', 'q']);
_gaq.push(['_addOrganic', 'sogou', 'query']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*
(function(App, Backbone, $){

  App.vent.bind("app.clipapp.ga:track_homepage",function(){
    var now =new Date().getTime();
    var page_load_time=now-window.performance.timing.fetchStart;
    var hourInMillis = 1000 * 60 * 60;
    if(0 < page_load_time && page_load_time < hourInMillis){ // avoid sending bad data
      _gaq.push(['_trackTiming', '/#', "Load Home_page", page_load_time]);
    }
  });

})(App, Backbone, jQuery);
*/