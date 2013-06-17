// fooling around with d3.geom.contour

var mygrid = function(x,y) {
  if(x > 30 && x < 50 && y > 30 && y < 50) {
    return true;
  }
  else {
    return false;
  }
};

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

    // Dynamically generate the isoline levels
    var levels = d3.range(data.zmin,data.zmax,(data.zmax-data.zmin)/20)

    console.log(levels);

    // Make a color scale
    var colorsc = d3.scale.linear()
      .domain([0,data.ys.length])
      .range(["#fff", "red"]);

    // the grid function
    var isoline = function(min) {
      return function(x,y) {
	return x >=0 && y >=0 && 
	  x <= data.xs.length-1 && y <= data.ys.length-1
	  && zs[y][x] >= min;
      };
    };
    
    // Scales to map from grid space onto svg space
    var xsc = d3.scale.linear()
      .domain([0,data.xs.length])
      .range([0,width]);

    var ysc = d3.scale.linear()
      .domain([0,data.ys.length])
      .range([height,0]);

    // generate contour lines
    var conLine = d3.svg.line()
      .x(function(d) { console.log(d); return xsc(d[0]); })
      .y(function(d) { console.log(d); return ysc(d[1]); })
      .interpolate("linear");
    
    var svg = d3.select("g#plot");
    
    svg.selectAll(".isoline")
      .data(levels.map(isoline)) // each datum is the grid function for this level
      .enter().append("path")
      .datum(function(d) { return d3.geom.contour(d); })
      .attr("class","isoline")
      .attr("fill","none")//function (d) {return colorsc(d[1]); })
      .attr("stroke","black")
      .attr("d",conLine);
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
