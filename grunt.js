module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      all: ['views/js/clip/*.js','views/js/lib/png.js','views/js/lib/html5.js','views/js/user/*.js','views/js/*.js','grunt.js']
    },
    img:{
      task1: {
	 src: ['views/img/*.jpg'],
	 dest:'tmp/views/img'
      },
      task2: {
	src: ['views/img/*.png'],
	dest:'tmp/views/img'
      }/*,
      task3: {
	src: ['views/img/*.gif'],
	dest:'views/img-min'
      }*/
    },
    less: {
      compile: {
	options: {
	  paths: ["tmp/views/css","views/css"]
	},
	files: {
	  "tmp/views/css/ie7.css":"views/css/ie7.less",
	  "tmp/views/css/ie6.css":"views/css/ie6.less",
	  "tmp/views/css/app.css":"views/css/style.less",
	  "tmp/views/css/clipper.css":"views/css/bookmark.less"
	}
      }
    },
    mincss: {
      "tmp/views/css/clipper.css": ["views/css/uploadImage.css","views/css/jquery.tagsinput.css","views/css/clipper.css"],
      "tmp/views/css/app.css": ["views/css/uploadImage.css","views/css/jquery.tagsinput.css","tmp/views/css/app.css"],
      "tmp/views/css/ie7.css":["tmp/views/css/ie7.css"],
      "tmp/views/css/ie6.css":["tmp/views/css/ie6.css"]
    },
    concat: {
      "tmp/views/js/app_tmp.js":[
	"views/js/lib/backbone.marionette.js",
	"views/js/app-base.js",
	"views/js/ga.js",
        "views/js/lib/modernizr.js",
	"views/js/lib/jquery.printf.js",
	"views/js/lib/jquery.masonry.js",
	"views/js/lib/jquery.tagsinput.js",
	"views/js/lib/easyXDM.debug.js",
	"views/js/user/app.userapp.js",
	"views/js/clip/app.clipapp.js",
	"views/js/clip/app.clipapp.url.js",
	"views/js/clip/app.util.js",
	"views/js/clip/app.convert.js",
	"views/js/clip/app.versions.js",
	"views/js/clip/app.editpaste.js",
	"views/js/clip/app.clipapp.register.js",
	"views/js/clip/app.clipapp.gotosetup.js",
	"views/js/clip/app.clipapp.login.js",
	"views/js/clip/app.clipapp.logout.js",
	"views/js/clip/app.clipapp.me.js",
	"views/js/clip/app.clipapp.useredit.js",
	"views/js/clip/app.clipapp.emailadd.js",
	"views/js/clip/app.clipapp.weibo.js",
	"views/js/clip/app.clipapp.ruleedit.js",
	"views/js/clip/app.clipapp.userbind.js",
	"views/js/clip/app.clipapp.twitter.js",
	"views/js/clip/app.clipapp.oauth.js",
	"views/js/clip/app.clipapp.error.js",
	"views/js/clip/app.clipapp.versions.js",
	"views/js/clip/app.clipapp.bubb.js",
	"views/js/clip/app.clipapp.clipdetail.js",
	"views/js/clip/app.clipapp.clipedit.js",
	"views/js/clip/app.clipapp.clipadd.js",
	"views/js/clip/app.clipapp.help.js",
	"views/js/clip/app.clipapp.cliplist.js",
	"views/js/clip/app.clipapp.routing.js",
	"views/js/clip/app.clipapp.comment.js",
	"views/js/clip/app.clipapp.recommend.js",
	"views/js/clip/app.clipapp.reclip.js",
	"views/js/clip/app.clipapp.recliptag.js",
	"views/js/clip/app.clipapp.clipdelete.js",
	"views/js/clip/app.clipapp.memo.js",
	"views/js/clip/app.clipapp.query.js",
	"views/js/clip/app.clipapp.face.js",
	"views/js/clip/app.clipapp.followinglist.js",
	"views/js/clip/app.clipapp.followerlist.js",
	"views/js/clip/app.clipapp.findpass.js",
	"views/js/clip/app.clipapp.resetpass.js",
	"views/js/clip/app.clipapp.message.js",
	"views/js/clip/app.clipapp.taglist.js"
      ],
      "tmp/views/js/bub_tmp.js":[
	"views/js/lib/protoclass.js",
	"views/js/lib/box2d.js",
	"views/js/bub-base.js"
      ]
    },
    min: {
      "tmp/views/js/app.js":["tmp/views/js/app_tmp.js"],
      "tmp/views/js/bub.js":["tmp/views/js/bub_tmp.js"],
      "tmp/views/js/lib/html5.js":["views/js/lib/html5.js"],
      "tmp/views/js/lib/png.js":["views/js/lib/png.js"]
     },
    jade: {
     /* debug: {
	options: {
	  data: {
	    debug: true
	  }
	},
	files: {
	  "tmp/index.html": "index.html.jade",
	  "tmp/bub.html":"bub.html.jade",
	  "tmp/clipper.html":" clipper.html.jade"
	  //"tmp/error_page.html":"error_page.jade",
	  //"tmp/callback_page.html":"callback_page.jade"
	}
      },*/
      release: {
	options: {
	  data: {
	    debug: false
          }
	},
	files: {
	  "tmp/views/index.html": "views/index.html.jade",
	  "tmp/views/bub.html":"views/bub.html.jade",
	  "tmp/views/clipper.html":"views/clipper.html.jade"
	  //"callback_page.html":"callback_page.jade",
	  //"error_page.html":"error_page.jade"
	}
      }
    },
    copy:{
      dist: {
	files: {
	  "tmp/views/img":"views/img/*.gif",
	  "release/img":"tmp/views/img/*",
	  "release/help":"tmp/views/help/*",
	  "release":["tmp/views/index.html","tmp/views/bub.html","tmp/views/clipper.html"],
	  "release/js":["tmp/views/js/app.js","tmp/views/js/bub.js"],
	  "release/css":["tmp/views/css/app.css","tmp/views/css/clipper.css","tmp/views/css/ie7.css","tmp/views/css/ie8.css"],
	  "release/js/lib":"tmp/views/js/lib/*"
	}
      }
    },
   clean: ["tmp/*","release/*"]
   // clean: ["views/tmp/*", "views/index.html",'views/bub.html','views/clipper.html','views/css/app.css','views/css/ie6.css','views/css/ie7.css','views/css/clipper.css',"views/css/index.css","views/css/index_clipper.css","views/img-min/*","views/js/lib-min/*","release/*"]
  });
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-img');
  grunt.registerTask('default', 'clean img jade less concat min mincss copy');
  //grunt.registerTask('default', 'clean');
};
