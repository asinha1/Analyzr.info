
window.onload = function(){



}

function linkRequest(){

	var URL = document.getElementById("urlIn").value;
	document.getElementById("graph").innerHTML="<br>Getting data for URL: <u>"+URL+"</u><br>";

	


	alert("Sending ajax req for: "+URL);

	var jqxhr = $.post( "/", {data:URL},function() {
	})
	.done(function(data) {
		alert("Recieved from our own server: "+data);
		graphit();
	})
	.fail(function() {
		alert( "error querying our own server" );
	});


	return false;



}


function graphit(){


/*
	var sampleSVG = d3.select("#graph")
	.append("svg")
	.attr("width", 100)
	.attr("height", 100);    

	sampleSVG.append("circle")
	.style("stroke", "gray")
	.style("fill", "white")
	.attr("r", 40)
	.attr("cx", 50)
	.attr("cy", 50)
	.on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
	.on("mouseout", function(){d3.select(this).style("fill", "white");});
	*/


	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 700 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
	.range([0, width]);

	var y = d3.scale.linear()
	.range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

	var svg = d3.select("#graph").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



			var data = [
	{'sepalWidth':1, 'sepalLength':1, 'rad':6},
	{'sepalWidth':2, 'sepalLength':2, 'rad':10},
	{'sepalWidth':3, 'sepalLength':3, 'rad':14},
	{'sepalWidth':4, 'sepalLength':4, 'rad':18}
	];

		x.domain(d3.extent(data, function(d) { return d.sepalWidth; })).nice();
		y.domain(d3.extent(data, function(d) { return d.sepalLength; })).nice();

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Sepal Width (cm)");

		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Sepal Length (cm)")

		svg.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", function(d) { return (d.rad); })
		.attr("cx", function(d) { return x(d.sepalWidth); })
		.attr("cy", function(d) { return y(d.sepalLength); })
		.style("fill", function(d) { return color(d.species); });

		var legend = svg.selectAll(".legend")
		.data(color.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

		legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) { return d; });



}