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
mongoose.connect('mongodb://ec2-54-201-115-172.us-west-2.compute.amazonaws.com/testStuff');
var db = mongoose.connection;

/* Error handler */
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log("Connected");
});

// Schema for now is a simple tuple of the URL and the author (which i will just make up)
var Schema = mongoose.Schema;
var tempSchema = new Schema({
        link : String,
        author : String
});

/* This function will do a console log to test the Schema vailidity */
tempSchema.methods.printToConsole = function() {
 var address = this.link ? "URL is: " + this.link : "No URL";
 console.log(address);
 var writer = this.author ? "Author is: " + this.author : "No Author";
 console.log(writer);
 
}

var tempModel = mongoose.model('tempModel',tempSchema);


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
    var URL = req.body.data;

    console.log("callAlch called with "+URL);

    tempModel.find({ link : URL }, function (err, dbjson) {
//  if (err) {
    console.log("Could not find the link");
    
    /* Create new mongoose model to hold data */
    var userInput = new tempModel({link : URL, author: "Aashish Sinha"});
    userInput.printToConsole();  // Check if console logs anything
    
    /* Store in mongodb */
    userInput.save(function(err) { 
      if(err) {
        console.log("errored out"); 
        return;
      }
    });
    resp.send(URL);
    return;
  //}
  //else {
    //should run when we found in DB
  //  resp.send("SDfsadfsadf");
  //}
  
});

    
//////////below this line works, dont mess with it too much//////////

    var options = {
       host: 'access.alchemyapi.com',
       path: '/calls/url/URLGetRankedNamedEntities?outputMode=json&apikey=2094dd01fd7cbceb7e1bb916840e40e81f25d16f&sentiment=1&linkedData=1&url='+URL,

   };

   var jsonResp = '';

   //request Alchemy API
   var alchRequest = http.get(options, function(alchResp) {

        //CALLBACK alchemy request
       alchResp.on('end',function(){
           console.log(jsonResp);
           resp.send(jsonResp);
           //resp.render('about', { title: 'UnBias.Me', checkPage: 'about' });
           //linkRequest(jsonResp);
       });

       alchResp.setEncoding('utf8');

       //data comes in chunks, so concatenate them
       alchResp.on('data', function (chunk) {
           jsonResp += chunk;
       });
   });

   //err handler
   alchRequest.on('error', function(e) {
       console.log('problem with request: ' + e.message);
   });


}


