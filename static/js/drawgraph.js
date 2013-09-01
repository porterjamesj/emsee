;(function (exports) {

  /* http://stackoverflow.com/questions/1714786/ */
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  };

  /* Utility function to flash an error div on a given selection. */
  var errorctrl = function(element,msg) {
    element.select(".error")
      .style("display","block")
      .text(msg)
      .classed("animated fadeIn",true);
  };

  var getInputOneDee = function() {
    var tab = d3.select("#d1");
    var data = {eq: tab.select('input[name="equation"]').node().value,
                xmin: tab.select('input[name="xmin"]').node().value,
                xmax: tab.select('input[name="xmax"]').node().value,
                dim: 1};
    return data;
  };

  var getInputTwoDee = function() {
    var tab = d3.select("#d2");
    var data = {eq: tab.select('input[name="equation"]').node().value,
                xmin: tab.select('input[name="xmin"]').node().value,
                xmax: tab.select('input[name="xmax"]').node().value,
                ymin: tab.select('input[name="ymin"]').node().value,
                ymax: tab.select('input[name="ymax"]').node().value,
                dim: 2};
    return data;
  };

  var sendAjax = function(element,url,data,loader) {
    loader.classed("loadingon",true);
    d3.json($SCRIPT_ROOT + url + "?" + serialize(data), function(err,data) {
      callback(element, data, err);
    });
  };

  var callback = function(element,data,err) {
    /* Handles DOM updates. */
    element.select("svg").remove(); /* Get rid of the old plot. */
    element.select(".error").style("display","none"); /* Hide error message. */

    /* Handle errrors. */
    if (err && err.status === 400) { //This was a parse error
      errorctrl(element,"Errr, sorry, I couldn't parse that.");
      return;
    } else if (err && err.status === 406) { //This was an evaluation error
      errorctrl(
        element,
        "There was an error evaluating your function, possibly a complex number"
      );
      return;
    }

    /* Draw plot. */
    data.swidth = 600;
    data.sheight = 500;
    data.margin = {top: 80, right: 80, bottom: 80, left: 80};
    if(data.points === undefined) { /* two dimensions */
      data.dims = 2;
      drawTwoDee(element,data);
    } else { /* one dimension */
      data.dims = 1;
      drawOneDee(element,data);
    }
  };

  /* Functions for installing clickhandlers, etc. */
  var animator = function(onname,offname,dir) {
    var opp = dir === "Left" ? "Right" : "Left";
    d3.select("." + onname + "tab").on("click", function() {
      var on = d3.select("#" + onname);
      var off = d3.select("#" + offname);
      on.classed("animated fadeIn" + dir + "Big",true);
      on.classed("fadeOut" + dir + "Big",false);
      off.classed("animated fadeOut" + opp + "Big",true);
      off.classed("fadeIn" + opp + "Big",false);
    });
  };

  exports.addEventListeners = function() {

    var sendOneDeeAjax = function() {
      /* Get the data from the DOM. */
      var data = getInputOneDee();
      var loader = d3.select('#d1 .loading');
      var url = '/graph/1d';
      var element = d3.select('#d1');
      /* Make an ajax call. */
      sendAjax(element,url,data,loader);
    };

    var sendTwoDeeAjax = function() {
      /* Get the data from the DOM. */
      var data = getInputTwoDee();
      var loader = d3.select('#d2 .loading');
      var url = '/graph/2d';
      var element = d3.select('#d2');
      /* Make an ajax call. */
      sendAjax(element,url,data,loader);
    };

    d3.select('button#submit.d1').on("click",sendOneDeeAjax);
    d3.select('button#submit.d2').on("click",sendTwoDeeAjax);
    d3.selectAll('input.d1')
      .on("keydown", function () {
        if (d3.event.keyCode === 13) {sendOneDeeAjax();}
      });
    d3.selectAll('input.d2')
      .on("keydown", function (e) {
        if (d3.event.keyCode === 13) {sendTwoDeeAjax();}
      });

    /*
     * Bind key events in the equation input fields to changing the appropriate
     * math rendering <p>
     */
    d3.selectAll('input[name=equation]')
      .on("keyup", function() {
        var rend = d3.select(this.parentNode.parentNode).select(".render");
        rend.text("`" + this.value + "`");
        console.log(rend.node());
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,rend.node()]);
      });

    /* Bind animation to tabs */
    animator("d1","d2","Left");
    animator("d2","d1","Right");
    /* Make 2d tab hidden initially*/

  };

})(this);

window.addEventListener('load', function () {
  addEventListeners();
});
