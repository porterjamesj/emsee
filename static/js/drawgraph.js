$(function() {

    var callback = function(data) {
	console.log(data.datastring);
	console.log(data.svgsize);
	$("#word").text(data.word);

	var svg = $('#plot');

	// Set width and size of the plot
	svg.attr('width',data.svgsize[0]);
	svg.attr('height',data.svgsize[1]);
	svg.attr('xmlns','http://www.w3.org/2000/svg');
	svg.attr('version','1.1');

	//Set up transformations
	svg.append('<g id="trans"></g>');
	$('#trans').attr('transform','translate(0,' + data.svgsize[1] + ')');
	$('#trans').append('<g id="scale"></g>');
	$('#scale').attr('transform','scale(1,-1)');
	
	// Add the line itself
	$('#scale').append('<polyline id="line"/>');


	//Set its attrs
	var attrs = [["fill","none"],
		     ["stroke","red"],
		     ["stroke-width","3"],
		     ["points",data.datastring]]
	attrs.map(function(x) {$('#line').attr(x[0],x[1]);});
    };

    var submit_func = function() {
	$.getJSON($SCRIPT_ROOT + '/drawgraph',
		  /* The address to which we will send the request. */
		  {eq: $('input[name="equation"]').val()}, 
		  /* The JS object that flask will build the request out of. */ 
		  callback /* Callback function. */);
	return false;
    };

    $('a#submit').click(submit_func);
});
