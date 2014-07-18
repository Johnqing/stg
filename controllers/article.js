/**
 * Created by liuqing on 14-7-18.
 */

var url = require('url');
var EventProxy = require('eventproxy');

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
		var render = function (articles, pages){
			res.render('article_edit');
		}
		return
	}




}
