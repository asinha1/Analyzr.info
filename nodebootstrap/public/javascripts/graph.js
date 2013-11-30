var x,y,margin,xAxis,svg,width,height;

window.onload = function(){

	//set width and height of graph
	margin = {top: 20, right: 20, bottom: 30, left: 40};
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

function linkRequest(){

	var URL = document.getElementById("urlIn").value;


	//post our own server
	var jqxhr = $.post( "/", {data:URL},function() {
	})
		//CALLBACK
		.done(function(data) {
			graphit(data);
		})
		.fail(function() {
			alert( "error querying our own server" );
	});


	//we dont want calling form to submit request
	return false;

}


function graphit(strAlchData){

	var jsonAlchData = JSON.parse(strAlchData);

	//catch error
	if(jsonAlchData.status=="ERROR")
		alert("error with alch req: "+jsonAlchData.statusInfo);


	var allEntities = jsonAlchData.entities;

	var data = [];

	//get only 10 most relevant entries IF there are 10
	for(var i=0; (i<10 && i<Object.keys(allEntities).length); i++){

		data[i] = allEntities[i];
	}
	

	var least = 100;
	var most = -100;

	//preproccess the outer most values
	//if sentiment is neutral, give score of 0
	for(var i=0; i<data.length; i++){

		if(!(data[i].sentiment.score))
			data[i].sentiment.score=0;

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


		return (score<0) ? redToYel(score) : yelToGreen(score);

}