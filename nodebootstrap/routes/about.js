/*
* GET home page.
*/

exports.text = function(req, res){
  res.render('about', { title: 'UnBias.Me', checkPage: 'about' });
};

exports.postUrl = function(req, res) {
  //var x = req.body.urlin;
  /*if (x == null || x == "") {
//alert("Must have some form of input here!");
}
else
{
extract_feels(x);
}*/
  
  //validateForm(x);
  res.render('about', {title: 'UnBias.Me', checkPage: 'about' });
};