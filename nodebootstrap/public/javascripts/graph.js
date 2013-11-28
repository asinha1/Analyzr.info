


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

	var data = jsonAlchData.entities;

	alert(JSON.stringify(data));

	//set width and height of graph
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 700 - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom;

	//set ranges and domains for x,y axis
	var x = d3.scale.linear()
	.range([0, width]);

	var y = d3.scale.linear()
	.range([height, 0]);

	x.domain([-100,100]);
	y.domain([0,10]);

	var color = d3.scale.category10();

	//initialzie axiss
	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

	//actually add the svg graph elem to the div "graph" in page
	var svg = d3.select("#graph").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



	// var data = [
	// {'sentiment':90, 'sepalLength':3, 'rad':6},
	// {'sentiment':-70, 'sepalLength':4, 'rad':10},
	// {'sentiment':0, 'sepalLength':5, 'rad':14},
	// {'sentiment':20, 'sepalLength':6, 'rad':18}
	// ];



	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.attr("y", -6)
	.style("text-anchor", "end")
	.text("Sentiment");


/////////// Displays y-axis.  We do not need one

	// svg.append("g")
	// .attr("class", "y axis")
	// .call(yAxis)
	// .append("text")
	// .attr("class", "label")
	// .attr("transform", "rotate(-90)")
	// .attr("y", 6)
	// .attr("dy", ".71em")
	// .style("text-anchor", "end")
	// .text("Sepal Length (cm)")

	svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("r", function(d) { return (d.relevance); })
	.attr("cx", function(d) { alert(d.sentiment.score);return 100*(parseInt(d.sentiment.score)); })
	.attr("cy", function(d) { return 5; })
	.style("fill", function(d) { return color(d.species); });


}