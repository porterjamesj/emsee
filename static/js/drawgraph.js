$(function() {
  /*
   * Utility function to flash an error div on a given selection.
   */
  var errorctrl = function(sel,msg) {
    sel.children("#error")
      .text(msg)
      .fadeIn(500)
      .delay(3000)
      .fadeOut(500);
  }

  /*
   * Callback function that runs after the server returns
   * from the AJAX call. This is where the plot object is actually
   * constructed and the svg drawn/animated. Data parameter is what
   * comes back from the server via ajax, obj is the object to which
   * the draw svg is to be appended.
   */
  var callback = function(data,obj) {
    //First check for errors
    if (data.errcode == 0) { //This was a parse error
      errorctrl(obj,"Errr, sorry, I couldn't parse that.");
      return;
    } else if (data.errcode == 1) { //This was an evaluation error
      errorctrl(
        obj,
        "There was an error evaluating your function, possibly a complex number"
      );
      return;
    }

    // check dims and construct the appropriate type of plot
    if (obj.attr("id") === "onedee") {
      plot = new OneDeePlot(600,500,
                            {top: 80, right: 80, bottom: 80, left: 80},
                            data);
    } else if(obj.attr("id") === "twodee") {
      plot = new TwoDeePlot(600,500,
                            {top: 80, right: 80, bottom: 80, left: 80},
                            data);
    }
    console.log(plot);

    /* Now append an svg to the correct div for whichever tab we're in
     * Its a bit messy, but the jQuery selection is being converted to
     * a d3 selection
     */
    plot.makeSvg(d3.select(obj.get(0)));
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

    // Give the ajax call the right data
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
      success: function (data) {callback(data,obj);},
      beforeSend: function() { elem.addClass("loadingon") },
      complete: function() { elem.removeClass("loadingon") }
    });
  };

  /*
   * Bind clicking and keydown to submit the data to the server.
   */
  $('a#submit').click(function() { submit($(this).parents(".tab")); });

  $('input').keydown(
    function (e) {
      console.log(e);
      if (e.keyCode === 13) {
        submit($(this).parents(".tab"));
      }
    });

  /*
   * Bind key events in the equation input fields to changing the appropriate
   * math rendering <p>
   */
  $('input[name=equation]').keyup(
    function() {
      var self = $(this);
      var rend = self.parent().siblings('.render');
      rend.text("`" + self.val() + "`");
      MathJax.Hub.Queue(["Typeset",MathJax.Hub,rend.get(0)]);
    });
});
