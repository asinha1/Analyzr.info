

function linkRequest(){


	// Assign handlers immediately after making the request,
	// and remember the jqxhr object for this request
	var URL = document.getElementById("666").value;

	alert(URL);

	var jqxhr = $.post( "/", {data:URL},function() {
	})
	.done(function(data) {
	alert( "second success" +data);
	return false;
	})
	.fail(function() {
	alert( "error" );
	return false;
	});

	return false;



}
