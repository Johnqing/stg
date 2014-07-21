/**
 * Created by liuqing on 14-7-18.
 */
var url = require('url');

var Util = require('../lib/util');

var config = require('../setting').config;
var User = require('../models/user');

var check = require('validator').check,
	sanitize = require('validator').sanitize;

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
	req.session.user = user;
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
exports.login_out = function(req, res, next){
	req.session = null;
	res.clearCookie(config.auth_cookie_name, {path: '/'});
	res.redirect('/');
}

