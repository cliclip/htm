App.versions = (function($){
  var versions = {};
    versions.language = {zh:"中文",en:"English"};
    var i18n = {
      // 中文版
      zh : {
	me : {
	  mine      : "我的",
	  recommend : "@我",
	  interest  : "砖家",
	  set       : "&nbsp&nbsp设置",
	  logout    : "&nbsp&nbsp登出",
	  login     : "登 录",
	  register  : "注 册",
	  ok        : "确 定"
	},

	login : {
	  title       : "用户登录" ,
	  login_ok    : "登 录",
	  register_ok : "注 册",
	  login_state : "一月内自动登录",
	  register    : "嫌麻烦？直接发邮件到1@cliclip.com也可注册",
	  name : {
	    is_null    : "用户名尚未填写",
	    not_exist   : "用户名不存在",
	    invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	    exist       :"此用户名已经存在"
	  },
	  pass : {
	    is_null     : "密码尚未填写",
	    not_match   : "密码输入不一致"
	  }
	},

	userface : {
	  following   : "我追谁",
	  follow      : "谁追我"
	},

	faceEdit : {
	  no_name     : "您还没有用户名",
	  set_name    : "设置用户名",
	  ok          : "确 定",
	  upload      : "上传本地图像",
	  name : {
	    is_null    : "用户名尚未填写",
	    invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	    exist       :"此用户名已经存在"
	  }
	},

	languageSet:{
	  lang:"界面语言"
	},

	ruleEdit : {
	  open_rule   : "打开邮箱识别",
	  head        : "邮箱识别",
	  title       : "标题必须有",
	  cc_text     : "必须抄送给",
	  to_text     : "必须发给",
	  update      : "更新邮件规则",
	  cc : {
	    invalidate  : "抄送人中含有不合法的邮件地址"
	  },
	  to : {
	    invalidate  : "收件人中含有不合法的邮件地址"
	  }
	},

	passEdit : {
	  title       : "修改密码",
	  update      : "更 改",
	  danger_operate : "高危操作",
	  export      : "导出摘录",
	  delete      : "删除账户",
	  is_null     : "密码尚未填写",
	  not_match   : "两次密码输入不一致",
	  auth_success: "您的密码已更改",
	  newpass : {
	    prompt:"请输入新密码",
	    is_null:"密码尚未填写"
	  },
	  conpass:{
	    prompt:"确认密码",
	    is_null:"密码尚未填写"
	  },
	  confirm:{
	    password_diff: "密码输入不一致"
	  }
	},

	emailEdit : {
	  add         : "增加邮箱绑定",
	  title       : "邮箱绑定"
	},

	emailAdd : {
	  title       : "添加邮件",
	  ok          : "确 定",
	  cancel      : "取 消",
	  email : {
	    is_Exist  : "邮件地址已经存在",
	    you_exist : "您已经添加过该邮件地址",
	    other_exist:"您所添加的邮件地址已经在系统中了",
	    invalidate: "邮件地址格式有误",
	    is_null   : "邮件地址尚未填写"
	  }
	},

	weiboEdit : {
	  title       : "微博绑定",
	  add         : "增加微博绑定"
	},
	twitterEdit : {
	  title       : "twitter绑定",
	  add         : "增加twitter绑定"
	},

	clipmemo : {
	  title       : "标注",
	  memo        : "备注一下吧~",
	  "private"   : "不公开",
	  ok          : "确 定",
	  cancel      : "取 消"
	},

	editDetail : {
	  upload      : "上传图片",
	  link        : "链接图片",
	  clear       : "整理格式",
	  update      : "修 改",
	  ok          : "确 定",
	  ok_title    : "保 存",
	  cancel      : "取 消",
	  cancel_title: "放 弃"
	},

	delete : {
	  title       : "删除",
	  h3          : "真的要删除吗？",
	  p           : "删除后将无法恢复",
	  ok          : "确 定",
	  cancel      : "取 消"
	},

	reclip : {
	  title       : "收录",
	  defaultNote : "备注一下吧~",
	  "private"   : "不公开",
	  ok          : "确 定",
	  cancel      : "取 消"
	},

	reclipTag : {
	  title       : '您将收藏%d条数据',
	  defaultNote : "备注一下吧~",
	  "private"   : "不公开",
	  ok          : "确 定",
	  cancel      : "取 消"
	},

	recommend :{
	  title       : "转发",
	  defaultText : "说点啥吧～",
	  reclip      : "同时收录",
	  ok          : "确 定",
	  cancel      : "取 消",
	  is_null     : "请添加用户",
	  not_exist   : "您添加的用户不存在",
	  is_null     :"请您先设置推荐备注",
	  recomm_name : {
	    is_null   : "请添加用户名",
	    not_exist : "您添加的用户不存在"
	  },
	  recomm_text : {
	    is_null   :"请您先设置推荐备注"
	  }
	},

	comment : {
	  title       : "评论",
	  defaultText : "说点什么吧~",
	  reclip      : "同时收录",
	  ok          : "确 定",
	  cancel      : "取 消"
	},

	detail : {
	  route       : "录线图",
	  comment     : "评论",
	  recommend   : "转发",
	  reclip      : "收录",
	  delete      : "删除",
	  update      : "修改",
	  memo        : "标注"
	},

	showcomment : {
	  reply       : "回复",
	  delete      : "删除"
	},

	addcomm : {
	  defaultText : "说点什么吧~",
	  reclip      : "同时收录",
	  commentOK   : "评论",
	  cancel      : "取消"
	},

	addClip : {
	  title       : "增加",
	  upload      : "上传图片",
	  link        : "链接图片",
	  ok          : "确 定",
	  clear       : "整理格式",
	  cancel      : "取 消",
	  back        : "返 回",
	  clean       : "清 空"
	},

	clippreview : {
	  reprint     : "转载",
	  reply       : "回复",
	  comment     : "评论",
	  recommend   : "转发",
	  reclip      : "收录",
	  delete      : "删除",
	  update      : "修改",
	  memo        : "标注"
	},

	follower : {
	  follower    : "追我的人",
	  following   : "我追的人",
	  p           : "还没有人追你哟",
	  all         : "所有"
	},

	following : {
	  follower    : "追我的人",
	  following   : "我追的人",
	  p           : "你还没有追任何人哟",
	  all         : "所有"
	},

	bind : {
	 header   : "您已登录 %s 账户，但尚未将此帐号绑定给clickdang任何帐户。",
	  bind        : "绑定已有帐户",
	  register    : "注册新帐户",
	  bind_ok     : "立即绑定",
	  register_ok : "立即注册"
	},

	findpass : {
	  title       : "找回密码",
	  email       : "邮箱地址",
	  ok          : "确 定",
	  cancel      : "取 消"
	},

	resetpass : {
	  title       : "设置新密码",
	  new_pass    : "新密码",
	  ok          : "确定",
	  reset       : "重置"
	},

	gotosetup : {
	  register_success : "您的注册已完成。我们建议您添加常用的邮件地址，以便能通过发邮件来进行收藏。",
	  ok          : "确 定"
	},

	message : {
	  title         : "消息提示",
	  ok            : "确 定",
	  login_success : "您已成功登录",
	  imageUp_fail  : "您上传的文件不是图片文件",
	  is_null       : "摘录不存在",
	  not_array     : "摘录必须是数组",
	  is_empty      : "摘录不能为空",
	  is_null       : "您还没有添加邮件规则",
	  no_uname      : "在添加邮件之前请先设置用户名",
	  faceUp_success : "您的头像已更新",
	  passwd_success : "您的密码已修改",
	  setRule_success: "您已成功更新邮箱规则",
	  rename_success : "您的用户名已经修改",
	  reclip_null    : "该标签下暂时还没有数据",
	  reclip_tag_success : "恭喜您，收录成功！",
	  reclip_tag_fail: "您已经转拥有这些载录了！",
	  reclip_tag     : "您实际收录了 %s 条载录，其余摘录已经拥有了",
	  comment        : "评论成功",
	  recomm         : "转发成功",
	  reclip         : "收录成功",
	  invite         : "您已通过发往 %s 邮件地址的邀请注册成功。我们建议您立即修改密码并设置自己的用户名。",
	  addemail       : "您已添加 %s 邮件地址。为防止垃圾邮件给您带来困扰，我们需要您进行确认。请查收邮件，点击其中的激活链接。",

	  clip : {
	    has_this_clip: "您已经有该条摘录了",
	    has_recliped : "您已经转载过该条载录了",
	    not_exist    : "摘录不存在",
	    deleted      : "此条摘录已经被删除！",
	    no_public    : "作者没有公开此条摘录！"
	  },
	  content:{
	    is_null      : "摘录不存在",
	    not_array    : "摘录必须是数组",
	    is_empty     : "摘录不能为空"
	  },
	  follow:{
	    all          : "您已经追了该用户的全部标签"
	  },
	  error:{
	    "link 已作废": "此链接已过期",
	    "link doesnt exist": "此链接无效",
	    "link invalidate": "此链接格式有误"
	  },
	  accept:{
	    fail         :"因为间隔时间太长，此注册链接已经失效。您可直接注册，再到设置界面添加您的邮箱地址。"
	  },
	  active:{
	    fail         : "因为间隔时间太长，此激活链接已经失效。您可在设置界面重新添加。",
	    email        : "您已激活 %s 邮件地址。\n您现在可以在登录时使用此邮件地址，并接收来自此邮件地址的收藏。"
	  },
	  email:{
	    no_uname     : "在添加邮件之前请先设置用户名"
	  },
	  rule:{
	    is_null: "您还没有添加邮件规则"
	  }
	},

	warning : {
	  title          : "操作确认",
	  ok             : "确 定",
	  cancel         : "取 消",
	  delemail       : "您真的要删除 %s 邮件地址吗？删除后，您将无法使用此邮件地址登录，也无法接收来自此邮件地址的收藏。",
	  deloauth       : "您真的要删除 %s 账号绑定吗？删除后，您将无法使用此账号进行登录，也无法接收来自此账号的收藏。",
	  del_comment    : "您真的要删除这条评论吗？（此操作无法恢复）"
	}
      },


// english versions
      en : {
	me : {
	  mine      : "My clips",
	  recommend : "@Me",
	  interest  : "Experts",
	  set       : "Setting",
	  logout    : "Sign out",
	  login     : "Log in",
	  register  : "Sign up",
	  ok        : "OK"
	},

	login : {
	  title         : "User log in" ,
	  login_ok      : "Log in",
	  register_ok   : "Sign in",
	  login_state   : "Sign in automatically in one month",
	  register      : "For simpler,just sign up by sending email to 1@cliclip.com",
	  name : {
	    is_null     : "User name is not fill in",
	    not_exist   : "This User name does not exist",
	    invalidate  : "Wrong format of User name",
	    exist       : "User name already exists"
	  },
	  pass : {
	    is_null     : "Password has not fill in",
	    not_match   : "Password input not consistent"
	  }
	},

	userface : {
	  following   : "Following",
	  follow      : "Followed by"
	},

	faceEdit : {
	  no_name     : "You have not User name",
	  set_name    : "Set User name",
	  ok          : "OK",
	  upload      : "Upload image",
	  name : {
	    is_null   : "User name has not yet to fill in",
	    invalidate: "Wrong format of User name",
	    exist     :"User name already exists"
	  }
	},

	languageSet:{
	  lang:"Language Setting"
	},

	ruleEdit : {
	  open_rule   : "Enable clipping",
	  head        : "Email clipping",
	  title       : "Title must include",
	  cc_text     : "Must Cc to",
	  to_text     : "Must send to",
	  update      : "Update setting",
	  cc : {
	    invalidate: "Cc to unrecognized address"
	  },
	  to : {
	    invalidate: "Send to unrecognized address"
	  }
	},

	passEdit : {
	  title       : "Change new password",
	  update      : "Change",
	  danger_operate : "High-risk operation",
	  export      : "Export clips",
	  delete      : "Close your account",
	  is_null     : "Password has not fill in",
	  not_match   : "Password input not consistent",
	  auth_success: "Your password has been changed",
	  newpass : {
	    prompt:"Please input new password",
	    is_null   :"Password has not fill in"
	  },
	  conpass:{
	    prompt:"Confirm password",
	    is_null   :"Password has not fill in"
	  },
	  confirm:{
	    password_diff: "Password input not consistent"
	  }
	},

	emailEdit : {
	  add         : "Add connection",
	  title       : "Connect with email"
	},

	emailAdd : {
	  title       : "Add connection",
	  ok          : "OK",
	  cancel      : "Cancel",
	  email : {
	    is_Exist  : "Email address already exists",
	    you_exist : "You have already add that email address",
	    other_exist:"The email address you added has already been connected with other account in the system",
	    invalidate: "Wrong format of email address",
	    is_null   : "Email address has not fill in"
	  }
	},

	weiboEdit : {
	  title       : "Connect with weibo",
	  add         : "Add connection"
	},
	twitterEdit : {
	  title       : "Connect with twitter",
	  add         : "Add connection"
	},

	clipmemo : {
	  title       : "Tag it",
	  memo        : "Make a note",
	  "private"   : "Private",
	  ok          : "OK",
	  cancel      : "Cancel"
	},

	editDetail : {
	  upload      : "Upload image",
	  link        : "Web image",
	  clear       : "Tidy format",
	  update      : "Edit",
	  ok          : "OK",
	  ok_title    : "Save",
	  cancel      : "Cancel",
	  cancel_title: "Quit"
	},

	delete : {
	  title       : "Delete",
	  h3          : "You really mean to delete?",
	  p           : "Can't restore any more after deleting",
	  ok          : "OK",
	  cancel      : "Cancel"
	},

	reclip : {
	  title       : "Reclip",
	  defaultNote : "Make a note",
	  "private"   : "Private",
	  ok          : "OK",
	  cancel      : "Cancel"
	},

	reclipTag : {
	  title       : 'You will reclip %d clips',
	  defaultNote : "Make a note",
	  "private"   : "Private",
	  ok          : "OK",
	  cancel      : "Cancel"
	},

	recommend :{
	  title       : "@",
	  defaultText : "Say something",
	  reclip      : "Reclip too",
	  ok          : "OK",
	  cancel      : "Cancel",
	  is_null     : "Please add the receiver",
	  not_exist   : "The receiver doesn't exist",
	  is_null     :"Please add comments first",
	  recomm_name : {
	    is_null   : "Please add the receiver",
	    not_exist : "The receiver doesn't exist"
	  },
	  recomm_text : {
	    is_null   :"Please add comments first"
	  }
	},

	comment : {
	  title       : "Comment",
	  defaultText : "Say something",
	  reclip      : "Reclip too",
	  ok          : "OK",
	  cancel      : "Cancel"
	},

	detail : {
	  route       : "Map",
	  comment     : "Comment",
	  recommend   : "@",
	  reclip      : "Reclip",
	  delete      : "Delete",
	  update      : "Edit",
	  memo        : "Tag"
	},

	showcomment : {
	  reply       : "Reply",
	  delete      : "Delete"
	},

	addcomm : {
	  defaultText : "Say something",
	  reclip      : "Reclip too",
	  commentOK   : "Comment",
	  cancel      : "Cancel"
	},

	addClip : {
	  title       : "Add",
	  upload      : "&nbspUpload image",
	  link        : "Web image",
	  ok          : "OK",
	  clear       : "Tidy format",
	  cancel      : "Cancel",
	  back        : "Back",
	  clean       : "Clear"
	},

	clippreview : {
	  reprint     : "Reclip",
	  reply       : "Reply",
	  comment     : "Comment",
	  recommend   : "@",
	  reclip      : "Reclip",
	  delete      : "Delete",
	  update      : "Edit",
	  memo        : "Tag"
	},

	follower : {
	  follower    : "Followed by",
	  following   : "Following",
	  p           : "Nobody follows you!",
	  all         : "All"
	},

	following : {
	  follower    : "Followed by",
	  following   : "Following",
	  p           : "Nobody follows you!",
	  all         : "All"
	},

	bind : {
	  header      : "You have logged in %s ,while not connecting it with any Cliclip account",
	  bind        : "Connect with current account",
	  register    : "Sign up new account",
	  bind_ok     : "Connect now",
	  register_ok : "Sign up now"
	},

	findpass : {
	  title       : "Retrieve password",
	  email       : "Email address",
	  ok          : "OK",
	  cancel      : "Cancel"
	},

	resetpass : {
	  title       : "Set new password",
	  new_pass    : "New password",
	  ok          : "OK",
	  reset       : "Reset"
	},

	gotosetup : {
	  register_success : "Congratulation! You just finished registration. We suggest you add the most used email address to clip conveniently by sending email",
	  ok          : "OK"
	},

	message : {
	  title         : "Notice",
	  ok            : "OK",
	  login_success : "Log in successfully",
	  imageUp_fail  : "The file you upload is NOT an image",
	  is_null       : "Clip not exist",
	  not_array     : "Clip must be array",
	  is_empty      : "Clip can't be empty",
	  is_null       : "You haven't set the rule of email connection",
	  no_uname      : "Please set User name before add email connection",
	  faceUp_success : "Your portrait has been updated",
	  passwd_success : "Your password has been changed",
	  setRule_success: "Your rule of email connection has been updated",
	  rename_success : "Your User name has been changed",
	  reclip_null    : "No clip under thist tag",
	  reclip_tag_success : "Congratulation for successful reclip",
	  reclip_tag_fail: "You have these clips already",
	  reclip_tag     : "You reclip %s clips，not including the clips you already have",
	  recomm         : "Your clip @ successfully",
	  invite         : "Successful registration by sending email %s. We strongly suggest you change password immediately and set your own username",
	  addemail       : "You have added %s email connection.We need your confirmation to prevent junk mail. Please check the email and click the activating link",
	  pre_active     : "You have activated the email address of %s in our system. Now you can sign in with this email account and clip by sending email from this account",
	  cliplist_null:"Sorry，have not found appropriate clauses......",
	  clip : {
	    has_this_clip: "You have this clip already",
	    has_recliped : "You reclip this clip already",
	    not_exist    : "This Clip doesn't  exist",
	    deleted      : "This Clip has been deleted",
	    no_public    : "This Clip is private"
	  },
	  content:{
	    is_null      : "This Content doesn't exist",
	    not_array    : "Content must be array",
	    is_empty     : "Content can't be empty"
	  },
	  follow:{
	    all          : "You have already followed all tags of this user"
	  },
	  error:{
	    "link 已作废": "Overdue link",
	    "link doesnt exist": "Invalid link",
	    "link invalidate": "Wrong format link"
	  },
	  accept:{
	    fail         :"Registration link was overdue for too long interval. You can sign in directly and add email address connection in Setting"
	  },
	  active:{
	    fail         : "Registration link was overdue for too long interval. You can add again in Setting"
	  },
	  email:{
	    no_uname     : "Set your user name before adding mail address connection"
	  },
	  rule:{
	    is_null: "You haven’t set the rule of email connection"
	  }
	},

	warning : {
	  title          : "Confirm",
	  ok             : "OK",
	  cancel         : "Cancel",
	  delemail       : "You really mean to delete the connection with email address %s? After deleting, you can’t use this email address to log in or send email from this address to clip",
	  deloauth       : "You really mean to delete the connection with account %s? After deleting, you can’t use this twitter account to log in or send message from it to clip",
	  del_comment    : "You really mean to delete this comment? It can’t restore any more"
	}
      }
    };

    window._i18n = function(){
      var lang = getLanguage();
      var args = Array.prototype.slice.call(arguments);
      var name = args.shift();
      var names = name.split('.');
      var str = i18n[lang]?i18n[lang]:i18n['zh'];
      for(var i =0;i<names.length;i++){
	if(str[names[i]]) {
	  str = str[names[i]];
	}else{
	  console.info(name+"  未定义!!!");
	  str = names.pop();
	}
      }
      var params = args;
      if (params.length > 0){
	str = $.sprintf(str, params);
      }
      return str;
    };
    versions.getLang = getLanguage;
    function getLanguage(){
      if (getCookieLang()) {
	return getCookieLang();
      } else if(window.navigator.language){
	return window.navigator.language.split("-")[0];
      } else{
	return "zh";
      }
    }

    function setLanguage(lang){
      setCookieLang(lang);
      window.location.reload();
    }

    function getCookieLang(){
      return App.util.getCookie("language");
    }

    function setCookieLang(lang){
      var data = new Date();
      data.setTime(data.getTime() + 30*24*60*60*1000);
      document.cookie = "language="+lang+";expires=" + data.toGMTString();
    }
    App.vent.bind("app.clipapp.versions:change",function(lang){
      if(getLanguage() != lang){
	setLanguage(lang);
      }
    });

  return versions;
})(jQuery);