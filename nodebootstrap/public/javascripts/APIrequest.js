var request = require('request');
var XMLHttpRequest = require("XMLHttpRequest");

var http = require("http");

var mongoose = require("mongoose");

//mongoose.connect('ec2-54-200-60-55.us-west-2.compute.amazonaws.com/news'); This was old server
mongoose.connect('ec2-54-201-115-172.us-west-2.compute.amazonaws.com');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log("Connected");
});

var newsSchema = mongoose.Schema({
        link : String,
        bias : Number,
        lean : String
});


var summary = mongoose.model'(Summary',newsSchema);


function JSON_extractor(list, url_input) {

  alert("Getting ["+list+"] for "+url_input);
   var http = require('http');


  var baseURL = "http://access.alchemyapi.com/calls/url/URLGetTargetedSentiment"




  // var obj = new Array();
  // var api = http.createClient(80, 'http://access.alchemyapi.com/calls/url/URLGetTargetedSentiment');
  
  //Get JSON for multiple keywords
  // //alert("first");
  // for (i=0; i < list.length; i++)
  // {
  //   //alert("second");
  //   var keyword = list[i];

  //   var oRequest = new XMLHttpRequest(); //set up request form
  //   //URL
  //   var sURL = 'http://access.alchemyapi.com/calls/url/URLGetTargetedSentiment';
  //   oRequest.open("POST", sURL, false);
  //   oRequest.setRequestHeader('target', keyword);
  //   oRequest.setRequestHeader('url', url_input);
  //   oRequest.setRequestHeader('apikey', '2094dd01fd7cbceb7e1bb916840e40e81f25d16f');
  //   oRequest.setRequestHeader('outputMode', 'json');
  //   oRequest.send(null);
  //   var response = oRequest.responseText;
  //   if(response.status === 'ERROR') 
  //     {console.error.bind(console, 'connection error:');}
  //   else
  //   {
  //     //Create object with keyword, score
  //     var temp = {word : keyword, score : response.docSentiment.score};
  //     if(response.docSentiment.mixed === 1)
  //     {
  //       //If its mixed, set sentiment to mixed
  //       temp.sentiment = 'mixed';
  //     }
  //     else
  //     {
  //       temp.sentiment = response.docSentiment.type;
  //     }
  //     //Add object to list
  //     obj.push(response);
  //   }
  //   }
    
     
//     var request = api.request('POST',
//     {
//       'target' : keyword,
//       'url': url_input,
//       'apikey': '2094dd01fd7cbceb7e1bb916840e40e81f25d16f',
//       'outputMode' : 'json'
//     } , function (response) {
//        // If the API sent an error msg, ignore keyword
//        console.log("Got the API");
//        if(response.status === 'ERROR') 
//        {console.error.bind(console, 'connection error:');}
//        else
//        {
//        //Create object with keyword, score
//        var temp = {word : keyword, score : response.docSentiment.score};
//        if(response.docSentiment.mixed === 1)
//        {
//          //If its mixed, set sentiment to mixed
//          temp.sentiment = 'mixed';
//        }
//        else
//        {
//          temp.sentiment = response.docSentiment.type;
//        }
//        //Add object to list
//        obj.push(response);
//        }
//        });
  
//   return obj;
// }

// function get_total_positivity(list) {
//   var pos = 0;
//   var neg = 0;
//   for (i=0; i < list.length;i++)
//   {
//     if (list[i].word === "positive") 
//     {
//       pos += score;
//     }
//     if (list[i].word === "negative")
//     {
//       neg += Math.abs(list[i].score);
//     }
//   }
//   return [pos,neg]; 
}

function extract_feels(url) {

  //dont make every time:
  var llist = new Array("Obama", "Obamacare", "liberal");
  var rlist = new Array("Mitt", "Romney", "guns", "Bush", "Syria");


  var liberal_feels = JSON_extractor(llist,url);
  return;

  ////////////////////doesnt run ///////////////////
  var conservative_feels = JSON_extractor(rlist,url);
  var lib_scores = get_total_positivity(liberal_feels);
  var con_scores = get_total_positivity(conservative_feels);
  
  var lbias = Math.abs(lib_scores[0] - lib_scores[1]);
  var rbias = Math.abs(con_scores[0] - con_scores[1]);
  var netbias = parseInt(Math.abs(lbias - rbias));
  if(lbias > rbias)
  {
    var lib_sum = new summary({link : url, bias : netbias, lean : "Liberal"});
    lib_sum.save(function (err,lib_sum) {
      if (err) //TODO
        {}
    });
  }
  else
  {
    var lib_sum = new summary({link : url, bias : netbias, lean : "Conservative"});
    lib_sum.save(function (err,lib_sum) {
      if (err) //TODO
      {}
    });
 
  }
}
