$(function() { 

  var callback = function(data) {
    console.log(data);

    // Clear the previous plot
    d3.select("body").select("svg").remove();
    
    // Parameters for the svg canvas
    var swidth = 600;
    var sheight = 500;

    var margin = {top: 80, right: 80, bottom: 80, left: 80};
    var width = swidth - margin.left - margin.right;
    var height = sheight - margin.top - margin.bottom;

    // Make an svg to draw the plot on
    d3.select("body").append("svg")
      .attr("width",swidth)
      .attr("height",sheight)
      .append("svg:g")
      .attr("id","plot")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var zs = data.zs;

    // Add a "cliff" so that paths fill correctly

    var cliff = data.zmin-Math.abs(1000*data.zmax);
    data.zs.push(d3.range(data.zs[0].length).map(function() { return cliff; }));
    data.zs.unshift(d3.range(data.zs[0].length).map(function() { return cliff; }));
    data.zs.forEach(function(d) {
      d.push(cliff);
      d.unshift(cliff);
    });

    // Now do contouring
    var c = new Conrec();
    var xs = d3.range(0, data.zs[0].length);
    var ys = d3.range(0, data.zs.length);
    var zstepsize = (data.zmax-data.zmin) / 15;
    var levels = d3.range(data.zmin, data.zmax, zstepsize);
    
    c.contour(data.zs, 0, xs.length-1, 0, ys.length-1, xs, ys, levels.length, levels); 

    console.log(c.contourList());

    // Make a color scale
    var colorsc = d3.scale.linear()
      .domain([data.zmin, data.zmax])
      .range(["blue", "yellow"])
      .interpolate(d3.interpolateLab);

    // Scales to map from grid space onto svg space
    var xsc = d3.scale.linear()
      .domain([0,data.xs.length])
      .range([0,width]);

    var ysc = d3.scale.linear()
      .domain([0,data.ys.length])
      .range([height,0]);
    
    // Axes
    var xAxis = d3.svg.axis()
      .scale(d3.scale.linear()
	     .domain([data.xmin,data.xmax])
	     .range([0,width]))
      .orient("bottom")
      .ticks(5);

    var yAxis = d3.svg.axis()
      .scale(d3.scale.linear()
	     .domain([data.ymin,data.ymax])
	     .range([height,0]))
      .orient("left")
      .ticks(5);

    var svg = d3.select("g#plot");

    // Draw contours
    svg.selectAll("path").data(c.contourList())
      .enter().append("svg:path")
      .attr("d",d3.svg.line()
	    .x(function(d) { return xsc(d.x); })
	    .y(function(d) { return ysc(d.y); }))
      .attr("fill",function(d) { return colorsc(d.level); })
      .attr("stroke","black");

    // TODO: Add an area calculation, order path elements by area
    
    // Add axes
    svg.append("svg:g")
      .attr("transform","translate(0," + height + ")")
      .attr("class","x axis")
      .call(xAxis);

    svg.append("svg:g")
      .attr("class","y axis")
      .call(yAxis);

    // Plot the Markov chain

  };

  var submit_func = function() {
    $.getJSON($SCRIPT_ROOT + '/drawgraph2d',
	      /* The address to which we will send the request. */
	      {eq: $('input[name="equation"]').val(),
               minx: $('input[name="minx"]').val(),
               maxx: $('input[name="maxx"]').val(),
               miny: $('input[name="miny"]').val(),
               maxy: $('input[name="maxy"]').val()}, 
	      /* The JS object that flask will build the request out of. */ 
	      callback /* Callback function. */);
    return false;
  };

  //Bind clicking and keydown to submit the data to the server
  $('a#submit').click(submit_func);
  
  $('input').keydown(
    function (e) {
      if (e.keyCode === 13) {
	submit_func();
      }
    });
});
