
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
    
    // animate the sampler
    myplot.animateChain()
    
    console.log(myplot);
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
	      callback /* Callback function. */);
    return false;
  };

  var submitOneDee = function() {
    $.getJSON($SCRIPT_ROOT + '/drawgraph',
	      /* The address to which we will send the request. */
	      {eq: $('input.onetwodee[name="equation"]').val(),
               minx: $('input.onetwodee[name="minx"]').val(),
               maxx: $('input.onetwodee[name="maxx"]').val()},
	      /* The JS object that flask will build the request out of. */ 
	      callback /* Callback function. */);
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
