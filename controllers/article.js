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
exports.view = function(req, res, next){
	// 未登录，重定向到登陆页
	if(!req.session.user)
		return res.redirect('/login');


	var id = req.params.id;

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
/**
 * 编辑
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.edit = function(req, res, next){
	if(!req.session.user)
		return res.redirect('/login');

	var id = req.params.id;

	if(id.length != 24){
		res.render('error', {
			error: '无此信息或已被删除！'
		});
	}

	var method = req.method.toLowerCase();
	if(method == 'get'){

		Article.getUnion({
			_id: id
		}, function(err, art, user){
			if(err)
				return next(err);

			if(!art)
				return res.render('error', {error: '无此信息或已被删除！'});

			if(art.author_id != req.session.user._id || !req.session.user.isAdmin){
				res.render('error', {
					error: '对不起，你不能编辑此文章！'
				});
				return
			}

			res.render('article_edit', {
				action: 'article_edit',
				article_id: art._id,
				title: art.title,
				content: art.content
			});

		})
		return
	}
	// post
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


	Article.getUnion({
		_id: id
	}, function(err, art){
		if(err)
			return next(err);

		if(!art)
			return res.render('error', {error: '无此信息或已被删除！'});

		if(art.author_id != req.session.user._id || !req.session.user.isAdmin){
			res.render('error', {
				error: '对不起，你不能编辑此文章！'
			});
			return
		}

		art.title = title;
		art.content = content;
		art.update_at = Date.now();
		art.edit_id = req.session.user._id;

		art.save(function(err){
			if(err)
				return next(err);

			res.redirect('/');
		});

	})


}
/**
 * 删除文章
 * @param req
 * @param res
 * @param next
 */
exports.del = function(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
		return;
	}

	var id = req.params.id;

	if(id.length != 24){
		res.render('error', {
			error: '没有此用户，或已被删除！'
		});
		return;
	}

	Article.getUnion({
		_id: id
	}, function(err, art){
		if(err)
			return next(err);

		if(!art)
			return res.render('error', {error: '无此信息或已被删除！'});

		if(art.author_id != req.session.user._id || !req.session.user.isAdmin){
			res.render('error', {
				error: '对不起，你不能删除此文章！'
			});
			return
		}

		art.remove(function(err){
			if(err)
				return next(err);
			res.redirect('/');
		});

	})

}