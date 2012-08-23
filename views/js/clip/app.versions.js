App.versions = (function($){
  var versions = {};
  versions.language = {zh:"中文",en:"English"};
  var i18n = {
    // 中文版
    zh : {
      me : {
	mine      : "我的",
	recommend : "@我",
	interest  : "朋友",
	set       : "&nbsp;&nbsp;设置",
	logout    : "&nbsp;&nbsp;登出",
	login     : "登 录",
	register  : "注 册",
	ok        : "确 定"
      },

      login : {
	default_name  : "用户名/Email",
	title       : "用户登录" ,
	login_ok    : "登 录",
	register_ok : "注 册",
	login_state : "在此浏览器保持登录",
	findpass    : "忘记密码请<a href = '/#password/find' >点这里</a>",
	register    : "注 册",
	twitter     : "通过 Twitter 登录",
	weibo       : "通过微博登录",
	name : {
	  name      : "用户名",
	  is_null    : "用户名尚未填写",
	  not_exist   : "用户名不存在",
	  invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	  exist       : "此用户名已经存在"
	},
	pass : {
	  pass : "密码",
	  is_null     : "密码尚未填写",
	  not_match   : "您的密码不正确"
	}
      },
      register : {
	title       : "用户注册" ,
	register_ok : "注 册",
	login       : "登 录",
	register_state : "同意<a href='#'>户用协议</a>",
	register    : "嫌麻烦？直接发邮件到<a href='mailto:1@cliclip.com'>1@cliclip.com</a>也可注册",
	name : {
	  name      : "用户名",
	  is_null    : "用户名尚未填写",
	  not_exist   : "用户名不存在",
	  invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	  not_allow   : "此用户名不允许注册",
	  exist       : "此用户名已经存在"
	},
	pass : {
	  pass : "密码",
	  is_null     : "密码尚未填写"
	}
      },

      userface : {
	zhui        : "zhui",
	stop        : "stop",
	mfollowing  : "我追的",
	mfollow     : "追我的",
	following   : "ta追的",
	follow      : "追ta的",
	mysearch    : "搜我的摘录",
	search      : "搜ta的摘录",
	tsearch      : "搜索"
      },

      bubb : {
	follow      : "追",
	unfollow    : "停",
	reclip      : "收"
      },

      faceEdit : {
	title       : "设置",
	no_name     : "无名氏",
	set_name    : "设置用户名",
	ok          : "确 定",
	upload      : "上传本地图像",
	name : {
	  is_null    : "请填写用户名",
	  invalidate  : "用户名格式有误（只能是长度为5-20个字符的英文、数字和点的组合）",
	  exist       : "此用户名已经存在"
	}
      },

      languageSet:{
	lang : "界面语言"
      },

      ruleEdit : {
	head        : "邮件摘录反垃圾规则",
	open_rule   : "启用",
	desc        : "不符合规则的邮件会被当作是垃圾邮件",
	title       : "标题必须有",
	cc_text     : "必须抄送给",
	to_text     : "必须发给",
	update      : "更新规则",
	cc : {
	  invalidate  : "抄送人中含有无法辨识的邮件地址"
	},
	to : {
	  invalidate  : "收件人中含有无法辨识的邮件地址"
	}
      },

      passEdit : {
	title       : "修改密码",
	update      : "更 改",
	danger_operate : "高危操作",
	export      : "导出摘录",
	delete      : "删除账户",
	is_null     : "密码尚未填写",
	not_match   : "两次输入的密码不一致",
	auth_success: "您的密码已更改",
	newpass : {
	  prompt:"请输入新密码",
	  is_null:"请输入新密码"
	},
	conpass:{
	  prompt:"再次输入新密码",
	  is_null:"请再次输入相同的密码"
	},
	confirm:{
	  password_diff: "两次输入的密码不一致"
	}
      },

      emailEdit : {
	title       : "邮件摘录",
	add         : "增加邮箱",
	del         : "删除邮箱"
      },

      emailAdd : {
	title       : "增加邮箱",
	ok          : "确 定",
	cancel      : "取 消",
	email : {
	  is_Exist  : "邮件地址已经存在",
	  you_exist : "您已经添加过该邮件地址",
	  other_exist:"您所添加的邮件地址已经在系统中了",
	  invalidate: "邮件地址格式有误",
	  is_null   : "请输入邮件地址"
	}
      },

      weiboEdit : {
	title       : "微博摘录",
	add         : "关联微博帐号",
	del         : "删除微博账号"
      },
      twitterEdit : {
	title       : "Twitter摘录",
	add         : "关联Twitter帐号",
	del         : "删除Twitter账号"
      },

      clipmemo : {
	title       : "标注",
	memo        : "备注一下吧~",
	"private"   : "不公开",
	ok          : "确 定",
	cancel      : "取 消"
      },

      editDetail : {
	note_message: "添加标注",
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
	p           : "删除操作无法恢复",
	ok          : "确 定",
	cancel      : "取 消"
      },

      reclip : {
	title       : "转载",
	defaultNote : "备注一下吧~",
	"private"   : "不公开",
	ok          : "确 定",
	cancel      : "取 消"
      },

      reclipTag : {
	title       : '您将转摘%d条数据',
	defaultNote : "备注一下吧~",
	"private"   : "不公开",
	ok          : "确 定",
	cancel      : "取 消"
      },

      recommend :{
	title       : "转发",
	defaultText : "说点啥吧～(140字以内)",
	reclip      : "同时转摘",
	ok          : "确 定",
	cancel      : "取 消",
	is_null     : "请添加用户",
	not_exist   : "您添加的用户不存在",
	is_null     : "请您先设置推荐备注",
	recomm_name : {
	  is_null   : "请添加用户名",
	  not_exist : "您添加的用户不存在"
	},
	recomm_text : {
	  is_null   : "请您先设置推荐备注",
	  word_limit :"请把文字长度限制在140字以内"
	}
      },

      comment : {
	title       : "评论",
	defaultText : "说点什么吧~(140字以内)",
	reclip      : "同时转摘",
	comm_text   : {
	  is_null   : "评论内容为空",
	  word_limit :"请把文字长度限制在140字以内"
	},
	ok          : "确 定",
	cancel      : "取 消"
      },

      detail : {
	route       : "录线图",
	comment     : "评论",
	recommend   : "转发",
	reclip      : "转摘",
	delete      : "删除",
	update      : "修改",
	memo        : "标注"
      },

      showcomment : {
	reply       : "回复",
	delete      : "删除",
	text        : "此内容已被删除",
	pack        : "(收起)",
	open        : "(展开)"
      },

      addcomm : {
	defaultText : "说点什么吧~",
	reclip      : "同时转摘",
	commentOK   : "评论",
	cancel      : "取消"
      },

      addClip : {
	title       : "新建摘录",
	note_message: "添加标注",
	upload      : "上传图片",
	link        : "链接图片",
	clear       : "整理格式",
	ok          : "确 定",
	cancel      : "取 消",
	back        : "返 回",
	clean       : "清 空"
      },

      clippreview : {
	reprint     : "转摘",
	reply       : "评论",
	comment     : "评论",
	recommend   : "转发",
	reclip      : "转摘",
	delete      : "删除",
	update      : "修改",
	memo        : "标注"
      },

      follower : {
	mfollower   : "追我的",
	mfollowing  : "我追的",
	follower    : "追ta的",
	following   : "ta追的",
	p           : "还没有人追你哟",
	all         : "所有"
      },

      following : {
	mfollower   : "追我的",
	mfollowing  : "我追的",
	follower    : "追ta的",
	following   : "ta追的",
	p           : "你还没有追任何人哟",
	all         : "所有"
      },

      bind : {
	header   : "您已登录 %s 账户，但此帐户尚未将关联任何点忆帐户。",
	bind        : "关联已有帐户",
	register    : "注册新帐户",
	bind_ok     : "立即关联",
	register_ok : "立即注册"
      },

      findpass : {
	address: {
	  is_null   : "请输入您绑定的邮件地址",
	  not_found : "我们找不到你的账户",
	  invalidate: "邮件地址格式有误"
	},
	title       : "找回密码",
	email       : "邮箱地址",
	ok          : "确 定",
	cancel      : "取 消"
      },

      resetpass : {
	newpass : {
	  is_null:"请输入新密码"
	},
	conpass:{
	  is_null:"请再次输入相同的密码"
	},
	confirm:{
	  password_diff: "两次输入的密码不一致"
	},
	title       : "设置新密码",
	new_pass    : "新密码",
	ok          : "确定",
	reset       : "重置"
      },

      gotosetup : {
	register_success : "您的注册已完成。下一步，您可添加常用的邮件地址。",
	ok          : "确 定"
      },

      tag:{
	add_tag     : "添加标签",
	beyond      : "标签过长，最多支持5个汉字、10个英文字母或数字"
      },

      queryclip:{
	add         : "新建摘录",
	search      : "搜索"
      },

      feed:{
	feedback    : "意见反馈"
      },

      feedback:{
	title       : "意见反馈",
	ok          : "确定",
	cancel      : "取消",
	defaultText : "描述你的建议：(140字以内)",
	feedback_text   : {
	  is_null   : "评论内容为空",
	  word_limit :"请把文字长度限制在140字以内"
	}
      },

      message : {
	title         : "消息提示",
	ok            : "确 定",
	login_success : "您已成功登录",
	imageUp_error : "您上传的文件不是图片文件",
	imageUp_fail  : "对不起，上传失败",
	img_alt       : "对不起，图片加载失败",
	is_null       : "摘录不存在",
	not_array     : "摘录必须是数组",
	is_empty      : "摘录没有内容",
	no_uname      : "请先设置用户名",
	faceUp_success : "您的头像已更新",
	passwd_success : "您的密码已修改",
	resetpwd_success:"您的密码已重置",
	setRule_success: "您已成功更新邮箱摘录反垃圾规则",
	rename_success : "您的用户名已经修改",
	reclip_null    : "该标签下暂时还没有数据",
	reclip_tag_success : "恭喜您，转摘成功！",
	reclip_tag_fail: "您已经拥有这些摘录了！",
	reclip_tag     : "您成功转摘了 %s 条摘录",
	comment        : "评论成功",
	recomm         : "转发成功",
	feedback_ok    : "发送成功",
	feedback_fail  : "发送失败",
	go_resetpass   : "找回密码邮件已经发送至 %s 邮箱，请在30分钟内从邮件中获取链接重置密码",
	link:{
	  expired: "此链接已过期",
	  not_exists: "此链接无效",
	  invalidate: "此链接格式有误"
	},
	account_hasbind : "您的帐号之前已经做过关联，若要重新关联，请先解绑",
	weibo_sucmsg   : "恭喜您，微博帐号 %s 关联成功，在新浪微博中 @cliclip 就可以摘录到点忆(评论除外)，现在就去 @ 一条<a href='http://weibo.com' target='_blank'>试试</a>？",
	twitter_sucmsg :"恭喜您，Twitter帐号 %s 已关联成功，您在 Twitter 的收藏(评论除外)可以直接摘录到点忆，现在就去收藏一条<a href='http://twitter.com' target='_blank'>试试</a>？",
	InternalOAuthError:"认证失败，请重试",
	reclip:{
	  success: "转摘成功",
	  no_pub: "作者没有公开该条摘录，您暂时不能转摘"
	},
	invite         : "您已通过发往 %s 邮件地址的邀请注册成功。我们建议您立即修改密码并设置自己的用户名。",
	addemail       : "您已成功添加 %s 邮件地址。请登录您的邮箱，查收邮件，并点击其中的链接进行激活。",
	cliplist_null:{
	  all:"抱歉，没有找到相关的信息......",
	  my:"抱歉，没有找到相关的信息......",
	  interest:"抱歉，没有找到相关的信息......",
	  recommend:"抱歉，没有找到相关的信息......"
	},
	error_message :"操作失败，请重试",
	clip : {
	  has_this_clip: "您已经有该条摘录了",
	  has_recliped : "您已经转摘过该条摘录了",
	  not_exist    : "摘录不存在",
	  deleted      : "此条摘录已经被删除！",
	  no_public    : "作者没有公开此条摘录！"
	},
	content:{
	  is_null      : "摘录内容不能为空",
	  not_array    : "摘录必须是数组",
	  is_empty     : "摘录不能为空",
	  no_change    : "摘录内容没有变化"
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
	  fail         :"此注册链接已过期。您可直接注册，再到设置界面添加您的邮箱地址。"
	},
	active:{
	  fail         : "此激活链接已过期。您可在设置界面重新添加。",
	  email        : "您已激活 %s 邮箱地址。\n可以使用该邮箱地址进行登录，您使用该地址发到1@cliclip.com的邮件，会保存为您的私有摘录。"
	},
	email:{
	  no_uname     : "请先设置用户名"
	},
	rule:{
	  not_update   : "您没有设置邮件摘录的反垃圾规则"
	},
	recommend:{
	  no_pub      : "这条摘录是私有数据，您不能进行推荐"
	}
      },

      warning : {
	title          : "操作确认",
	ok             : "确 定",
	cancel         : "取 消",
	no_name        : "您还没有设置用户名，目前只能进行摘录的增加、修改、删除操作。请设置用户名，开启更多操作",
	delemail       : "您真的要删除 %s 邮件地址吗？",
	deloauth       : "您真的要删除 %s 账号关联吗？",
	oauth_fail     : "认证失败，请重新认证！",
	del_oauth_fail : "解除关联出问题啦，再试一次吧",
	memo_save      : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	clipedit_save  : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	reclip_save    : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	recommend_save : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	comment_save   : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	clipadd_save   : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	emailadd_save  : "&nbsp;&nbsp;关闭窗口，您填写的内容将不会被保存,<br>请确认。</br>",
	del_comment    : "您真的要删除这条评论吗？",
	auth:{
	  no_name     : "请先设置您的用户名",
	  not_login   : "请您先登录",
	  not_self    : "您的登录以过期，请从新登录",
	  not_owner   : "您的登录以过期，请从新登录"
	}
      },
      util : {
	time:{
	  moment:"刚刚",
	  second:"秒前",
	  minute:"分钟前",
	  hour:"小时前",
	  day:"天前",
	  week:"周前",
	  month:"月前",
	  half_year:"半年前",
	  year:"年前"
	}
      }
    },


// english versions
    en : {
      me : {
	mine      : "My clips",
	recommend : "@Me",
	interest  : "Friends",
	set       : "Settings",
	logout    : "Logout",
	login     : "Login",
	register  : "Register",
	ok        : "OK"
      },

      login : {
	default_name  : "User name/Email",
	title         : "User log in" ,
	login_ok      : "Login",
	register_ok   : "Register",
	findpass      : "Forgot your password <a href = '/#password/find' >click here</a>",
	login_state   : "Keep me logged in",
	register      : "Register",
	twitter       : "Login with Twitter",
	weibo         : "Login with Weibo",
	name : {
	  name        : "User name",
	  is_null     : "User name is missing",
	  not_exist   : "This user name does not exist",
	  invalidate  : "Invalid format of user name(Username may only contain alphanumerics, period, and be between 5 and 20 characters in length)",
	  exist       : "This user name already exists"
	},
	pass : {
	  pass        : "Password",
	  is_null     : "Password is missing",
	  not_match   : "Password is incorrect"
	}
      },

      register : {
	title         : "User log in" ,
	register_ok   : "Register",
	register      : "Register by simply sending an email to <a href='mailto:1@cliclip.com'>1@cliclip.com</a>",
	login         : "Login",
	register_state: "Agree to <a href='#'>user agreement</a>",
	name : {
	  name        : "User name",
	  is_null     : "User name is missing",
	  not_exist   : "This user name does not exist",
	  invalidate  : "Invalid format of user name(Username may only contain alphanumerics, period, and be between 5 and 20 characters in length)",
	  not_allow   : "This user name not allow register",
	  exist       : "This user name already exists"
	},
	pass : {
	  pass        : "Password",
	  is_null     : "Password is missing",
	  not_match   : "Password is incorrect"
	}
      },

      userface : {
	zhui        : "ezhui",
	stop        : "estop",
	mfollowing  : "Following",
	mfollow     : "Followed by",
	following   : "Following",
	follow      : "Followed by",
	mysearch    : "search my clip",
	search      : "search his clip",
	tsearch     : "Search"
      },

      bubb : {
	follow      : "follow",
	unfollow    : "unfollow",
	reclip      : "reclip"
      },

      faceEdit : {
	title       : "Settings",
	no_name     : "NO NAME",
	set_name    : "Set user name",
	ok          : "OK",
	upload      : "Upload image",
	name : {
	  is_null   : "User name is missing",
	  invalidate: "Invalid format of user name(user name may only contain alphanumerics, period, and be between 5 and 20 characters in length)",
	  exist     :"This user name already exists"
	}
      },

      languageSet:{
	lang:"Language setting"
      },

      ruleEdit : {
	open_rule   : "Enable",
	head        : "Spam filter rules",
	desc        : "Emails compliant with following rules will NOT be considered as spam",
	title       : "Title includes",
	cc_text     : "Cc‘d to",
	to_text     : "Sent to",
	update      : "Update",
	cc : {
	  invalidate: "Invalid email address"
	},
	to : {
	  invalidate: "Invalid email address"
	}
      },

      passEdit : {
	title       : "Change password",
	update      : "Change",
	danger_operate : "High-risk operations",
	export      : "Export clips",
	delete      : "Close your account",
	is_null     : "Password is missing",
	not_match   : "Password input not consistent",
	auth_success: "Password changed successfully",
	newpass : {
	  prompt:"Please enter new password",
	  is_null   :"Password is missing"
	},
	conpass:{
	  prompt:"Please re-enter new password",
	  is_null   :"Enter the same password"
	},
	confirm:{
	  password_diff: "Inconsistent password"
	}
      },

      emailEdit : {
	add         : "Add",
	title       : "Recognized emails",
	del         : "Delete Email"
      },

      emailAdd : {
	title       : "Add email",
	ok          : "OK",
	cancel      : "Cancel",
	email : {
	  is_Exist  : "Email address already exists",
	  you_exist : "You have already added that email address",
	  other_exist:"The email address you added has already been connected with other account in the system",
	  invalidate: "Invalid format of email address",
	  is_null   : "Email is missing"
	}
      },

      weiboEdit : {
	title       : "Recognized Weibo accounts",
	add         : "Add",
	del         : "Delete Weibo account"
      },
      twitterEdit : {
	title       : "Recognized twitter accounts",
	add         : "Add",
	del         : "Delete Twitter account"
      },

      clipmemo : {
	title       : "Tag it",
	memo        : "Type your note here",
	"private"   : "Private",
	ok          : "OK",
	cancel      : "Cancel"
      },

      editDetail : {
	note_message: "add notes",
	upload      : "Upload image",
	link        : "Web image",
	clear       : "Auto re-format",
	update      : "Edit",
	ok          : "OK",
	ok_title    : "Save",
	cancel      : "Cancel",
	cancel_title: "Quit"
      },

      delete : {
	title       : "Delete",
	h3          : "Do you really want to delete?",
	p           : "This clip will be deleted forever",
	ok          : "OK",
	cancel      : "Cancel"
      },

      reclip : {
	title       : "Reclip",
	defaultNote : "Type your note here",
	"private"   : "Private",
	ok          : "OK",
	cancel      : "Cancel"
      },

      reclipTag : {
	title       : 'You will reclip %d clips',
	defaultNote : "Type your note here",
	"private"   : "Private",
	ok          : "OK",
	cancel      : "Cancel"
      },

      recommend :{
	title       : "@",
	defaultText : "Say something (limited to 140 characters)",
	reclip      : "Reclip too",
	ok          : "OK",
	cancel      : "Cancel",
	is_null     : "Please add the recipient",
	not_exist   : "The recipient doesn't exist",
	is_null     :"Please add comments first",
	recomm_name : {
	  is_null   : "Please add the recipient",
	  not_exist : "The recipient doesn't exist"
	},
	recomm_text : {
	  is_null   :"Please add comments first",
	  word_limit :"Please limit your comments to 140 characters"
	}
      },

      comment : {
	title       : "Comment",
	defaultText : "Say something (limited to 140 characters)",
	comm_text   : {
	  is_null : "Please enter comments",
	  word_limit :"Please limited your comments to 140 characters",
	  defaultText : "Say something"
	},
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
	delete      : "Delete",
	text        : "The comment has been removed",
	pack        : "(Collapse)",
	open        : "(Expand)"
      },

      addcomm : {
	defaultText : "Say something",
	reclip      : "Reclip too",
	commentOK   : "Comment",
	cancel      : "Cancel"
      },

      addClip : {
	note_message:"add notes",
	title       : "new clip",
	upload      : "Upload image",
	link        : "Web image",
	clear       : "Auto re-format",
	ok          : "OK",
	cancel      : "Cancel",
	back        : "Back",
	clean       : "Clear"
      },

      clippreview : {
	reprint     : "reclip(s)",
	reply       : "comment(s)",
	comment     : "Comment",
	recommend   : "@",
	reclip      : "Reclip",
	delete      : "Delete",
	update      : "Edit",
	memo        : "Tag"
      },

      follower : {
	mfollower   : "Followed by",
	mfollowing  : "Following",
	follower    : "Followed by",
	following   : "Following",
	p           : "Nobody is following you",
	all         : "All"
      },

      following : {
	mfollower   : "Followed by",
	mfollowing  : "Following",
	follower    : "Followed by",
	following   : "Following",
	p           : "You are not following anyone",
	all         : "All"
      },

      bind : {
	header      : "You have logged in with %s account, which is not connected with any Cliclip account",
	bind        : "Connect",
	register    : "Create",
	bind_ok     : "Connect now",
	register_ok : "Create now"
      },

      findpass : {
	address : {
	  is_null   : "Please enter a email address",
	  not_found : "This email doesn't belong to any account",
	  invalidate: "Invalid email address"
	},
	title       : "Retrieve password",
	email       : "Email address",
	ok          : "OK",
	cancel      : "Cancel"
      },

      resetpass : {
	newpass : {
	  is_null   :"Password is missing"
	},
	conpass:{
	  is_null   :"Enter the same password"
	},
	confirm:{
	  password_diff: "Inconsistent password"
	},
	title       : "Set new password",
	new_pass    : "New password",
	ok          : "OK",
	reset       : "Reset"
      },

      gotosetup : {
	register_success : "Congratulations! The registration is completed. Your next step is to add your email address",
	ok          : "OK"
      },

      tag:{
	add_tag     : "Add a tag",
	beyond      : "Tag is too long (maximum 5 Chinese characters, 10 letters or numbers)"
      },

      queryclip:{
	add         : "Add Clip",
	search      : "Search"
      },

      feed:{
	feedback    : "feedback"
      },

      feedback:{
	title       : "feedback",
	ok          : "OK",
	cancel      : "Cancel",
	defaultText : "Describe your suggestion (limited to 140 characters)",
	feedback_text   : {
	  is_null : "Please enter comments",
	  word_limit :"Please limited your comments to 140 characters"
	}
      },

      message : {
	title         : "Notice",
	ok            : "OK",
	login_success : "Log in successfully",
	imageUp_error : "The file is not an image",
	imageUp_fail  : "Sorry, image failed to upload",
	img_alt       : "Image failed to load",
	is_null       : "Clip does not exist",
	not_array     : "Clip must be array",
	is_empty      : "Clip cannot be empty",
	no_uname      : "Please set user name first",
	faceUp_success : "Your photo has been updated",
	passwd_success : "Your password has been changed",
	resetpwd_success :"Your password has been reseted",
	setRule_success: "Your rule for spam filter has been updated",
	rename_success : "Your User name has been changed",
	reclip_null    : "No clip under this tag",
	reclip_tag_success : "Reclip successful",
	go_resetpass  : "The findpass email has send to %s,please check in 30 minuts ",
	link:{
	  expired: "Link expired",
	  not_exists: "Invalid link",
	  invalidate: "Invalid link format"
	},
	reclip_tag_fail: "You have reclipped these already",
	reclip_tag     : "You have successfully reclipped %s new clips",
	reclip:{
	  success:"Recliped successfully",
	  no_pub: "This Clip is private, so you cannot reclip it"
	},
	recomm         : "Clip was forwarded(@) successfully",
	comment        : "Commented successfully",
	feedback_ok    : "Send successfully",
	feedback_fail  : "Send Fail",
	account_hasbind:"This account has been used before. Please enter another account",
	weibo_sucmsg:"Connect Sina Weibo account %s successfully. Now you can reclip clips from Sina Weibo(except comments), just @cliclip, <a href='http://weibo.com' target='_blank'>enjoy</a>!",
	twitter_sucmsg:"Connect Twitter account %s successfully. Now you can reclip clips from Twitter Favorite(except comments), <a href='http://twitter.com' target='_blank'>enjoy</a>!",
	InternalOAuthError:"Connection failed. Please try again.",
	invite         : "Successful registration by sending email %s. We strongly suggest you change password immediately and set your own username",
	addemail       : "You have added %s email. The activation link has been sent to this email account. Please check your email and click the activation link.",
	cliplist_null:{
	  all:"Sorry, no results found",
	  my:"Sorry, no results found",
	  interest:"Sorry, no results found",
	  recommend:"Sorry, no results found"
	},
	"error_message" :"Operation fail,please try again!",
	clip : {
	  has_this_clip: "You have this clip already",
	  has_recliped : "You have reclipped this already",
	  not_exist    : "This Clip doesn't  exist",
	  deleted      : "This Clip has been deleted",
	  no_public    : "This Clip is private"
	},
	content:{
	  is_null      : "Content can't be null",
	  not_array    : "Content must be array",
	  is_empty     : "Content can't be empty",
	  no_change    : "Content dose't change"
	},
	follow:{
	  all          : "You have already followed all tags of this user"
	},
	error:{
	  "link 已作废": "Link expired",
	  "link doesnt exist": "Invalid link",
	  "link invalidate": "Invalid link format"
	},
	accept:{
	  fail         :"Registration link expired. You can Register directly and add email address in Setting"
	},
	active:{
	  fail         : "Activation link expired. You can add email again in Setting",
	  email   : "You have activated %s in our system. \nNow you can log in with this email account and clip by sending email from this account to 1@cliclip.com. Clips will be saved as private."
	},
	email:{
	  no_uname     : "Set your user name first"
	},
	rule:{
	  not_update   : "You have not set the rules for spam filter"
	},
	recommend:{
	  no_pub      :"This clip is private. You cannot recommend to others"
	}
      },

      warning : {
	title          : "Confirm",
	ok             : "OK",
	cancel         : "Cancel",
	no_name        : "Without user name, you can only add, update and delete clips. Please set your user name to enable more actions.",

	delemail       : "Do you really want to delete this email %s?",
	deloauth       : "Do you really want to delete this account %s?",
	oauth_fail   : "Authentication failed. Please try again",
	del_oauth_fail : "Delete account occur problem. Please try again",
	del_comment    : "Do you really want to delete this comment?",
	memo_save     :"If you close the window, what you entered will be lost. Are you sure?",
	clipedit_save :"If you close the window, what you entered will be lost. Are you sure?",
	reclip_save   :"If you close the window, what you entered will be lost. Are you sure?",
	recommend_save:"If you close the window, what you entered will be lost. Are you sure?",
	comment_save  :"If you close the window, what you entered will be lost. Are you sure?",
	clipadd_save  :"If you close the window, what you entered will be lost. Are you sure?",
	emailadd_save :"If you close the window, what you entered will be lost. Are you sure?",
	go_resetpass  : "The findpass email has send to %s,please check in 30 minuts ",
	del_comment   : "You really mean to delete this comment? It can’t restore any more",
	auth:{
	  no_name     : "Please set user name first",
	  not_login   : "Please log in first",
	  not_self    : "Your login expired,login in again",
	  not_owner   : "Your login expired,login in again"
	}
      },
      util : {
	time:{
	  moment:"a moment ago",
	  second:" second(s) ago ",
	  minute:" minute(s) ago",
	  hour:" hour(s) ago",
	  day:" day(s) ago",
	  week:" week(s) ago",
	  month:" month(s) ago",
	  half_year:" six months ago",
	  year:" year(s) ago"
	}
      }
    }
  };

  window._i18n = function(){
    var lang = versions.getLanguage();
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

  versions.getLanguage = function() {
    var cookie_lang = App.util.getCookie("language");
    if(cookie_lang){
      return cookie_lang;
    } else if(window.navigator.language){
      return window.navigator.language.split("-")[0];
    } else{
      return "zh";
    }
  };

  App.vent.bind("app.versions:version_change", function(lang){
    versions.setLanguage(lang);
  });


  versions.setLanguage = function(lang){
    if(versions.getLanguage() != lang){
      setCookieLang(lang);
      window.location.reload();
    }
  };

  function setCookieLang(lang){
    var data = new Date();
    data.setTime(data.getTime() + 30*24*60*60*1000);
    document.cookie = "language="+lang+";expires=" + data.toGMTString();
  }

  return versions;
})(jQuery);