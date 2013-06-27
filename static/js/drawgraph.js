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

    // Get data from the right form
    if(obj.attr("class") == "onedee") {
      data = {eq: $('input.onedee[name="equation"]').val(),
              xmin: $('input.onedee[name="xmin"]').val(),
              xmax: $('input.onedee[name="xmax"]').val(),
              dim: 1}
    } else if(obj.attr("class") == "twodee") {
      data = {eq: $('input.twodee[name="equation"]').val(),
              xmin: $('input.twodee[name="xmin"]').val(),
              xmax: $('input.twodee[name="xmax"]').val(),
              ymin: $('input.twodee[name="ymin"]').val(),
              ymax: $('input.twodee[name="ymax"]').val(),
              dim: 2}
    }

    // Make the ajax call using the right data
    $.ajax({
      dataType: "json",
      url: $SCRIPT_ROOT + '/drawgraph',
      data: data,
      success: function (data) {callback(data,obj.attr("class"));}
    });
  };

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

  /*
   * Bind hiding and showing the loading spinner to AJAX event handlers
   */
});
