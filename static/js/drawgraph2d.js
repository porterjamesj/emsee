
$(function() { 

  var callback = function(data) {

    // Make a new plot object
    myplot = new TwoDeePlot(600,500,
			    {top: 80, right: 80, bottom: 80, left: 80},
			    data);

    // clear previous svg
    d3.select("body").select("svg").remove();

    // draw a new one
    myplot.makeSvg();
    myplot.makeScales();
    myplot.draw();
    
    console.log(myplot);

    // Plot the Markov chain
    
    var i = 1;
    var chain = data.chain;

    console.log(chain);

    // Initialize circle
    var circle = svg.selectAll("circle")
      .data(chain.slice(0,1))
      .enter().append("circle")
      .attr("cx", function(d) { return fxsc(d[0]); })
      .attr("cy", function(d) { return fysc(d[1]); })
      .attr("r",10);

    var update = function() {
      console.log(i);
      circle.data(chain.slice(i,i+1))
    	.transition()
    	.attr("cx", function(d) { return fxsc(d[0]); })
    	.attr("cy", function(d) { return fysc(d[1]); });
      i++;

      setTimeout(update,500);
    }

    // begin update chain
    update()
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
