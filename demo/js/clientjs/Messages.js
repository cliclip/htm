/**
 * Messages
 * This Class match the server response code to the client message text
 */

 client.MESSAGES["login_success"] = "登录成功";

 client.MESSAGES["register_success"] = "注册成功";

 client.MESSAGES["auth_success"] = "更改密码成功";

 client.MESSAGES["password_diff"] = "密码输入不一致";


 client.MESSAGES["auth"] = client.MESSAGES["auth"] || {};

 client.MESSAGES["auth"]["not_exist"] = "用户不存在";

 client.MESSAGES["auth"]["not_match"] = "句柄不合法";

client.MESSAGES["auth"]["not_login"] = "用户未登录";


 client.MESSAGES["name"] = client.MESSAGES["name"] || {};

 client.MESSAGES["name"]["is_null"] = "用户名为空";

 client.MESSAGES["name"]["invalidate"] = "用户名不符合校验规则（只能是英文、数字和点的组合，长度是5-20）";

 client.MESSAGES["name"]["exist"] = "用户名已存在";

 client.MESSAGES["name"]["not_exist"] = "用户不存在";


 client.MESSAGES["pass"] = client.MESSAGES["pass"] || {};

 client.MESSAGES["pass"]["is_null"] = "密码为空";

 client.MESSAGES["pass"]["not_match"] = "密码不匹配";


 client.MESSAGES["oldpass"] = client.MESSAGES["oldpass"] || {};

 client.MESSAGES["oldpass"]["is_null"] = "原密码为空";

 client.MESSAGES["oldpass"]["not_match"] = "原密码不匹配";
 client.MESSAGES["recomment_success"]= "转发成功";


 //get error message from the info of server response
 client.MESSAGES.getErrorMessage = function(errorCode){
   for (key in errorCode)
     errorCode[key] = client.MESSAGES[key][errorCode[key]] +"  ";
     return errorCode;
 }