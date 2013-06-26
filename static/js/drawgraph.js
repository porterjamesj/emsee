
$(function() { 

  var drawPlot = function(plot) {    
    // clear previous svg
    d3.select("body").select("svg").remove();

    // draw a new one
    plot.makeSvg();
    plot.makeScales();
    plot.draw();
    
    // animate the sampler
    plot.animateChain()
    
    console.log(plot);
  }

  var callbackTwoDee = function(data) {    
    plot = new TwoDeePlot(600,500,
			    {top: 80, right: 80, bottom: 80, left: 80},
			    data);
    drawPlot(plot);
  };

  var callbackOneDee = function(data) {
    plot = new OneDeePlot(600,500,
			  {top: 80, right: 80, bottom: 80, left: 80},
			  data);
    drawPlot(plot);
  };

  var submitTwoDee = function() {
    $.getJSON($SCRIPT_ROOT + '/drawgraph2d',
	      /* The address to which we will send the request. */
	      {eq: $('input.twodee[name="equation"]').val(),
               minx: $('input.twodee[name="minx"]').val(),
               maxx: $('input.twodee[name="maxx"]').val(),
               miny: $('input.twodee[name="miny"]').val(),
               maxy: $('input.twodee[name="maxy"]').val()}, 
	      /* The JS object that flask will build the request out of. */ 
	      callbackTwoDee /* Callback function. */);
    return false;
  };

  var submitOneDee = function() {
    $.getJSON($SCRIPT_ROOT + '/drawgraph',
	      /* The address to which we will send the request. */
	      {eq: $('input.onedee[name="equation"]').val(),
               minx: $('input.onedee[name="minx"]').val(),
               maxx: $('input.onedee[name="maxx"]').val()},
	      /* The JS object that flask will build the request out of. */ 
	      callbackOneDee /* Callback function. */);
    return false;
  };

  //Bind clicking and keydown to submit the data to the server
  $('a#submit-onedee').click(submitOneDee);
  $('a#submit-twodee').click(submitTwoDee);
  
  $('input.onedee').keydown(
    function (e) {
      if (e.keyCode === 13) {
	submitOneDee();
      }
    });
    
  $('input.twodee').keydown(
    function (e) {
      if (e.keyCode === 13) {
	submitTwoDee();
      }
    });
});
