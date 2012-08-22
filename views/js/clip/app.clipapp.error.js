App.ClipApp.Error=(function(App,Backbone,$){
 var Error = {};
 Error.process=function(message){
   // console.log(typeof(message));
   if(message == "InternalOAuthError"){
     App.ClipApp.showConfirm(message);
   }else{
     App.ClipApp.showConfirm("error_message");
   }
  if(App.ClipApp.isLoggedIn())  Backbone.history.navigate("my",true);
  else Backbone.history.navigate("register",true);
  };
  return Error;
})(App,Backbone,jQuery);