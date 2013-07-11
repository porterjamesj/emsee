;(function (exports) {
  /*
   * Utility function to flash an error div on a given selection.
   */
  var errorctrl = function(element,msg) {
    if(errorctrl.lastrun + 2500 < new Date().getTime()) {
      errorctrl.lastrun = new Date().getTime();
      var $element =$(element.node());
      $element.children("#error")
        .text(msg)
        .fadeIn(500)
        .delay(1500)
        .fadeOut(500);
    }
  };
  errorctrl.lastrun = 0;

  var getInputOneDee = function() {
    var tab = $("#onedee");
    var data = {eq: tab.find('input[name="equation"]').val(),
                xmin: tab.find('input[name="xmin"]').val(),
                xmax: tab.find('input[name="xmax"]').val(),
                dim: 1};
    return data;
  };

  var getInputTwoDee = function() {
    var tab = $("#twodee");
    var data = {eq: tab.find('input[name="equation"]').val(),
                xmin: tab.find('input[name="xmin"]').val(),
                xmax: tab.find('input[name="xmax"]').val(),
                ymin: tab.find('input[name="ymin"]').val(),
                ymax: tab.find('input[name="ymax"]').val(),
                dim: 2};
    return data;
  };

  var sendAjax = function(element,url,data,loader) {
    this.jqxhr = $.ajax({
      dataType: "json",
      url: $SCRIPT_ROOT + url,
      data: data,
      success: function(data) {
        callback(element,data); /* element, so we know where to put the plot. */
      },
      beforeSend: function() { loader.addClass("loadingon"); },
      complete: function() { loader.removeClass("loadingon"); }
    });

  };

  var callback = function(element,data) {
    /* Handles DOM updates. */
    $(element.node()).children("svg").remove(); /* Get rid of the old plot. */

    /* Handle errrors. */
    if (data.errcode === 0) { //This was a parse error
      errorctrl(element,"Errr, sorry, I couldn't parse that.");
      return;
    } else if (data.errcode === 1) { //This was an evaluation error
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

  /* Install clickhandlers, etc. */
  exports.addEventListeners = function() {

    var sendOneDeeAjax = function() {
      /* Get the data from the DOM. */
      var data = getInputOneDee();
      var loader = $('#load1');
      var url = '/graph/1d';
      var element = d3.select('#onedee');
      /* Make an ajax call. */
      sendAjax(element,url,data,loader);
    };

    var sendTwoDeeAjax = function() {
      /* Get the data from the DOM. */
      var data = getInputTwoDee();
      var loader = $('#load2');
      var url = '/graph/2d';
      var element = d3.select('#twodee');
      /* Make an ajax call. */
      sendAjax(element,url,data,loader);
    };

    $('button#submit.onedee').click(sendOneDeeAjax);
    $('button#submit.twodee').click(sendTwoDeeAjax);
    $('input.onedee').keydown(
      function (e) {if (e.keyCode === 13) {sendOneDeeAjax();}});
    $('input.twodee').keydown(
      function (e) {if (e.keyCode === 13) {sendTwoDeeAjax();}});

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

  };

})(this);

$(function () {
  addEventListeners();
});
