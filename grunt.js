var fs = require('fs');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-img');
  grunt.registerTask('build', 'jade less mincss min img copy');
  grunt.registerTask('default', 'clean build');
  grunt.initConfig({
    // clean
    clean: ["release/*","tmp/*"],
    // lint
    lint: {
      all: ['views/js/*.js','views/js/clip/*.js','views/js/lib/png.js','views/js/lib/html5.js','grunt.js']
    },
    // html
    jade: {
      release: {
	options: {
	  pretty: true,
	  data: {
	    debug: false,
	    code: function(file){
	      var str = fs.readFileSync(file, "utf-8");
	      return str;
	    }
          }
	},
	files: {
	  "tmp/index.html": "views/index.html.jade",
	  "tmp/bub.html":"views/bub.html.jade",
	  "tmp/clipper.html":"views/clipper.html.jade",

	  "tmp/js/app.js.raw":"views/js/app.js.jade",
	  "tmp/js/bub.js.raw":"views/js/bub.js.jade",
	  "tmp/js/clipper.js.raw":"views/js/clipper.js.jade",

	  "tmp/css/app.less.raw":"views/css/app.css.jade",
	  "tmp/css/clipper.less.raw":"views/css/clipper.css.jade"
	}
      }
    },
    // css
    less: {
      compile: {
	options: {
	  paths: ["tmp/raw/css","views/css"]
	},
	files: {
	  "tmp/css/app.css.raw":"tmp/css/app.less.raw",
	  "tmp/css/clipper.css.raw":"tmp/css/clipper.less.raw",
	  "tmp/css/ie6.css.raw":"views/css/ie6.less",
	  "tmp/css/ie7.css.raw":"views/css/ie7.less"
	}
      }
    },
    mincss: {
      "tmp/css/app.css":["tmp/css/app.css.raw"],
      "tmp/css/clipper.css":["tmp/css/clipper.css.raw"],
      "tmp/css/ie6.css":["tmp/css/ie6.css.raw"],
      "tmp/css/ie7.css":["tmp/css/ie7.css.raw"]
    },
    // javascript
    min: {
      "tmp/js/app.js":["tmp/js/app.js.raw"],
      "tmp/js/clipper.js":["tmp/js/clipper.js.raw"],
      "tmp/js/bub.js":["tmp/js/bub.js.raw"],
      // THE BOOKMARKLET LOADER
      "tmp/js/loader.js":["views/js/loader.js"],
      // THE GOOGLE ANALYSTICS
      "tmp/js/ga.js":["views/js/ga.js"]
    },
    // image
    img:{
      jpg: {
	 src: ['views/img/*.jpg'],
	 dest:'tmp/img'
      },
      png: {
	src: ['views/img/*.png'],
	dest:'tmp/img'
      }/*,
      gif: {
	src: ['views/img/*.gif'],
	dest:'tmp/img'
      }*/
    },
    // copy
    copy:{
      dist: {
	files: {
	  "tmp": [
	    "views/googlefb7f383fc281bf91.html", // GOOGLE-SITE VERIFY
	    "views/wb_38df15b5adadf7b4.txt",     // WEIBO VERIFY
            "views/wb_dfb6716e3e790bbf.txt",     // WEIBO VERIFY
	    "views/callback_page.jade",          // TODO REMOVE
	    "views/error_page.jade"              // TODO REMOVE
	  ],
	  "release":[
	    "tmp/*"                              // THE BUILD HTML
	  ],
	  "release/css":[
	    "tmp/css/*.css"                      // THE BUILD CSS
	  ],
	  "release/js":[
	    "tmp/js/*.js"                        // THE BUILD JS
	  ],
	  "release/js/lib":
	    "views/js/lib/*.min.js",             // THE DEPEND LIBS
	  "release/img":[
	    "tmp/img/*",
	    "views/img/*.gif"                    // TODO THE LEFT GIF
	  ],
	  "release/help":
	    "views/help/*.json"                  // TODO THE HELP JSON
	}
      }
    }
  });
};
