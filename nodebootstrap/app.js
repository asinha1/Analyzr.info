
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
//var reqAPI = require('./routes/reqAPI');
//var article = [{author: "Akul", _id : 1}, {author: "Aashish", _id : 1}];]

/* Stuff for mongoose */
var request = require('request');
//var XMLHttpRequest = require("XMLHttpRequest");
var mongoose = require("mongoose");

/* Connect to mongodb on Aashish's AWS */ 
mongoose.connect('ec2-54-201-115-172.us-west-2.compute.amazonaws.com');
var db = mongoose.connection;
/* Error handler */
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log("Connected");
});

var newsSchema = mongoose.Schema({
        link : String,
        bias : Number,
        lean : String
});

var summary = mongoose.model('Summary',newsSchema);


var app = express();

// all environments
app.set('port', process.env.PORT || 1337);

////////
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
app.post('/',  callAlch);


http.createServer(app).listen(app.get('port'), 
    function(){
      console.log('Express server listening on port ' + 
          app.get('port'));
  });




function callAlch(req,resp){

    //get URL from submitted form
    var URL = req.body.urlin

    console.log("callAlch called with "+URL);







    //////////dont touch below this line////////////
    return;

    var options = {
       host: 'access.alchemyapi.com',
       path: '/calls/url/URLGetRankedNamedEntities?outputMode=json&apikey=2094dd01fd7cbceb7e1bb916840e40e81f25d16f&sentiment=1&linkedData=1&url='+URL,

   };

   var jsonResp = '';

   //request Alchemy API
   var req = http.request(options, function(res) {

        //CALLBACK alchemy request
       res.on('end',function(){
           console.log(jsonResp);

           resp.send(jsonResp);
           resp.render('about', { title: 'UnBias.Me', checkPage: 'about' });
           //linkRequest(jsonResp);
       });

       res.setEncoding('utf8');

       res.on('data', function (chunk) {
           jsonResp += chunk;
       });
   });

   req.on('error', function(e) {
       console.log('problem with request: ' + e.message);
   });



        // write data to request body
        req.write('data\n');
        req.write('data\n');
        req.end();



    }


