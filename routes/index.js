module.exports = function(app){

	app.get('/', function(req, res){
		res.render('index', {
			title:'主页'
		});
	});



	app.get('/admin', function(req, res){
		res.render('admin/index', {
			title:'主页',
			layout: 'admin/base',
            // user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
		});
	});
}