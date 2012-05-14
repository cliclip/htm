$(function() {

    // user interactive
    var WIDTH = window.innerWidth || document.documentElement.clientWidth ;
    var HEIGHT =  window.innerHeight || document.documentElement.clientHeight ;
    var screenX = window.screenX || window.screenLeft;
    var screenY = window.screenY || window.screenTop;

    var ui = (function(){

      // MOUSE

      var createMode = false;
      var destroyMode = false;

      var isMouseDown = false;
      var draging = false;
      var mouse = { x: 0, y: 0 };
      var isMouseMove = false;
      var timeOfLastTouch = 0;

      function mouseDown() {
	isMouseDown = true;
	return false;
      }
      function mouseUp() {
	isMouseDown = false;
	return false;
      }
      function mouseMove(event) {
	event = event || window.event;
	mouse.x = event.clientX;
	mouse.y = event.clientY;
	isMouseMove = true;
      }
      function dbClick() {
	game.random();
	// game.info();
      }
      function touchStart(event) {
	if (event.touches.length == 1) {
	  event.preventDefault();
	  // Faking double click for touch devices
	  var now = new Date().getTime();
	  if (now - timeOfLastTouch < 250) {
	    game.reset();
	    return;
	  }
	  timeOfLastTouch = now;
	  mouse.x = event.touches[0].pageX;
	  mouse.y = event.touches[0].pageY;
	  isMouseDown = true;
	}
      }
      function touchMove(event) {
	if (event.touches.length == 1) {
	  event.preventDefault();
	  mouse.x = event.touches[0].pageX;
	  mouse.y = event.touches[0].pageY;
	  isMouseMove = true;
	}
      }
      function touchEnd(event) {
	if (event.touches.length == 0) {
	  event.preventDefault();
	  isMouseDown = false;
	}
      }
      function orientation(event) {
	if (event.beta || event.gamma) {
	  game.roll(event.beta, event.gamma);
	}
      }

      // BROWSER WINDOW

      var stage = [screenX, screenY, WIDTH, HEIGHT];

      return {
	init: function(){
	  document.onmousedown = mouseDown;
	  document.onmouseup = mouseUp;
	  document.onmousemove = mouseMove;
	  document.ondblclick = dbClick;
	  if(document.addEventListener){
	    document.addEventListener('touchstart', touchStart, false);
	    document.addEventListener('touchmove', touchMove, false);
	    document.addEventListener('touchend', touchEnd, false);
	    window.addEventListener('deviceorientation', orientation, false);
	  }else{
	    //兼容ie9之前的版本
	    document.attachEvent('touchstart', touchStart, false);
	    document.attachEvent('touchmove', touchMove, false);
	    document.attachEvent('touchend', touchEnd, false);
	    window.attachEvent('deviceorientation', orientation, false);
	  }

	},
	chkMouse: function() {
	  // mouse press
	  if (createMode) {
	    game.add(mouse.x, mouse.y );
	  } else if (isMouseDown && !draging) {
	    draging = game.dragable(mouse.x, mouse.y);
	    if(draging){
	      game.grap(mouse.x, mouse.y);
	    } else {
	      createMode = true;
	    }
	  }
	  // mouse release
	  if (!isMouseDown) {
	    createMode = false;
	    destroyMode = false;
	      if (draging) {
		game.drop(mouse.x, mouse.y);
		draging = false;
	      }
	  }
	  // mouse move
	  if (draging) {
	    // mouse drag move
	    game.drag(mouse.x, mouse.y);
	  } else {
	    // mouse non-drag move :: mouse-over
	    if (isMouseMove){
	      game.hover(mouse.x, mouse.y);
	      isMouseMove = false;
	    }
	  }
	},
	chkStage: function() {
	  try{
  	    if (stage[0] != screenX || stage[1] != screenY) {
	      var deltaX = (screenX - stage[0]);
	      var deltaY = (screenY - stage[1]);
	      stage[0] = screenX;
	      stage[1] = screenY;
	      if (Math.abs(deltaX) < 2560 && Math.abs(deltaY) < 1600) {
		// windows minimize is using move, WQXGA
		game.shake(deltaX << 6, deltaY << 6); // * 64 as delta
	      }
	    }
	    if (stage[2] != WIDTH || stage[3] != HEIGHT) {
	      stage[2] = WIDTH;
	      stage[3] = HEIGHT;
	      game.resize(stage[2], stage[3]);
	    }
	  } catch(e){}
	}
      };
    })();

    // model - view

    var BallModel = Backbone.Model.extend({
      defaults: function(){
	return {
	  "text":    "oops",
	  "self": false,
	  "current": false,
	  "size":    48,
	  "sink":   false,
	  "body":    null,
	  "hover":   false,
	  "follow":  false
	};
      }
    });

    function fire(event, value){
      // console.log(event, value);
      var App = window.top.App;
      if(App) App.vent.trigger('app.clipapp.bubb:'+event, value);
    }

    var BallView = Backbone.View.extend({
      className: "ball",
      template: _.template($("#ball-template").html()),
      shadow_tmpl: _.template($("#ball-shadow-template").html()),
      events: {
	"click .bub":   "open",
	"click a.follow":   "follow",
	"click a.unfollow": "unfollow",
	"click a.reclip":   "reclip"
      },
      initialize: function(){
	this.model.bind('change', this.update, this);
	this.model.bind('destroy', this.remove, this);
      },
      render: function(){
	$(this.el).html(this.template(this.model.toJSON()));
	this.update();
	return this;
      },
      update: function(){
	var x = this.model.get("body").m_position0.x;
	var y = this.model.get("body").m_position0.y;
	var size = this.model.get("size");
	this.$el.css({
	  left: (x - (size >> 1)) >> 0 ,
	  top: (y - (size >> 1)) >> 0
	});
	if(this.model.hasChanged("current")){
	  if(this.model.get("current")){
	    this.$(".bub").addClass("iscurrent");
	  } else {
	    this.$(".bub").removeClass("iscurrent");
	  }
	}
	if(this.model.hasChanged("follow")){
	  if(this.model.get("follow")){
	    this.$(".bub").addClass("isfollow");
	  } else {
	    this.$(".bub").removeClass("isfollow");
	  }
	  this.$(".shadow").remove();
	  if (this.model.get("hover")){
	    this.$el.prepend(this.shadow_tmpl(this.model.toJSON()));
	  }
	}
	if(this.model.hasChanged("hover")){
	  if (this.model.get("hover")){
	    this.$el.prepend(this.shadow_tmpl(this.model.toJSON()));
	  } else {
	    this.$(".shadow").remove();
	  }
	}
	return this;
      },
      remove: function(){
	this.$el.remove();
      },
      open: function(){
	// this.model.set("current", true);
	// game.open(this.$(".bub span").text());
	// window.scrollTo(0,0);
	fire("open", this.$(".bub span").text());
      },
      follow: function(){
	// this.model.set("follow", true);
	fire("follow", this.$(".bub span").text());
      },
      unfollow: function(){
	// this.model.set("follow", false);
	fire("unfollow", this.$(".bub span").text());
      },
      reclip: function(){
	fire("reclip", this.$(".bub span").text());
      }
    });

    // physical system

    var game = (function(){

      var worldAABB, world, iterations = 1, timeStep = 1 / 20;
      // var gravity = { x: 0, y: -0.01 };
      var gravity = { x: 0, y: 0 };
      var delta = { x :0, y : 0 };

      var wall_thickness = 200;
      var wallsSetted = false;

      var walls = [];
      var balls = [];

      var mouseJoint = null;
      var mouseOver = null;

      function Circle(radius, x, y, sx, sy) {
	var circle = new b2CircleDef();
	circle.radius = radius;
	circle.density = 0.5; // 密度
	circle.friction = 0.01; // 摩擦系数
	circle.restitution = 0.2; // 弹力
	var b2body = new b2BodyDef();
	b2body.AddShape(circle);
	// b2body.userData = { element: element };
	b2body.position.Set(x, y);
	b2body.linearVelocity.Set(sx, sy);
	return b2body;
      }

      function Box(x, y, width, height, fixed) {
	if (typeof(fixed) == 'undefined') {
	  fixed = true;
	}
	var boxSd = new b2BoxDef();
	if (!fixed) {
	  boxSd.density = 1.0;
	}
	boxSd.extents.Set(width, height);
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x, y);
	return boxBd;
      }

      function ran(width, height){
	return {
	  x : Math.random() * width,
	  y : (Math.random() * - height) >> 1,
	  sx : (Math.random() * 2 - 1) * width,
	  sy : (Math.random() * 2 - 1) * height
	};
      }

      function setBall(size, width, height){
	var r = ran(width, height);
	var body = world.CreateBody(Circle((size >> 1), r.x, r.y, r.sx, r.sy));
	return body;
      }

      function setWalls(width, height, ws) {
	if (wallsSetted) {
	  world.DestroyBody(walls[0]);
	  world.DestroyBody(walls[1]);
	  world.DestroyBody(walls[2]);
	  world.DestroyBody(walls[3]);
	  walls[0] = null;
	  walls[1] = null;
	  walls[2] = null;
	  walls[3] = null;
	}
	walls[0] = world.CreateBody(Box(width >> 1, 0 - ws, width, ws));
	walls[1] = world.CreateBody(Box(width >> 1, height + ws, width, ws));
	walls[2] = world.CreateBody(Box(0 - ws, height >> 1, ws, height));
	walls[3] = world.CreateBody(Box(width + ws, height >> 1, ws, height));
	wallsSetted = true;
      }

      function getBodyAt(x, y) {
	// Make a small box.
	var mousePVec = new b2Vec2();
	mousePVec.Set(x, y);
	var aabb = new b2AABB();
	aabb.minVertex.Set(x - 1, y - 1);
	aabb.maxVertex.Set(x + 1, y + 1);
	// Query the world for overlapping shapes.
	var k_maxCount = 10;
	var shapes = new Array();
	var count = world.Query(aabb, shapes, k_maxCount);
	var body = null;
	for (var i = 0; i < count; ++i) {
	  if (shapes[i].m_body.IsStatic() == false) {
	    if (shapes[i].TestPoint(mousePVec)) {
	      body = shapes[i].m_body;
	      break;
	    }
	  }
	}
	return body;
      }

      function info(){
	_(balls).each(function(ball){
	  var text = ball.get("text");
	  var body = ball.get("body");
	  var x = body.m_position0.x;
	  var y = body.m_position0.y;
	  // console.log("ball %s: %s,%s",text,x,y);
	});
      }

      function findBall(body){
	for(var i=0; i<balls.length; i++){
	  var ball = balls[i];
	  if (body == ball.get("body")) return ball;
	}
	return null;
      }

      function loop(){
	ui.chkStage();
	ui.chkMouse();
	// delta 衰减
	delta = {
	  x : delta.x >> 1,
	  y : delta.y >> 1
	};
	// gravity
	// world.m_gravity.x = gravity.x * 350 + delta.x;
	// world.m_gravity.y = gravity.y * 350 + delta.y;
	// old
	_(balls).each(function(ball){
	  var body = ball.get("body");
	  var fx = 0;
	  fx = (fx * 350 + delta.x) * body.m_mass;
	  var fy = ball.get("sink") ? 0.1 : -0.1;
	  fy = (fy * 350 + delta.y) * body.m_mass;
	  body.ApplyForce(new b2Vec2(fx, fy), body.m_position0);
	});
	// next
	world.Step(timeStep, iterations);
	_(balls).each(function(ball){ ball.trigger("change");});
      }

      return {
	init : function(){
	  ui.init();
	  worldAABB = new b2AABB();
	  worldAABB.minVertex.Set( - wall_thickness, - wall_thickness);
	  worldAABB.maxVertex.Set(WIDTH + wall_thickness, HEIGHT + wall_thickness);
	  world = new b2World(worldAABB, new b2Vec2(0, 0), true);
	  setWalls(WIDTH, HEIGHT, wall_thickness);
	  setInterval(loop, 1000 / 40);
	},
	random : function(){
	  _(balls).each(function(ball){
	    var body = ball.get("body");
	    var r = ran(WIDTH, wall_thickness);
	    body.m_position.x = r.x;
	    body.m_position.y = r.y;
	    body.m_linearVelocity.x = r.sx;
	    body.m_linearVelocity.y = r.sy;
	    body.WakeUp();
	  });
	},
	shake : function(deltaX, deltaY){
	  // console.log("shake(%s,%s)", deltaX, deltaY);
	  // console.log("x:%s,y:%s", window.screenX, window.screenY);
	  delta.x = deltaX;
	  delta.y = deltaY;
	  _(balls).each(function(ball){ ball.get("body").WakeUp(); });
	},
	resize : function(width, height){
	  // console.log("resize(%s,%s)", width, height);
	  setWalls(width, height, wall_thickness);
	},
	roll : function(beta, gamma){
	  /*
	  gravity.x = Math.sin(gamma * Math.PI / 180);
	  gravity.y = Math.sin((Math.PI / 4) + beta * Math.PI / 180);
	   */
	},
	add : function(x, y){
	},
	dragable : function(x, y){
	  return null != getBodyAt(x, y);
	},
	grap : function(x, y){
	  // console.log("grap");
	  var body = getBodyAt(x, y);
	  var md = new b2MouseJointDef();
	  md.body1 = world.m_groundBody;
	  md.body2 = body;
	  md.target.Set(x, y);
	  md.maxForce = 300 * body.m_mass;
	  md.timeStep = timeStep;
	  mouseJoint = world.CreateJoint(md);
	  body.WakeUp();
	},
	drag : function(x, y){
	  // console.log("drag");
	  if (mouseJoint){
	    var p2 = new b2Vec2(x, y);
	    mouseJoint.SetTarget(p2);
	  }
	},
	drop : function(x, y){
	  // console.log("drop");
	  if (mouseJoint){
	    world.DestroyJoint(mouseJoint);
	    mouseJoint = null;
	  }
	},
	hover : function(x, y){
	  function leave(body){
	    // console.log("leave %j", body.m_shapeList.m_radius);
	    body.WakeUp();
	    body.m_shapeList.m_radius -= 30;
	    var model = findBall(body);
	    if (model) model.set("hover", false);
	  }
	  function enter(body){
	    // console.log("enter %j", body.m_shapeList.m_radius);
	    body.WakeUp();
	    body.m_shapeList.m_radius += 30;
	    var model = findBall(body);
	    if (model) model.set("hover", true);
	  }
	  // console.log("move");
	  var body = getBodyAt(x, y);
	  if(body == null){
	    if (mouseOver != null){
	      leave(mouseOver);
	      mouseOver = null;
	    }
	  } else if (body == mouseOver) {
	    // stay on same object
	    // noop
	  } else {
	    if (mouseOver != null){ leave(mouseOver); }
	    mouseOver = body;
	    enter(mouseOver);
	  }
	},
	/*
	reset({
	    tags: ["fun", "cool", "ugly", "music", "movie", "tv", "girls"],
	    bubs: ["fun", "cool", "ugly"],
	    sink: ["ugly"],
	    follows: ["fun"],
	    default: "girls"
	});
	*/
	reset : function(options){
	  _(balls).each(function(ball){
	    var body = ball.get("body");
	    world.DestroyBody(body);
	    ball.destroy();
	    ball = null;
	  });
	  balls = [];
	  mouseOver = null;
	  mouseJoint = null;
	  var self = options.self;
	  delete options.self;
	  _.chain(options).values().flatten().uniq().each(function(e){
	    var size = (options.bubs&&_.indexOf(options.bubs,e)!=-1) ? 64 : 48;
	    var body = setBall(size + 10, WIDTH, wall_thickness);
	    var ball = new BallModel({
	      "text": e,
	      "self": self,
	      "size": size,
	      "body": body,
	      "current": ( options.current && options.current == e ),
	      "sink": ( options.sink && _.indexOf(options.sink,e) !=  -1 ),
	      "follow": ( options.follows &&_.indexOf(options.follows,e)!=-1 ),
	      "hover": false
	    });
	    var view = new BallView({ model : ball });
	    $("#bubbles").append(view.render().el);
	    balls.push(ball);
	  });
	  // color theme
	  // theme = themes[Math.random() * themes.length >> 0];
	  // document.body.style['backgroundColor'] = theme[0];
	  // info();
	},
	open : function(tag){
	  _(balls).each(function(ball){
	    ball.set("current", ball.get("text") == tag);
	  });
	},
	follow : function(tag){
	  _(balls).each(function(ball){
	    if(ball.get("text") == tag){
	      ball.set("follow", true);
	    }
	  });
	},
	unfollow : function(tag){
	  _(balls).each(function(ball){
	    if(ball.get("text") == tag){
	      ball.set("follow", false);
	    }
	  });
	},
	info : info
      };
    })();

    // exports
    window.resetTags = function(options){
      game.reset(options);
    };
    window.openTag = function(tag){
      game.open(tag);
    };
    window.followTag = function(tag){
      game.follow(tag);
    };
    window.unfollowTag = function(tag){
      game.unfollow(tag);
    };

    game.init();

});