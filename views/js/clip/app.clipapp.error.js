App.ClipApp.Error=(function(App,Backbone,$){
 var Error = {};
 Error.process=function(message){
   if(message == "InternalOAuthError"){
     var sure = function(){
       if(App.ClipApp.isLoggedIn()){
	 App.ClipApp.showUserEdit();
	 Backbone.history.navigate("my", true);
       }else Backbone.history.navigate("register",true);
     };
     App.ClipApp.showConfirm(message,null, sure);
   }else{
     App.ClipApp.showConfirm("error_message");
     if(App.ClipApp.isLoggedIn())  Backbone.history.navigate("my",true);
     else Backbone.history.navigate("register",true);
   }
  };
  return Error;
})(App,Backbone,jQuery);