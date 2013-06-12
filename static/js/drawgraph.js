$(function() {    

    // Parameters for the svg canvas
    var width = 400;
    var height = 100;

    // Make an svg to draw the plot on
    d3.select("body").append("svg")
	.attr("width",width)
	.attr("height",height);

    var callback = function(data) {	
	$("#word").text(data.word);

	var points = data.points

	// Scales
	var xsc = d3.scale.linear()
	    .domain([data.xmin,data.xmax])
	    .range([0,width]);

	var ysc = d3.scale.linear()
	    .domain([d3.min(_.pluck(points,1)),d3.max(_.pluck(points,1))])
	    .range([height,0]);

	// Draw the plot
	var svg = d3.select("svg");
	var lineFunction = d3.svg.line()
	    .x(function(d) { return xsc(d[0]); })
	    .y(function(d) { return ysc(d[1]); })
	    .interpolate("basis");

	// Clear the previous plot
	svg.select("path").remove()

	var lineGraph = svg.append("path")
	    .attr("d",lineFunction(points))
	    .attr("stroke","blue")
	    .attr("stroke-width",3)
	    .attr("fill","none");
    };

    var submit_func = function() {
	$.getJSON($SCRIPT_ROOT + '/drawgraph',
		  /* The address to which we will send the request. */
		  {eq: $('input[name="equation"]').val()}, 
		  /* The JS object that flask will build the request out of. */ 
		  callback /* Callback function. */);
	return false;
    };

    $('a#submit').click(submit_func);
});
