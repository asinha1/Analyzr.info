var x,y,margin,xAxis,svg,width,height,filters,typeFilter;

//onload, initially display an empty graph
window.onload = function(){

	//set width and height of graph
	margin = {top: 20, right: 40, bottom: 30, left: 40};
	width = 900 - margin.left - margin.right,
	height = 300 - margin.top - margin.bottom;

	//set ranges and domains for x,y axis
	x = d3.scale.linear()
	.range([0, width]);

	y = d3.scale.linear()
	.range([height, 0]);

	//initialzie axiss
	xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	//initial graph
	x.domain([-100,100]);	
	y.domain([0,10]);


//actually add the svg graph elem to the div "graph" in page
	svg = d3.select("#graph").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	//make the initial graph axis and label
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.style("text-anchor", "end")
	.attr("y",-5)
	.text("Sentiment");
	
}

//gets called when user clicks ANALYZ
//queries request for alchemy data (from our server "dijkstra")
function linkRequest(){

	var URL = document.getElementById("urlIn").value;

	//post our own server
	var jqxhr = $.post( "/", {data:URL},function() {
	})
		//CALLBACK
		.done(function(data) {
			parseData(data);
		})
		.fail(function() {
			alert( "error querying our own server" );
	});

	//we dont want calling form to submit request
	return false;
}

//gven a set of datapoints, graph on div #graph
function graphit(inputJsonData){

	var data = [];

	//get only 10 most relevant entries IF there are 10
	var len = Object.keys(inputJsonData).length;

	for(var i=0; (i<12 && i<len); i++){

		data[i] = inputJsonData[i];
	}
	

	var least = 100;
	var most = -100;

	//preproccess the outer most values
	//if sentiment is neutral, give score of 0
	for(var i=0; i<data.length; i++){

		var sent = data[i].sentiment.score*100;

		if(sent>most)
			most = sent;
		if(sent<least)
			least = sent;
	}


	//set domains to fit data
	x.domain([least-10,most+10]);	


	//color scales
	var redToYel = d3.scale.linear().domain([least,0]).range(['red', 'yellow']);
	var yelToGreen = d3.scale.linear().domain([0,most]).range(['yellow', 'green']);

	//make tooltip (and set what it displays)
	var tip = d3tip().attr('class', 'd3-tip').html(
		function(d) { 
			return "<font color=\"9d1f0f\"size=5>"+d.text+"</font><p>Relevance: "
			+parseFloat(d.relevance*100).toFixed(1)+"%<br>Sentiment: <font color=\""
			+getScaledColor(redToYel,yelToGreen,100*d.sentiment.score)+"\">"+
			parseFloat(d.sentiment.score*100).toFixed(1)+"</font>"; 

		});
	svg.call(tip);

	svg.selectAll(".dot").remove();

	svg.select("g").remove();

	//redraw axis
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.style("text-anchor", "end")
	.attr("y",-5)
	.text("Sentiment");

	//for each datapoint, make/style a "dot" element
	svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("r", function(d) { return (d.relevance*70)+10; })
	.attr("cx", function(d) {

		var score = 100*d.sentiment.score;
		return x(score);

		 })
	.style("fill",function(d){ 

		var score = 100*d.sentiment.score;
		return getScaledColor(redToYel,yelToGreen,score);

		})
	.attr("cy", function(d) { return y(4); })
	.on('mouseover', tip.show)
    .on('mouseout', tip.hide);
	

}

//gets color scaled from red-yellow-green
function getScaledColor(redToYel,yelToGreen,score){
		return (score<0) ? redToYel(score) : yelToGreen(score);}



