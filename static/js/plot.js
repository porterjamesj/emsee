var Plot = function(swidth,sheight,margin) {
  this.swidth = swidth;
  this.sheight = sheight;
  this.margin = margin;
  this.width = swidth - margin.left - margin.right;
  this.height = sheight - margin.top - margin.bottom; 
};

/* 
 * Append an svg on which to draw the plot.
 */
Plot.prototype.makeSvg = function() {
  d3.select("body").append("svg")
    .attr("width",this.swidth)
    .attr("height",this.sheight)
    .append("svg:g")
    .attr("id","plot")
    .attr("transform",
	  "translate(" + this.margin.left + "," + this.margin.top  + ")");

  this.svg = d3.select("g#plot");
};

Plot.prototype.animateChain = function() {
  // Counter for chain step
  var i = 1
  // Initialize circle
  var self = this;

  var circle = this.svg.selectAll("circle")
    .data(self.chain.slice(0,1))
    .enter().append("circle")
    .attr("r",10);

  // Initialize circle location
  if(self.constructor === TwoDeePlot) { // This is a TwoDeePlot
    circle
      .attr("cx", function(d) { return self.fxsc(d[0]); })
      .attr("cy", function(d) { return self.fysc(d[1]); });
  } else { // This is a OneDeePlot
    circle
      .attr("cx", function(d) { return self.fxsc(d); })
      .attr("cy", this.height);
  }

  var update = function() {
    console.log(i);
    if (i < self.chain.length) {
      circle.data(self.chain.slice(i,i+1))
      if(self.constructor === TwoDeePlot) { // This is a TwoDeePlot
	circle
	  .transition()
	  .attr("cx", function(d) { console.log(d); 
				    console.log(self.fxsc(d[0]));
				    return self.fxsc(d[0]); })
	  .attr("cy", function(d) { return self.fysc(d[1]); });
      } else { // This is a OneDeePlot
	circle
	  .transition()
	  .attr("cx", function(d) { return self.fxsc(d); })
      }
      i++; 
    }
    setTimeout(update,500);
  };

  setTimeout(update,500);
};

/*
 * Subclass for a one dimensional plot
 */
var OneDeePlot = function(swidth,shieght,margin,width,height,
			  points,xmin,xmax,chain) {
  Plot.call(this);
  this.points = points;
  this.xmin = xmin;
  this.xmax = xmax;
  this.chain = chain;
}
// Inheritance
OneDeePlot.prototype = Object.create(Plot.prototype);
// Correct constructor
OneDeePlot.prototype.constructor = OneDeePlot

/* 
 * Make scales to map from function space into svg space
 */
OneDeePlot.prototype.makeScales = function() {
  this.fxsc = d3.scale.linear()
    .domain([this.xmin,this.xmax])
    .range([0,this.width]);
  
  this.fysc = d3.scale.linear()
    .domain([d3.min(_.pluck(points,1)),d3.max(_.pluck(points,1))])
    .range([this.height,0]);
};

/*
 * Draw the plot on the svg
 */
OneDeePlot.prototype.draw = function () {
  
  //Actually draw the plot
  svg.append("svg:path")
    .attr("d",d3.svg.line()
	  .x(function(d) { return this.fxsc(d[0]); })
	  .y(function(d) { return this.fysc(d[1]); })
	  .interpolate("linear"))
    .attr("class","line");

  // Add axes
  svg.append("svg:g")
    .attr("transform","translate(0," + height + ")")
    .attr("class","x axis")
    .call(d3.svg.axis()
	  .scale(this.fxsc)
	  .orient("bottom")
	  .ticks(5));

  svg.append("svg:g")
    .attr("class","y axis")
    .call(d3.svg.axis()
	  .scale(this.fysc)
	  .orient("left")
	  .ticks(5));
};


/*
 * Subclass for two dimensional plot
 */
var TwoDeePlot = function(swidth,sheight,margin,data) {
  Plot.call(this,swidth,sheight,margin);
  this.zs = data['zs'];
  this.xmin = data['xmin'];
  this.xmax = data['xmax'];
  this.ymin = data['ymin'];
  this.ymax = data['ymax'];
  this.zmin = data['zmin'];
  this.zmax = data['zmax'];
  this.chain = data['chain'];
};
// Inheritance
TwoDeePlot.prototype = Object.create(Plot.prototype);
// Correct constructor
TwoDeePlot.prototype.constructor = TwoDeePlot;

/* 
 * Make scales to map from function space into svg space,
 * from "index space" into svg space, and from z to color.
 */
TwoDeePlot.prototype.makeScales = function() {
  // color scale
  this.colorsc = d3.scale.linear()
    .domain([this.zmin, this.zmax])
    .range(["blue", "yellow"])
    .interpolate(d3.interpolateLab);

  // Scales to map from index space onto svg space
  this.ixsc = d3.scale.linear()
    .domain([0,this.zs[0].length])
    .range([0,this.width]);

  this.iysc = d3.scale.linear()
    .domain([0,this.zs.length])
    .range([this.height,0]);

  // Scales from function space into svg space
  this.fxsc = d3.scale.linear()
    .domain([this.xmin,this.xmax])
    .range([0,this.width]);
  
  this.fysc = d3.scale.linear()
    .domain([this.ymin,this.ymax])
    .range([this.height,0]);  
};

/*
 * Actually draw on the svg
 */
TwoDeePlot.prototype.draw = function() {
  //First we need to generate contours for the zs data

  // Add a "cliff" to the edges so that paths fill correctly
  var cliff = this.zmin-Math.abs(1000*this.zmax);
  this.zs.push(d3.range(this.zs[0].length).map(function() { return cliff; }));
  this.zs.unshift(d3.range(this.zs[0].length).map(function() { return cliff; }));
  this.zs.forEach(function(d) {
    d.push(cliff);
    d.unshift(cliff);
  });

  // Now do the contouring
  var c = new Conrec();
  var xs = d3.range(0, this.zs[0].length);
  var ys = d3.range(0, this.zs.length);
  var zstepsize = (this.zmax-this.zmin) / 15;
  var levels = d3.range(this.zmin, this.zmax, zstepsize);

  c.contour(this.zs, 0, xs.length-1, 0, ys.length-1, xs, ys, levels.length, levels); 

  //Draw contours on svg
  this.svg.selectAll("path").data(c.contourList())
    .enter().append("svg:path")
    .attr("d",d3.svg.line()
	  .x(function(d) { return this.ixsc(d.x); }.bind(this))
	  .y(function(d) { return this.iysc(d.y); }.bind(this)))
    .attr("fill",function(d) { return this.colorsc(d.level); }.bind(this))
    .attr("stroke","black");

  // TODO: Add an area calculation, order path elements by area
  
  // Draw axes
  this.svg.append("svg:g")
    .attr("transform","translate(0," + this.height + ")")
    .attr("class","x axis")
    .call(d3.svg.axis()
	   .scale(this.fxsc)
	   .orient("bottom")
	   .ticks(5));

  this.svg.append("svg:g")
    .attr("class","y axis")
    .call(d3.svg.axis()
	  .scale(this.fysc)
	  .orient("left")
	  .ticks(5));
};
