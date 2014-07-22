/**
 * Created by liuqing on 14-7-18.
 */

var url = require('url');
var EventProxy = require('eventproxy');

var Article = require('../models/article');

var Util = require('../lib/util');

exports.index = function(req, res, next){
	var currentPage = parseInt(req.query.page, 10) || 1;
	var pathname = url.parse(req.url).pathname;
	var limit = 15;

	var render = function (articles, pages){
		res.render('index', {
			articles: articles,
			current_page: currentPage,
			pages: pages,
			base_url: pathname
		});
	}

	var proxy = new EventProxy();
	proxy.all('articles', 'pages', render);

	var where = {};
	var options = {
		skip: (currentPage - 1) * limit,
		limit: limit
	}

	Article.get(options, function(err, articles){
		if(err)
			return next(err);
		Util.articlesTran(articles);
		proxy.emit('articles', articles);
	})

	Article.getCounts(where, function(err, cont){
		if(err) return next(err);
		var pages = Math.ceil(cont / limit);
		proxy.emit('pages', pages);
	})

}
