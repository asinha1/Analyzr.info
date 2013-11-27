

function linkRequest(){


	// Assign handlers immediately after making the request,
	// and remember the jqxhr object for this request
	var URL = document.getElementById("urlIn").value;

	alert("Sending ajax req for: "+URL);

	var jqxhr = $.post( "/", {data:URL},function() {
	})
	.done(function(data) {
	alert( "server returned:" +data);
	})
	.fail(function() {
	alert( "error" );
	});


	return false;



}
