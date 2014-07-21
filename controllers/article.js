/**
 * Created by liuqing on 14-7-18.
 */

var url = require('url');
var EventProxy = require('eventproxy');

var Util = require('../lib/util');

var check = require('validator').check,
	sanitize = require('validator').sanitize;

var Article = require('../models/article');

/**
 * 添加文章
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.add = function(req, res, next){
	// 未登录，重定向到登陆页
	if(!req.session.user)
		return res.redirect('/login');

	res.locals.user = req.session.user;
	var method = req.method.toLowerCase();
	if(method == 'get'){
		res.render('article_edit');
		return
	}

	var title = sanitize(req.body.title).trim();
	var content = req.body.content;

	if(!title){
		res.render('article_edit', {
			error: '标题不能为空',
			content: content
		});
		return
	}

	if(!content){
		res.render('article_edit', {
			error: '内容不能为空',
			title: title
		});
		return
	}

	var article = new Article({
		title: title,
		content: content,
		author_id: req.session.user._id
	});

	article.save(function(err, at){
		if(err)
			return next(err);

		res.redirect('/article_view/'+at._id);
	});

}
/**
 * 显示文章
 * @param req
 * @param res
 * @param next
 */
exports.article_view = function(req, res, next){
	// 未登录，重定向到登陆页
	if(!req.session.user)
		return res.redirect('/login');


	var id = req.params.id;

	res.locals.user = req.session.user;
	var render = function(art){
		res.render('article_view', {
			article: art
		});
	}

	Article.getUnion({
		_id: id
	}, function(err, art, author){
		if(err)
			return next(err);

		if(!art){
			res.render('error', {
				error: '无此信息或已被删除'
			});
			return;
		}

		art.create_at = Util.format_date(art.create_time);
		art.update_time = Util.format_date(art.update_at);
		art.view_count += 1;
		art.save(function(err){
			if(err) return next(err);
		});

		art.author = author;
		render(art);
	})

}
