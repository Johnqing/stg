/**
 * Created by liuqing on 14-7-18.
 */
var url = require('url');

var Util = require('../lib/util');

var config = require('../setting').config;
var User = require('../models/user');
var Article = require('../models/article');

var check = require('validator').check,
	sanitize = require('validator').sanitize;

var EventProxy = require('eventproxy');
/**
 * 设置缓存
 * @param user
 * @param req
 * @param res
 */
function setCache(user, req, res){
	var auth_token = Util.encrypt(user._id + '\t' + user.user_name + '\t' + user.password + '\t' + user.email, config.session_secret);
	res.cookie(config.auth_cookie_name, auth_token, {
		path: '/',
		maxAge: 1000 * 60 * 60
	});
	req.session.user = Util.extend(req.session.user, user);
	req.session.cookie.maxAge = 1000 * 60 * 60;
}

/**
 * 注册
 * @param req
 * @param res
 * @param next
 */
exports.add = function(req, res, next){
	var method = req.method.toLowerCase();
	if(method === 'get'){
		res.render('user_add');
		return
	}
	// post
	var user_name = sanitize(req.body.user_name).trim();
	var password = sanitize(req.body.password).trim();
	var email = sanitize(req.body.email).trim();
	// 验证为空
	if(!user_name || !password || !email){
		res.render('user_add', {
			error: '信息不能为空',
			user_name: user_name,
			email: email
		});
		return
	}
	// 验证用户名
	try{
		check(user_name, '用户名只能使用字母和数字').isAlphanumeric();
	} catch (e){
		res.render('user_add', {
			error: e.message,
			user_name: user_name,
			email: email
		});
		return;
	}
	// 验证email
	try{
		check(email, '邮箱不正确').isAlphanumeric();
	} catch (e){
		res.render('user_add', {
			error: e.message,
			user_name: user_name,
			email: email
		});
		return;
	}
	User.get({
		user_name: user_name,
		email: email
	}, function(err, user){
		if(err)
			return next(err);

		if(user && user.length>0){
			res.render('user_add', {error: '用户名或邮箱已被使用,请重新输入',user_name: user_name,email: email});
			return;
		}

		password = Util.md5(password);
		var user = new User({
			user_name: user_name,
			password: password,
			email: email
		});
		user.save(function(err, userRow){
			if(err) return next(err);

			if(userRow){
				setCache(userRow, req, res);
				res.redirect('/');
			}else{
				res.render('login',{error: '没有此用户，或已被删除'});
				return;
			}
		});

	});

}
/**
 * 登录
 * @param req
 * @param res
 * @param next
 */
exports.login = function(req, res, next){
	var method = req.method.toLowerCase();
	if(method === 'get'){
		res.render('login');
		return
	}

	var user_name = sanitize(req.body.user_name).trim();
	var password = sanitize(req.body.password).trim();

	if(!user_name || !password){
		res.render('login',{error: '用户名/密码错误！'});
		return;
	}

	User.get({
		user_name: user_name
	}, function(err, user){
		if(err)
			return next(err);

		if(!user){
			res.render('login', {
				error: '此用户不存在'
			});
			return;
		}

		password = Util.md5(password);
		if(password != user.password){
			res.render('login', {
				error: '用户名/密码错误！'
			});
			return
		}
		setCache(user, req, res);
		res.redirect('/');
	});

}
/**
 * 退出
 * @param req
 * @param res
 * @param next
 */
exports.loginOut = function(req, res, next){
	req.session.destroy();
	res.clearCookie(config.auth_cookie_name, {path: '/'});
	console.log(req.session, res.cookies);
	res.redirect('/');
}
/**
 * 中间件
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.authUser = function(req, res, next){
	if(req.session.user){
		// 判断配置中标识的用户存在
		if(config.admins[req.session.user.user_name]){
			req.session.user.isAdmin = true;
		} else {
			req.session.user.isAdmin = false;
		}
		res.locals.user = req.session.user;
		return next();
	}
	// session未设置，采用cookie的方式
	var cookie = req.cookies[config.auth_cookie_name];
	if(!cookie)
		return next();

	var auth_token = Util.decrypt(cookie, config.session_secret);
	var auth = auth_token.split('\t');
	var user_id = auth[0];

	User.get({
		_id: user_id
	}, function(err, user){
		if(err)
			return next(err);

		if(!user)
			return next();

		user.isAdmin = config.admins[user.user_name] ? true : false;
		req.session.user = user;
		req.session.cookie.maxAge = 1000 * 60 * 60;
		res.locals.user = user;
		return next();

	})

}

/**
 * 修改密码
 * @param req
 * @param res
 * @param next
 */
