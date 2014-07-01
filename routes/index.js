var util = require('../lib/util');

/**
 * 检测登录状态
 * @type {{notLogin: Function, login: Function}}
 */
var loginChect = {
    notLogin: function(req, res, next){
        if(req.session.user){
            req.flash('error', '已经登录!');
            return res.redirect('/admin');
        }
        next();
    },
    login: function(req, res, next){
        if(!req.session.user){
            req.flash('error', '未登录!');
            return res.redirect('/admin/login');
        }
        next();
    }
};
/**
 * admin
 * @param  {[type]} req  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function adminRender(req, res, data){
	data = util.extend({
		title:'主页',
		layout: 'admin/base',
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	}, data);

	res.render('admin/'+data.template, data);
}


module.exports = function(app){
	app.get('/admin', loginChect.notLogin);
	app.get('/admin', function(req, res){
		adminRender(req, res, {
			template: 'index'
		});
	});
}