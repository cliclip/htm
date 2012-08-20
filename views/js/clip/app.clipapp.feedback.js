(function(){

  function show(){
    if(App.versions.getLanguage() == 'zh'){
      console.log("this language is zh");
      // zh 意见反馈
      var head = document.getElementsByTagName('head')[0];
      var js2 = document.createElement('script');
      js2.setAttribute('src', '/js/feedback-zh.js');
      head.appendChild(js2);
    }else{
      // en feedback
      console.log("this language is en");
      var head = document.getElementsByTagName('head')[0];
      var js = document.createElement('script');
      js.setAttribute('src', '/js/feedback-en.js');
      head.appendChild(js);
    }
  };

  App.bind("initialize:after", function(){
    show();
  });

})();