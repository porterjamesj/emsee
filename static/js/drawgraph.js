$(function() {
  /*
   * Utility function to flash an error div on a given selection.
   */
  var errorctrl = function(sel,msg) {
    // can you just record last call time, then check now against that?
    if(!this.blocked) {
      this.blocked = true;
      sel.children("#error")
        .text(msg)
        .fadeIn(500)
        .delay(1500)
        .fadeOut(500);
      setTimeout(function () { this.blocked = false; },2500);
    }
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

    // can the swidth,sheight,margin, be set on Plot, since they are always the same?
    // This would reduce repetition

    // check dims and construct the appropriate type of plot
    if (typeof data.points !== 'undefined') { // can just do data.points !== undefined
      // is plot supposed to be a global?
      plot = new OneDeePlot(600,500,
                            {top: 80, right: 80, bottom: 80, left: 80},
                            data);
    } else if(typeof data.points === 'undefined') {
      plot = new TwoDeePlot(600,500,
                            {top: 80, right: 80, bottom: 80, left: 80},
                            data);
    }
    console.log(plot);

    /* Now append an svg to the correct div for whichever tab we're in
     * Its a bit messy, but the jQuery selection is being converted to
     * a d3 selection.
     */
    plot.makeSvg(d3.select(obj.get(0)));
    plot.makeScales(); // can this be called fram draw()?
    plot.draw();

    // animate the sampler
    plot.animateChain() // can this be called fram draw()?
  }

  /*
   * Function called when the user submits form data.
   * Takes as input the jQuery selection
   * to which the resulting plot should be appended, as well as the
   * variable to which the jqxhr object should be bound.
   */
  var submit = function(obj) {
    // try to kill the outstanding request
    try {
      this.jqxhr.abort();
    } catch(e) {

      // what exception can get thrown here? Should you handle it, somehow?
      // Or only abort after checking not in state that will throw exception
      console.log(e);
    }

    // do this in the callback that handles updating the DOM
    // clear previous svg
    obj.children("svg").remove();

    // can you change this so the data and url are passed to the fn?
    // at the moment, this fn mixes business logic (formulating params of plot)
    // with the mechanics of doing the ajax call.  Better to make this focus on
    // the ajax part

    if(obj.attr("id") == "onedee") {
      var data = {eq: obj.find('input[name="equation"]').val(),
              xmin: obj.find('input[name="xmin"]').val(),
              xmax: obj.find('input[name="xmax"]').val(),
              dim: 1};
      var elem = $('#load1');
      var url = '/graph/1d' // best to be consistent about putting in semicolons
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

    /* Make the ajax call using the right elements/data
     * while binding the request to the jqxhr object
     */
    this.jqxhr = $.ajax({
      dataType: "json",
      url: $SCRIPT_ROOT + url,
      data: data,
      success: function (data) {
        // could the creation of the plot be separated from the drawing?
        // eg: var plot = createPlot(data)
        //     draw(plot, d3.select(obj.get(0)))
        // then, the Plot obj could internally separate calculation of the
        // plot points from drawing

        callback(data,obj);
      },
      beforeSend: function() { elem.addClass("loadingon") },
      complete: function() { elem.removeClass("loadingon") }
    });
  };

  // move these into new addEventListeners() fn that is called

  /*
   * Bind clicking and keydown to submit the data to the server.
   */
  $('a#submit').click(function() {
    // extract and package data and and url and pass into submit
    // avoid passing in obj - remove view code from submit
    submit($(this).parents(".tab"));
  });

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