exports.changePwd = function(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
		return
	}

	var method = req.method.toLowerCase();
	var id = req.params.id;

	if(id.length != 24){
		res.render('error', {
			error: '没有此用户，或已被删除'
		});
		return
	}
	// 根据id获取用户
	function getUserForId(cb){
		User.get({
			_id: id
		}, function(err, user){
			if(err)
				return next(err);

			if(!user){
				res.render('error', {
					error: '没有此用户，或已被删除'
				});
				return;
			}
			// 只有自己/超级管理员可以修改密码
			if(user._id.toString() == req.session.user._id.toString() || req.session.user.isAdmin){
				cb(user);
				return;
			}

			res.render('change_password', {
				error: '对不起，你没有权限修改此用户！'
			});


		});
	}

	if(method === 'get'){
		getUserForId(function(user){
			res.render('change_password', {
				action: 'change_password',
				user: user
			});
		});
		return
	}

	getUserForId(function(user){
		var oldPwd = sanitize(req.body.old_password).trim();
		oldPwd = Util.md5(oldPwd);

		if(oldPwd != user.password){
			res.render('change_password', {
				error: '旧密码输入错误！',
				action: 'change_password',
				user: user
			});
			return
		}

		var pwd = sanitize(req.body.new_password).trim();
		var repwd = sanitize(req.body.re_password).trim();

		if(!pwd || !repwd){
			res.render('change_password', {
				error: '新密码不能为空',
				action: 'change_password',
				user: user
			});
			return;
		}

		if(pwd != repwd){
			res.render('change_password', {
				error: '两次密码输入不同',
				action: 'change_password',
				user: user
			});
			return;
		}

		user.password = Util.md5(pwd);
		user.update_at = Date.now();
		user.edit_id = req.session.user._id;
		user.save(function(err){
			if(err)
				return next(err);

			if(req.session.user._id != user._id && req.session.user.isAdmin){
				res.redirect('/user_views');
				return;
			}

			res.redirect('/login_out');

		});

	});

}

/**
 * 显示用户列表(管理员权限)
 * @param req
 * @param res
 * @param next
 */
exports.userViews = function(req, res, next){
	if(!req.session.user || !req.session.user.isAdmin){
		res.render('error', {
			error: '对不起,你没有权限这么做！'
		});
		return;
	}

	var limit = 10;
	var currentPage = parseInt(req.query.page, 10) || 1;
	var pathname = url.parse(req.url).pathname;

	var render = function(users, pages){
		res.render('user_views',{
			users: users,
			current_page: currentPage,
			pages: pages,
			base_url: pathname
		});
	}

	var proxy = new EventProxy();
	proxy.all('users', 'pages', render);
	User.getAll({}, {
		skip: (currentPage - 1) * limit,
		limit: limit
	}, function(err, users){
		if(err)
			return next(err);

		var done = function(userRow){
			proxy.emit('users', userRow);
		}
		proxy.after('usersRow', users.length, done);
		// 提取编辑人用户名/格式化时间
		for(var i= 0, len=users.length; i<len; i++){
			(function(i){
				User.get({
					_id: users[i].edit_id
				}, function(err, editer){
					if(err)
						return next(err);
					users[i].edit = editer;
					users[i].createTime = Util.format_date(users[i].create_time);
					users[i].updateTime = Util.format_date(users[i].update_at);
					proxy.emit('usersRow', users[i]);
				})
			})(i);
		}

	});

	User.getCounts({}, function(err, cont){
		if(err)
			return next(err);

		proxy.emit('pages', cont);
	});

}

exports.singleUserView = function(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
		return
	}

	var userName = req.params.id;
	if(userName != req.session.user.user_name){
		res.render('error', {
			error: '对不起,你没有权限这么做！'
		});
	}

	var render = function(user, articles){
		res.render('user_view',{
			user: user,
			new_articles: articles
		});
	}

	var proxy = new EventProxy();
	proxy.all('user', 'new_articles', render);

	User.get({
		user_name: userName
	}, function(err, user){
		if(err)
			return next(err);

		user.create_at = Util.format_date(user.create_time);
		proxy.emit('user', user);

		Article.get({
			author_id: user._id
		}, {
			limit: 5,
			sort: {
				'create_time': 'desc'
			}
		}, function(err, arts){
			if(err)
				return next(err);

			Util.articlesTran(arts);

			proxy.emit('new_articles', arts);

		})

	})


}

/**
 * 账户删除
 * @param req
 * @param res
 * @param next
 */
exports.del = function(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
		return;
	}

	if(!req.session.user.isAdmin){
		res.render('error', {
			error: '对不起,你没有权限这么做！'
		});
		return;
	}

	var id = req.params.id;

	if(id.length != 24){
		res.render('error', {
			error: '没有此用户，或已被删除！'
		});
		return;
	}

	if(id == req.session.user._id){
		res.render('error', {
			error: '对不起,您不能删除自己的账户！'
		});
		return;
	}

	User.get({
		_id: id
	}, function(err, user){
		if(err)
			return next(err);

		if(!user){
			res.render('error', {
				error: '没有此用户，或已被删除！'
			});
			return;
		}

		var proxy = new EventProxy();
		var render = function(){
			res.redirect('/user_views');
			return;
		}

		proxy.all('user_remove', render);

		Article.get({
			author_id: id
		}, {}, function(err, arts){
			if(err)
				return next(err);

			for(var i=0; i<arts.length; i++){
				arts[i].remove(function(err){
					if(err)
						return next(err);
				});
			}

			user.remove(function(err){
				if(err)
					return next(err);
				proxy.emit('user_remove');
			});

		})


	})

}

