$(function() {
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

  var submit = function() {
    var self = $(this); //enable jQuery methods

    // clear previous svg from the correct tab
    d3.select("#" + self.attr("class")).select("svg").remove();

    if(self.attr("class") == "onedee") {
      $.getJSON($SCRIPT_ROOT + '/drawgraph',
                {eq: $('input.onedee[name="equation"]').val(),
                 minx: $('input.onedee[name="minx"]').val(),
                 maxx: $('input.onedee[name="maxx"]').val()},
                function (data) {callback(data,self.attr("class"));});
    } else if(self.attr("class") == "twodee") {
      $.getJSON($SCRIPT_ROOT + '/drawgraph2d',
                {eq: $('input.twodee[name="equation"]').val(),
                 minx: $('input.twodee[name="minx"]').val(),
                 maxx: $('input.twodee[name="maxx"]').val(),
                 miny: $('input.twodee[name="miny"]').val(),
                 maxy: $('input.twodee[name="maxy"]').val()},
                function (data) {callback(data,self.attr("class"));});
    }
  }

  //Bind clicking and keydown to submit the data to the server
  $('a#submit').click(submit);

  $('input.onedee').keydown(
    function (e) {
      if (e.keyCode === 13) {
        submit();
      }
    });

  $('input.twodee').keydown(
    function (e) {
      if (e.keyCode === 13) {
        submit();
      }
    });
});
