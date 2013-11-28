


function linkRequest(){

	var URL = document.getElementById("urlIn").value;
	document.getElementById("graph").innerHTML="<br>Getting data for URL: <u>"+URL+"</u><br>";


	var jqxhr = $.post( "/", {data:URL},function() {
	})
	.done(function(data) {
		graphit(data);
	})
	.fail(function() {
		alert( "error querying our own server" );
	});


	return false;



}


function graphit(strAlchData){

	var jsonAlchData = JSON.parse(strAlchData);

	if(jsonAlchData.status=="ERROR")
		alert("error with alch req: "+jsonAlchData.statusInfo);

	var allEntities = jsonAlchData.entities;

	var data = [allEntities[0],
		allEntities[1],allEntities[2],allEntities[3],
		allEntities[4],allEntities[5],allEntities[6],allEntities[7]
		,allEntities[8],allEntities[9],allEntities[10],allEntities[11],
		allEntities[12]];

	var least = 100;
	var most = -100;

	//preproccess
	for(var i=0; i<data.length; i++){

		if(!(data[i].sentiment.score))
			data[i].sentiment.score=0;

		var sent = data[i].sentiment.score*100;

		if(sent>most)
			most = sent;
		if(sent<least)
			least = sent;
	}





	//set width and height of graph
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 700 - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom;

	//set ranges and domains for x,y axis
	var x = d3.scale.linear()
	.range([0, width]);

	var y = d3.scale.linear()
	.range([height, 0]);

	x.domain([least-10,most+10]);	
	y.domain([0,10]);


	//initialzie axiss
	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");


	//actually add the svg graph elem to the div "graph" in page
	var svg = d3.select("#graph").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.style("text-anchor", "end")
	.text("Sentiment");

	var mostneg = 0;
	var mostpos = 0;
	var numArt = 0;


	var redToYel = d3.scale.linear().domain([least,0]).range(['red', 'yellow']);
	var yelToGreen = d3.scale.linear().domain([0,most]).range(['yellow', 'green']);

	var tip = d3tip().attr('class', 'd3-tip').html(
		function(d) { 
			return "<font color=\"fd01c6\"size=5>"+d.text+"</font><p>Relevance: "
			+parseFloat(d.relevance*100).toFixed(1)+"%<br>Sentiment: <font color=\""
			+getScaledColor(redToYel,yelToGreen,100*d.sentiment.score)+"\">"+
			parseFloat(d.sentiment.score*100).toFixed(1)+"</font>"; 

		});

	svg.call(tip);



	svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("r", function(d) { return (d.relevance*50)+10; })
	.attr("cx", function(d) {

		var score = 100*d.sentiment.score;
		return x(score);

		 })
	.style("opacity", .7)
	.style("fill",function(d){ 

		var score = 100*d.sentiment.score;
		return getScaledColor(redToYel,yelToGreen,score);

		})
	.attr("cy", function(d) { return y(5); })
	.on('mouseover', tip.show)
    .on('mouseout', tip.hide);
	

}


function getScaledColor(redToYel,yelToGreen,score){


		return (score<0) ? redToYel(score) : yelToGreen(score);

}