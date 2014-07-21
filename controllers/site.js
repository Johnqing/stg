/**
 * Created by liuqing on 14-7-18.
 */

var url = require('url');
var EventProxy = require('eventproxy');

var Article = require('../models/article');


function articlesTran(articles){
	for(var i = 0; i < articles.length; i++){
		articles[i].content = articles[i].content.replace(/<img[^>]*>/ig, "<p>[图片]</p>");
		articles[i].content = articles[i].content.replace(/<pre\s[^>]*>[\s\S]*?<\/pre>/ig, "<p>[代码]</p>");
		articles[i].content = articles[i].content.replace(/(<([^>]+)>)/gi, "");
		articles[i].content = articles[i].content.replace(/\s*/ig, "");
		articles[i].content = articles[i].content.substr(0, 55);
		articles[i].content = articles[i].content.concat("......");
	}
}

exports.index = function(req, res, next){
	var currentPage = parseInt(req.query.page, 10) || 1;
	var pathname = url.parse(req.url).pathname;
	var limit = 15;

	var render = function (articles, pages){
		res.locals.user = req.session.user
		res.render('index', {
			articles: articles,
			current_page: currentPage,
			pages: pages,
			base_url: pathname
		});
	}

	var proxy = new EventProxy();
	proxy.assign('articles', 'pages', render);

	var where = {};
	var options = {
		skip: (currentPage - 1) * limit,
		limit: limit
	}

	Article.get(where, options, function(err, articles){
		if(err)
			return next(err);
		articlesTran(articles);
		proxy.trigger('articles', articles);
	})

	Article.getCounts(where, function(err, cont){
		if(err) return next(err);
		var pages = Math.ceil(cont / limit);
		proxy.trigger('pages', pages);
	})

}
