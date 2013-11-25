function validateForm()
{
  var x = document.forms["getUrl"]["urlin"].value;
  if (x == null || x == "")
   {
     alert("Must have some form of input here!");
     return false;
  }
  else {
  //alert("starting extractions " + x); 
  //alert("bout to start");
  try {
    extract_feels(x);
  }
  catch(err) {
    alert(err.message)
  }
  alert("finished with extract_feels");
  return true;
  }
}
