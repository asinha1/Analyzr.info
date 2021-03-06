/*
 * app.js - the head honcho
 *
 * Initializes the web server, estabilishes connection to MONGO database
 * and performs the api calls, db calls, and db stores
 *
 * Also sends data to client browser
 *
 * Contributors:
 * Aashish Sinha
 * Brian Bergeron
 *
 */

/* Needed Node variables */
 var express = require('express');
 var http = require('http');
 var path = require('path');
 var fs = require('fs');

/* Stuff for mongoose */
var mongoose = require("mongoose");

/* Connect to mongodb on Aashish's AWS */ 
mongoose.connect('mongodb://ec2-54-201-115-172.us-west-2.compute.amazonaws.com/alchdb');
var db = mongoose.connection;

/* Error handler for database connection */
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log("Connected");
});

/* Schema for link/json pair */
var Schema = mongoose.Schema;
var alchSchema = new Schema({
        link : String,
        data : String
});

/* This function will do a console log to test the Schema vailidity */
alchSchema.methods.printToConsole = function() {
 var address = this.link ? "URL is: " + this.link : "No URL";
 console.log(address);
 var json = this.data ? "JSON data is: " + this.data : "No data";
 console.log(json);
}

var alchModel = mongoose.model('alchModel',alchSchema);


var app = express();

// all environments
app.set('port', process.env.PORT || 2468);

////////

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

app.post('/artReq',  sendAlchData);


http.createServer(app).listen(app.get('port'), 
    function(){
      console.log('Express server listening on port ' + 
          app.get('port'));
  });



function sendAlchData(req,resp){

    //get URL from submitted form
    var URL = req.body.data;

    /* log the sending of info */
    console.log("sendAlchData called with "+URL);

    alchModel.findOne({'link' : URL }, 
    function (err, dbjson) {
      /* Return db access error */
      if (err) {
        console.log("MONGO: findOne error");
        return;
      }
      else if(dbjson != null) {    
        //should run when we found in DB
        console.log("MONGO: found in db: "+ dbjson);
        resp.send(dbjson.data);
        return;
      }
      else{
        //have to do API call
        console.log("MONGO: not in db")
        callAlch(URL,resp);
        return;
      }
    
    });
    
}


function callAlch(URL,resp){

  fs.appendFile("/var/www/ANALYZRURLLOG.log", "Alch being called with url: "+URL+"\n", function(err) {
    if(err) {
        console.log(err);
    } else {}
}); 

    /* Setting up the API call parameters */
    var options = {
       host: 'access.alchemyapi.com',
       path: '/calls/url/URLGetRankedNamedEntities?outputMode=json&apikey=2094dd01fd7cbceb7e1bb916840e40e81f25d16f&sentiment=1&linkedData=1&url='+URL,

   };

   var jsonResp = '';

   //request Alchemy API
   var alchRequest = http.get(options, function(alchResp) {

        //CALLBACK alchemy request
       alchResp.on('end',function(){
           
           //send to DB
           addToDb(URL,jsonResp);

           //send to client
           resp.send(jsonResp);
       });

       alchResp.setEncoding('utf8');

       //data comes in chunks, so concatenate them
       alchResp.on('data', function (chunk) {
           jsonResp += chunk;
       });
   });

   /* error handler */
   alchRequest.on('error', function(e) {
       console.log('ALCH: problem with request: ' + e.message);
   });

}

function addToDb(URL,dbjson){

  /* DO ALCHEMY CALL */
  /* Create new mongoose model to hold data */
  var userInput = new alchModel({link : URL, data: dbjson});
    //userInput.printToConsole();  // Check if console logs anything
    
    /* Store in mongodb */
    userInput.save(function(err) { 
     if(err) {
       console.log("MONGO: errored out adding to db"); 
     }
   });

    return;
}


