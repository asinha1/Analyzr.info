
/*
 * GET home page.
 */

exports.text = function(req, res){
  res.render('contact', { title: 'UnBias.Me', checkPage: 'contact'});
};
