var util = require('../lib/util');
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
			return res.redirect('/admin/list');
		}
		next();
	},
	login: function(req, res, next){
		if(!req.session.user){
			req.flash('error', '未登录!');
			return res.redirect('/');
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

		var password = util.md5(req.body.password);
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
	app.get('/admin/adduser', function(req, res){
		adminRender(req, res, {
			template: 'reg'
		});
	});
	app.post('/admin/adduser', function(req, res){
		var password = util.md5(req.body.password);
		var newUser = {
			name: req.body.username,
			password: password
		};

		var userModel = new User(newUser);

		//查询数据库存在此用户名
		User.get(newUser.name, function(err, user){
			if(user){
				err = '用户已存在';
			}
			if(err){
				req.flash('error', err);
				return res.redirect('/admin');
			}

			userModel.save(function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('/admin');
				}
				//session里储存用户名
				req.session.user = newUser;
				req.flash('success','注册成功');
				res.redirect('/admin');
			});
		});


	});

	app.get('/admin/list', loginChect.login);
	// 文章列表
	app.get('/admin/list', function(req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;

		//查询并返回第 page 页的 10 篇文章
		Post.get(10, page, function (err, posts, total) {
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
	});
	// 创建文章
	app.get('/admin/addpost', function(req, res){
		adminRender(req, res, {
			template: 'add_post'
		});
	});

	app.post('/admin/addpost', function(req, res){
		//要存入数据库的文档
		var post = {
			name: req.session.user,
			head: 'wx',
			title: req.body.title,
			post: req.body.post
		};

		var post = new Post(post);
		post.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/admin/addpost');
			}

			req.flash('success','添加文章成功！');
			res.redirect('/admin/addpost');
		});


	});



}