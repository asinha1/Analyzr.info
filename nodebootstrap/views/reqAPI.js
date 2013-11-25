
var http = require("http");
var fs = require('fs');
var port = 1111;
var serverUrl = "96.126.106.48";

var server = http.createServer(function(req, res) {

  
  if(req.url == "/bias/index.html") {

    fs.readFile("index.html", function(err, text){
      res.setHeader("Content-Type", "text/html");
      res.end(text);
    });
    return;

  }
  
    return;
  //res.setHeader("Content-Type", "text/html");
  //res.end("<p>Hello World. Request counter: " + counter + ".</p>");

});

//console.log("Statring web server at " + serverUrl + ":" + port);
server.listen(port, serverUrl);

