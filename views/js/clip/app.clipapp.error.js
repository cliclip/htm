App.ClipApp.Error=(function(App,Backbone,$){
 var Error = {};
 Error.process=function(message){
   // console.log(typeof(message));
   if(message == "InternalOAuthError"){
     App.vent.trigger("app.clipapp.message:confirm", message);
     var my=App.util.getMyUid();
     if(my)  Backbone.history.navigate("my",true);
     else    Backbone.history.navigate("register",true);
   }else{
     App.vent.trigger("app.clipapp.message:confirm", "error_message");
     Backbone.history.navigate("",true);
   }
  };
  return Error;
})(App,Backbone,jQuery);