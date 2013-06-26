$(function() {
  /*
   * Callback function that runs after the server returns
   * from the AJAX call. This is where the plot object is actually
   * constructed and the svg drawn/animated.
   */
  var callback = function(data,dim) {
    // check dims and construct the appropriate type of plot
    if(dim === "onedee") {
      plot = new OneDeePlot(600,500,
                            {top: 80, right: 80, bottom: 80, left: 80},
                            data);
    } else if(dim === "twodee") {
      plot = new TwoDeePlot(600,500,
                            {top: 80, right: 80, bottom: 80, left: 80},
                            data);
    }
    console.log(plot);

    // Now append an svg to the correct div for whichever tab we're in
    plot.makeSvg(d3.select("#" + dim));
    plot.makeScales();
    plot.draw();

    // animate the sampler
    plot.animateChain()
  }

  /*
   * Function called when the user submits form data.
   * Takes as input either a DOM element or jQuery selection
   * to which the resulting plot should be appended.
   */
  var submit = function(obj) {
    if(!(obj instanceof jQuery)) {
      obj = $(obj);
    }

    // clear previous svg from the correct tab
    d3.select("#" + obj.attr("class")).select("svg").remove();

    if(obj.attr("class") == "onedee") {
      $.getJSON($SCRIPT_ROOT + '/drawgraph',
                {eq: $('input.onedee[name="equation"]').val(),
                 xmin: $('input.onedee[name="xmin"]').val(),
                 xmax: $('input.onedee[name="xmax"]').val()},
                function (data) {callback(data,obj.attr("class"));});
    } else if(obj.attr("class") == "twodee") {
      $.getJSON($SCRIPT_ROOT + '/drawgraph2d',
                {eq: $('input.twodee[name="equation"]').val(),
                 minx: $('input.twodee[name="minx"]').val(),
                 maxx: $('input.twodee[name="maxx"]').val(),
                 miny: $('input.twodee[name="miny"]').val(),
                 maxy: $('input.twodee[name="maxy"]').val()},
                function (data) {callback(data,obj.attr("class"));});
    }
  }

  /*
   * Bind clicking and keydown to submit the data to the server.
   */
  $('a#submit').click(function() { submit(this); });

  $('input.onedee').keydown(
    function (e) {
      if (e.keyCode === 13) {
        submit(this);
      }
    });

  $('input.twodee').keydown(
    function (e) {
      if (e.keyCode === 13) {
        submit(this);
      }
    });
});
