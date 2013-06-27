$(function() {
  /*
   * Callback function that runs after the server returns
   * from the AJAX call. This is where the plot object is actually
   * constructed and the svg drawn/animated.
   */
  var callback = function(data,dim) {
    //First check for errors
    if (data.error == 0) { //This was a parse error
      console.log("parse")
    } else if (data.error == 1) { //This was an evaluation error
      console.log("eval")
    }

    // check dims and construct the appropriate type of plot
    if (dim === "onedee") {
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
    //  dont think this is necessary
    if(!(obj instanceof jQuery)) {
      obj = $(obj);
    }

    // clear previous svg
    obj.children("svg").remove();

    // Select correct html elements to work on in the ajax call
    if(obj.attr("id") == "onedee") {
      var data = {eq: obj.find('input[name="equation"]').val(),
              xmin: obj.find('input[name="xmin"]').val(),
              xmax: obj.find('input[name="xmax"]').val(),
              dim: 1};
      var elem = $('#load1');
      var url = '/graph/1d'
    } else if(obj.attr("id") == "twodee") {
      var data = {eq: obj.find('input[name="equation"]').val(),
              xmin: obj.find('input[name="xmin"]').val(),
              xmax: obj.find('input[name="xmax"]').val(),
              ymin: obj.find('input[name="ymin"]').val(),
              ymax: obj.find('input[name="ymax"]').val(),
              dim: 2};
      var elem = $('#load2');
      var url = '/graph/2d'
    }

    // Make the ajax call using the right elements/data
    $.ajax({
      dataType: "json",
      url: $SCRIPT_ROOT + url,
      data: data,
      success: function (data) {callback(data,obj.attr("id"));},
      beforeSend: function() { elem.addClass("loadingon") },
      complete: function() { elem.removeClass("loadingon") }
    });
  };

  /*
   * Bind clicking and keydown to submit the data to the server.
   */
  $('a#submit').click(function() { submit($(this).parent()); });

  $('input.onedee').keydown(
    function (e) {
      if (e.keyCode === 13) {
        submit(this.parent());
      }
    });

  $('input.twodee').keydown(
    function (e) {
      if (e.keyCode === 13) {
        submit(this.parent());
      }
    });

  /*
   * Bind hiding and showing the loading spinner to AJAX event handlers
   */
});
