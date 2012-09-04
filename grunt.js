module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      all: ['views/js/clip/*.js','views/js/lib/png.js','views/js/lib/html5.js','views/js/user/*.js','views/js/*.js','grunt.js']
    },
    img:{
      task1: {
	 src: ['views/img/*.jpg'],
	 dest:'debug/views/img-min'
      },
      task2: {
	src: ['views/img/*.png'],
	dest:'debug/views/img-min'
      }/*,
      task3: {
	src: ['views/img/*.gif'],
	dest:'views/img-min'
      }*/
    },
    less: {
      compile: {
	options: {
	  paths: ["views/css"]
	},
	files: {
	  "debug/views/css/ie7.css":"views/css/ie7.less",
	  "debug/views/css/ie6.css":"views/css/ie6.less",
	  "debug/views/css/app.css":"views/css/style.less",
	  "debug/views/css/clipper.css":"views/css/bookmark.less"
	}
      }
    },
    mincss: {
      "debug/views/css/clipper.min.css": ["views/css/uploadImage.css","views/css/jquery.tagsinput.css","views/css/clipper.css"],
      "debug/views/css/app.min.css": ["views/css/uploadImage.css","views/css/jquery.tagsinput.css","views/css/app.css"],
      "debug/views/css/ie7.min.css":["views/css/ie7.css"],
      "debug/views/css/ie6.min.css":["views/css/ie6.css"]
    },
    concat: {
      "debug/views/js/app.js":[
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
      "debug/views/js/bub.js":[
	"views/js/lib/protoclass.js",
	"views/js/lib/box2d.js",
	"views/js/bub-base.js"
      ]
    },
    min: {
      "debug/views/js/app.min.js":["views/js/app.js"],
      "debug/views/js/bub.min.js":["views/js/bub.js"],
      "debug/views/js/lib-min/html5.min.js":["views/js/lib/html5.js"],
      "debug/views/js/lib-min/png.min.js":["views/js/lib/png.js"]
    },
    jade: {
     /* debug: {
	options: {
	  data: {
	    debug: true
	  }
	},
	files: {
	  "debug/index.html": "index.html.jade",
	  "debug/bub.html":"bub.html.jade",
	  "debug/clipper.html":" clipper.html.jade"
	  //"debug/error_page.html":"error_page.jade",
	  //"debug/callback_page.html":"callback_page.jade"
	}
      },*/
      release: {
	options: {
	  data: {
	    debug: false
          }
	},
	files: {
	  "debug/views/index.html": "views/index.html.jade",
	  "debug/views/bub.html":"views/bub.html.jade",
	  "debug/views/clipper.html":"views/clipper.html.jade"
	  //"callback_page.html":"callback_page.jade",
	  //"error_page.html":"error_page.jade"
	}
      }
    },
    copy:{
      dist: {
	files: {
	  "debug/views/img-min":"debug/views/img/*.gif",
	  "release/img":"debug/views/img-min/*",
	  "release/help":"debug/views/help/*",
	  "release":["debug/views/index.html","debug/views/bub.html","debug/views/clipper.html"],
	  "release/js":["debug/views/js/app.min.js","debug/views/js/bub.min.js"],
	  "release/css":["debug/views/css/app.min.css","debug/views/css/clipper.min.css","debug/views/css/ie7.min.css","debug/views/css/ie8.min.css"],
	  "release/js/lib":"debug/views/js/lib-min/*"
	}
      }
    },
   clean: ["debug/*","release/*"]
   // clean: ["views/debug/*", "views/index.html",'views/bub.html','views/clipper.html','views/css/app.css','views/css/ie6.css','views/css/ie7.css','views/css/clipper.css',"views/css/index.css","views/css/index_clipper.css","views/img-min/*","views/js/lib-min/*","release/*"]
  });
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-img');
  grunt.registerTask('default', 'clean img jade less concat min mincss copy');
  //grunt.registerTask('default', 'clean');
};
