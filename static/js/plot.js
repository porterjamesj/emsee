;(function (exports) {

  var calcDims = function(data) {
    data.width = data.swidth - data.margin.left - data.margin.right;
    data.height = data.sheight - data.margin.top - data.margin.bottom;
  };

  var makeSvg = function(element,data) {
    element.append("svg")
      .attr("width",data.swidth)
      .attr("height",data.sheight)
      .append("svg:g")
      .attr("id","plot")
      .attr("transform",
            "translate(" + data.margin.left + "," + data.margin.top  + ")");
    return element.select("g#plot");
  };

  var animateChain = function(svg,data) {
    // Counter for chain step
    var i = 1;

    var self = this;

    // Initialize circle
    var circle = svg.selectAll("circle")
      .data(data.chain.slice(0,1))
      .enter().append("circle")
      .attr("r",10);

    // Initialize circle location
    if(data.dims === 2) { // This is a TwoDeePlot
      circle
        .attr("cx", function(d) { return data.fxsc(d[0]); })
        .attr("cy", function(d) { return data.fysc(d[1]); });
    } else if (data.dims === 1) { // This is a OneDeePlot
      circle
        .attr("cx", function(d) { return data.fxsc(d); })
        .attr("cy", data.height);
    }

    setInterval(function() {
      console.log(i);
      if (i < data.chain.length) {
        circle.data(data.chain.slice(i,i+1));
        if(data.dims === 2) { // This is a TwoDeePlot
          circle
            .transition()
            .attr("cx", function(d) { return data.fxsc(d[0]); })
            .attr("cy", function(d) { return data.fysc(d[1]); });
        } else if(data.dims === 1) { // This is a OneDeePlot
          circle
            .transition()
            .attr("cx", function(d) { return data.fxsc(d); });
        }
        i++;
      }
    },500);
  };

  exports.drawOneDee = function (element,data) {
    /* Figure out width and height of plot. */
    calcDims(data);

    /* First we need to make an svg to draw the plot on. */
    svg = makeSvg(element,data);
    /* Now make the scales to map from function space to svg space. */
    data.fxsc = d3.scale.linear()
      .domain([data.xmin,data.xmax])
      .range([0,data.width]);

    data.fysc = d3.scale.linear()
      .domain([d3.min(data.points.map(function(d) { return d[1]; })),
               d3.max(data.points.map(function(d) { return d[1]; }))])
      .range([data.height,0]);
    /* Now actually draw the plot. */

    /* First produce a function to draw the polyline from the data. */
    var lineFunction = d3.svg.line()
      .x(function(d) { return data.fxsc(d[0]); })
      .y(function(d) { return data.fysc(d[1]); })
      .interpolate("linear");

    //Actually draw the plot
    svg.append("svg:path")
      .attr("d",lineFunction(data.points))
      .attr("class","line");

    // Add axes
    svg.append("svg:g")
      .attr("transform","translate(0," + data.height + ")")
      .attr("class","x axis")
      .call(d3.svg.axis()
            .scale(data.fxsc)
            .orient("bottom")
            .ticks(5));

    svg.append("svg:g")
      .attr("class","y axis")
      .call(d3.svg.axis()
            .scale(data.fysc)
            .orient("left")
            .ticks(5));

    // Animate
    animateChain(svg,data);
  };

  exports.drawTwoDee = function (element,data) {
    /* Figure out width and height of plot. */
    calcDims(data);

    /* First make the svg. */
    var svg = makeSvg(element,data);

    /* Now make scales. */

    /* Color scale. */
      var colorsc = d3.scale.linear()
      .domain([data.zmin, data.zmax])
      .range(["blue", "yellow"])
      .interpolate(d3.interpolateLab);

    // Scales to map from index space onto svg space
      var ixsc = d3.scale.linear()
      .domain([0,data.zs[0].length])
      .range([0,data.width]);
      var iysc = d3.scale.linear()
      .domain([0,data.zs.length])
      .range([data.height,0]);

    // Scales from function space into svg space
    data.fxsc = d3.scale.linear()
      .domain([data.xmin,data.xmax])
      .range([0,data.width]);
    data.fysc = d3.scale.linear()
      .domain([data.ymin,data.ymax])
      .range([data.height,0]);

    /* Draw the contours. */

    // Add a "cliff" to the edges so that paths fill correctly
    var cliff = data.zmin-Math.abs(1000*data.zmax);
    data.zs.push(d3.range(data.zs[0].length)
                 .map(function() {return cliff;}));
    data.zs.unshift(d3.range(data.zs[0].length)
                    .map(function() {return cliff;}));
    data.zs.forEach(function(d) {
      d.push(cliff);
      d.unshift(cliff);
    });

    // Now do the contouring
    var c = new Conrec();
    var xs = d3.range(0, data.zs[0].length);
    var ys = d3.range(0, data.zs.length);
    var zstepsize = (data.zmax-data.zmin) / 15;
    var levels = d3.range(data.zmin, data.zmax, zstepsize);
    c.contour(data.zs, 0, xs.length-1, 0, ys.length-1,
              xs, ys, levels.length, levels);

    // Now draw contours on svg
    svg.selectAll("path").data(c.contourList())
      .enter().append("svg:path")
      .attr("d",d3.svg.line()
            .x(function(d) { return ixsc(d.x); })
            .y(function(d) { return iysc(d.y); }))
      .attr("fill",function(d) { return colorsc(d.level); })
      .attr("stroke","black");

    //Draw axes
    svg.append("svg:g")
      .attr("transform","translate(0," + data.height + ")")
      .attr("class","x axis")
      .call(d3.svg.axis()
            .scale(data.fxsc)
            .orient("bottom")
            .ticks(5));

    svg.append("svg:g")
      .attr("class","y axis")
      .call(d3.svg.axis()
            .scale(data.fysc)
            .orient("left")
            .ticks(5));

    // Animate
    animateChain(svg,data);
  };

})(this);
