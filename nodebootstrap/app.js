
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var about = require('./routes/about');
var user = require('./routes/user');
var contact = require('./routes/contact');
var http = require('http');
var path = require('path');
var reqAPI = require('./routes/reqAPI');
//var article = [{author: "Akul", _id : 1}, {author: "Aashish", _id : 1}];]


var app = express();

// all environments
app.set('port', process.env.PORT || 2222);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.compress());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', about.text);
app.get('/about', about.text);
app.get('/contact', contact.text);
app.get('/users', user.list);
app.post('/about', about.postUrl);
app.post('/reqAPI',  callAlch);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



function callAlch(req,res){

	console.log("call Alch called");

	var http = require('http');

	var options = {
	  host: 'access.alchemyapi.com',
	  path: '/calls/url/URLGetTargetedSentiment/',
	  url: 'http://www.cnn.com/2013/11/24/world/meast/iran-israel/index.html',
	  apikey: '2094dd01lkm;k7e1bb916840e40e81f25d16f',
	  outputMode: 'xml',
	  target: 'guns'
	};

	http.get(options, function(resp){

	  resp.on('data', function(chunk){
		console.log(resp);
	  });
	}).on("error", function(e){
	  console.log("Got error: " + e.message);
	});
}


