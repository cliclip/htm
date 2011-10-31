var fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http');

var host = "106.187.43.207" // "clickdang.herokuapp.com"
  , port = 3000             // 80
  , root = "demo"
  , index = "index.html"
  , mimes = {
      ".html": "text/html",
      ".htm": "text/html",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".png": "image/png",
      ".js": "text/javascript",
      ".css": "text/css"
    };

function serve(req, res){
  var uri = url.parse(req.url).pathname;
  uri = (/\/$/.test(uri)) ? uri + index : uri;
  var filename = path.join(process.cwd(), root, uri);
  var mime = mimes[path.extname(filename)];
  path.exists(filename, function(exists) {
    if(!exists) {
      console.log("serve:"+req.method+" "+uri+"->"+filename+" "+mime+" 404");
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('404 Not Found\n');
      res.end();
      return;
    } else {
      console.log("serve:"+req.method+" "+uri+"->"+filename+" "+mime+" 200");
      res.writeHead(200, {'Content-Type': mime});
      var stream = fs.createReadStream(filename);
      stream.pipe(res);
    }
  });
}

function proxy(req, res){
  
  function pipe(src, des){
    src.on('data', function(data){ des.write(data); });
    src.on('end', function(){ des.end(); });
  }

  var path = req.url;
  var method = req.method;
  var headers = {};
  for(var k in req.headers){ headers[k] = req.headers[k]; }
  headers["host"] = host; // fit herokuapp's virtual host config

  var preq = http.request({
    host: host,
    port: port,
    path: path,
    method: method,
    headers: headers
  }, function(pres){
    res.statusCode = pres.statusCode;
    for(var k in pres.headers){ res.setHeader(k,pres.headers[k]); }
    pipe(pres, res);
    console.log("proxy:"+method+" "+path+" ok");
  });
  pipe(req, preq);
}

var server = module.exports = http.createServer(function(req, res){
  // console.dir(req);
  if(/\/\_\/.*/.test(req.url)){
    proxy(req, res);
  } else {
    serve(req, res);
  }
});

server.listen(process.env.PORT || 3000);
console.log("HTM Develop Server listening on port %d", server.address().port);
