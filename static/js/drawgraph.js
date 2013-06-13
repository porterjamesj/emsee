$(function() {    

    // Callback function when the getJSON call returns, draws the svg.
    var callback = function(data) {	
	      $("#word").text(data.word);

	      // Clear the previous plot
	      d3.select("body").select("svg").remove();
        
        // Parameters for the svg canvas
        var swidth = 500;
        var sheight = 500;

        var margin = {top: 50, right: 50, bottom: 50, left: 50};
        var width = 500 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        // Make an svg to draw the plot on
        d3.select("body").append("svg")
	          .attr("width",swidth)
	          .attr("height",sheight)
            .append("svg:g")
            .attr("id","plot")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	      // Less verbose
	      var points = data.points

	      // Scales
	      var xsc = d3.scale.linear()
	          .domain([data.xmin,data.xmax])
	          .range([0,width]);

	      var ysc = d3.scale.linear()
	          .domain([d3.min(_.pluck(points,1)),d3.max(_.pluck(points,1))])
	          .range([height,0]); // These are inverted because (0,0) is svg top right

        //Axes
        var xAxis = d3.svg.axis()
            .scale(xsc)
            .orient("bottom")
            .ticks(5)

        var yAxis = d3.svg.axis()
            .scale(ysc)
            .orient("left")
            .ticks(5);

        // Function to generate svg line from data
        var lineFunction = d3.svg.line()
	          .x(function(d) { return xsc(d[0]); })
	          .y(function(d) { return ysc(d[1]); })
	          .interpolate("linear");

	      var svg = d3.select("g#plot");

	      // Actually draw the graph
	      svg.append("svg:path")
	          .attr("d",lineFunction(points))
	          .attr("stroke","blue")
	          .attr("stroke-width",3)
	          .attr("fill","none");

        // Add axes
        svg.append("svg:g")
            .attr("transform","translate(0," + height + ")")
            .call(xAxis);

        svg.append("svg:g")
            // .attr("transform","translate(0," + height + ")")
            .call(yAxis);
        
    };

    // Function to be called when the user submits 
    var submit_func = function() {
	      $.getJSON($SCRIPT_ROOT + '/drawgraph',
		              /* The address to which we will send the request. */
		              {eq: $('input[name="equation"]').val(),
                  minx: $('input[name="minx"]').val(),
                  maxx: $('input[name="maxx"]').val()}, 
		              /* The JS object that flask will build the request out of. */ 
		              callback /* Callback function. */);
	      return false;
    };

    //Bind clicking and keydown to submit the data to the server
    $('a#submit').click(submit_func);
    
    $('input[name="equation"]').keydown(
	      function (e) {
            console.log(e);
	          if (e.keyCode === 13) {
		            submit_func();
	          }
        })
});
