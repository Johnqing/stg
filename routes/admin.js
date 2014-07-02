var util = require('../lib/util');
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post')
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

	app.post('/admin', function(req, res){
		var userName = req.body['username']
		var userPwd = req.body['password']
		var md5 = crypto.createHash('md5');

		//生成密码的 md5 值
		var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');

		User.get(req.body.name, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在!'); 
				return res.redirect('/admin');
			}
			//检查密码是否一致
			if (user.password != password) {
				req.flash('error', '密码错误!'); 
				return res.redirect('/admin');
			}
			//用户名密码都匹配后，将用户信息存入 session
			req.session.user = user;
			req.flash('success', '登陆成功!');
			res.redirect('/admin/list');
		});
	});

	// 文章列表
	app.get('/admin/list', function(req, res) {

		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;

		//查询并返回第 page 页的 10 篇文章
		Post.get(null, page, function (err, posts, total) {
			if (err) {
				posts = [];
			}
			adminRender(req, res, {
				template: 'list',
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user
			});

		});

		
	})


}