//input: string resp. from our server "dijkstra" (the ALCH call)
//function sorts entres by type and # occurences for each type
//returns: graphs initial graph with mostRelevant 
function parseData(strAlchData){

	//console.log(strAlchData);

	//mostOccur keeps track of which types occur most
	var mostOccur = [];
	mostOccur[0] = {"type" : "MostRelevant", "occur": 9999999};
	mostOccur[1] = {"type" : "OnlyPositive", "occur": 9999998};
	mostOccur[2] = {"type" : "OnlyNegative", "occur": 9999997};

	//turn input str into json
	var jsonAlchData = JSON.parse(strAlchData);

	//catch error
	if(jsonAlchData.status=="ERROR")
		alert("error with alch req: "+jsonAlchData.statusInfo);

	var allEntities = jsonAlchData.entities;

	//typeFilter is JSON object whch organizes entries by type
	typeFilter = {};
	typeFilter['OnlyPositive']=[];
	typeFilter['OnlyNegative']=[];
	typeFilter['MostRelevant']=[];
	
	//loop over ALL entries
	var len = Object.keys(allEntities).length;
	for(var i=0; i<len; i++){

		//get each entry and its type
		var entry = allEntities[i];
		var type = entry.type;

		//get this out of the way, makes rest of code easier
		if(!(entry.sentiment.score))
			entry.sentiment.score=0;
		
		//if new type, we must initialize a place for it
		//in both mostOccur and typesFilter
		if(!typeFilter[type]){
			typeFilter[type] = [];
			mostOccur.push({"type" : type, "occur": 0});
		}

		//find the elem in mostOccur and inc occur
		for(var e=0; e <mostOccur.length; e++)
		{
			var elem = mostOccur[e];
			if(elem.type === type){
				elem.occur++;
				break;	//efficiency
			}
		}

		//add elem to the correct type in typeFlter
		typeFilter[type].push(entry);

		//add to correct sentiment type
		if(entry.sentiment.score){
			if(100*entry.sentiment.score>0)
				typeFilter['OnlyPositive'].push(entry);
			else
				typeFilter['OnlyNegative'].push(entry);
		}
 
		//add top 12 entries to MostRelevant type
		if(i<12)
			typeFilter['MostRelevant'].push(entry);

	}

	//sort mostOccur by #occurrences
	mostOccur.sort(function(type1,type2){
		return type2.occur-type1.occur;
	});

	//DEBUG prove they are sorted by #occur
	// for(var i=0; i< mostOccur.length;i++){
	// 	console.log(JSON.stringify(mostOccur[i]));
	// }


	//append button to filter entities
	var toBeAppended="";
	var filterDiv = document.getElementById("filterDiv");

	toBeAppended+=
          "<button type=\"button\" class=\"btn btn-default dropdown-toggle\""+
          "data-toggle=\"dropdown\" style=\"background-color:#9d1f0f;color:#ffffff\">"+
            "Filter Entries <span class=\"caret\"></span>"+
          "</button>";


	//append filter choices to HTML document
	toBeAppended+="<ul class=\"dropdown-menu\" role=\"menu\">"+
	        "<li><a href=\"javascript:;\" onclick=filter(\"MostRelevant\");>Most Relevant</a></li>"+
        "<li><a href=\"javascript:;\" onclick=filter(\"OnlyPositive\");>Only Positive</a></li>"+
        "<li><a href=\"javascript:;\" onclick=filter(\"OnlyNegative\");>Only Negative</a></li>"+
        "<li class=\"divider\"></li>";

	for(var i=3; i< mostOccur.length;i++){

		var theType = mostOccur[i].type;
		var numOccur = mostOccur[i].occur;
		toBeAppended+= 
        "<li><a href=\"javascript:;\" onclick=filter(\""+theType+"\");>"+
        theType.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")+" ("+(numOccur>12 ? "12+" :numOccur)+")</a></li>";
	}

	toBeAppended+="</ul>";

	filterDiv.innerHTML=toBeAppended;

	//frst graph is always mostRelevant
	filter("MostRelevant");
}

function filter(typeToBeGraphed)
{
	//set Title
	var filteredEntries = typeFilter[typeToBeGraphed];
	document.getElementById("graphTitle").innerHTML=
		"Graphing: "+typeToBeGraphed.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");

	//graph all entries
	graphit(filteredEntries);

	//for each entry, update data box
	var len = filteredEntries.length;

	for(var i=0; i<12; i++){

		var theBox = document.getElementById("bl"+i);

		if(i<len){

			var alchEntry = filteredEntries[i];

			var toAppend="";

			toAppend=
            //"<div class=\"panel panel-default\">" +
            //"<div class=\"panel-heading\">" +
            //"<h3 class=\"panel-title\"><b>" +alchEntry.text +"</b></h3>" +
            //"</div> <!-- /panel-header -->" +
            //"<div class=\"panel-body\">
			"Type: "+alchEntry.type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")+
			"<br>Sentiment: "+parseFloat(alchEntry.sentiment.score*100).toFixed(1)+
			"<br>Relevance: "+parseFloat(alchEntry.relevance*100).toFixed(1)+
			"<br>Occurences: "+alchEntry.count;

			//look for website and database links
			if(alchEntry.disambiguated){

				//look for website
				if(alchEntry.disambiguated.website){

					toAppend+="<br>Site: <a href = \""+alchEntry.disambiguated.website+"\">"+
					alchEntry.disambiguated.website.substring(7,23);

					if(alchEntry.disambiguated.website.length>23)
						toAppend+="...";
					toAppend+="</a>"
				}

			////////Looks for any databases (picks in order of quality)
				if(alchEntry.disambiguated.ciaFactbook){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.ciaFactbook+"\">"+
					alchEntry.disambiguated.ciaFactbook.substring(7,20);

					if(alchEntry.disambiguated.ciaFactbook.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}

				else if(alchEntry.disambiguated.crunchbase){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.crunchbase+"\">"+
					alchEntry.disambiguated.crunchbase.substring(7,20);

					if(alchEntry.disambiguated.crunchbase.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}



				else if(alchEntry.disambiguated.census){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.census+"\">"+
					alchEntry.disambiguated.census.substring(7,20);

					if(alchEntry.disambiguated.census.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}

				else if(alchEntry.disambiguated.dbpedia){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.dbpedia+"\">"+
					alchEntry.disambiguated.dbpedia.substring(7,20);

					if(alchEntry.disambiguated.dbpedia.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}



				else if(alchEntry.disambiguated.freebase){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.freebase+"\">"+
					alchEntry.disambiguated.freebase.substring(7,20);

					if(alchEntry.disambiguated.freebase.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}

				else if(alchEntry.disambiguated.opencyc){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.opencyc+"\">"+
					alchEntry.disambiguated.opencyc.substring(7,20);

					if(alchEntry.disambiguated.opencyc.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}

				else if(alchEntry.disambiguated.yago){

					toAppend+="<br>Database: <a href = \""+alchEntry.disambiguated.yago+"\">"+
					alchEntry.disambiguated.yago.substring(7,20);

					if(alchEntry.disambiguated.yago.length>20)
						toAppend+="...";
					toAppend+="</a>"

				}


			}
            
            toAppend += 
                "</div> <!-- /panel-body -->" +
                "</div> <!-- /panel -->"

			theBox.innerHTML=toAppend;

		}
		else{

			theBox.innerHTML="";

		}


	}

}
