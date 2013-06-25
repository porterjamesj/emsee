
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
