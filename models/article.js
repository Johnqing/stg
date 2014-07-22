var mongoose = require('./db')
var Schema = mongoose.Schema;
var EventProxy = require('eventproxy');


var Util = require('../lib/util');

var User = require('./user');
/**
 * article字段定义
 * @type {Schema}
 */
var ObjectId = Schema.ObjectId;
var articleSchema = new Schema({
	author_id : {type : ObjectId},
	title : {type : String},
	content : {type : String},
	view_count : {type : Number, default : 0},
	create_time: {type : Date, default : Date.now},
	update_at: {type : Date, default : Date.now},
	last_reply_at: {type : Date},
	reply_count: {type : Number, default : 0},
	edit_id: {type : ObjectId}
});
/**
 * 生成article表
 * @type {[type]}
 */
var articleModel = mongoose.model('Article', articleSchema);
/**
 * post类
 * @param {[type]} post
 */
function Article(options) {
	this.content = options.content;
	this.title = options.title;
	this.author_id = options.author_id;
}

module.exports = Article;

//存储一篇文章及其相关信息
Article.prototype.save = function(callback) {
	//要存入数据库的文档
	var article = {
		content: this.content,
		title: this.title,
		create_time: Date.now(),
		author_id: this.author_id
	};

	var newArticle = new articleModel(article);
	newArticle.save(function (err, article) {
		if (err)
			return callback(err);
		callback(null, article);
	});
};

/**
 * 组合查询
 * @param query
 * @param callback
 */
Article.getUnion = function(query, callback) {
	var proxy = new EventProxy();

	var done = function(article, author){
		return callback(null, article, author);
	};

	proxy.all('article', 'author', done);

	articleModel.findOne(query, function(err, art){
		if(err)
			return callback(err);

		if(!art){
			proxy.emit('article', null);
			proxy.emit('author', null);
			return
		}
		proxy.emit('article', art);
		// 作者查询
		User.get({
			_id: art.author_id
		}, function(err, user){
			if(err)
				return callback(err);
			proxy.emit('author', user);
		})

	})
};
/**
 * 获取部分文章
 * @param opts
 * @param callback
 */
Article.get = function(where, opts, callback){
	// fixed
	if(typeof opts == 'function'){
		callback = opts;
		opts = where;
		where = {}
	}
	// check
	articleModel.find(where, null, opts, function(err, docs){
		if(err)
			return callback(err);

		if(docs.length == 0) return callback(err, []);

		var articles_id = [];
		var articlesArr = [];

		for(var i = 0; i<docs.length; i++){
			articles_id.push(docs[i]._id);
		}

		var proxy = new EventProxy();

		var done = function(){
			return callback(null, articlesArr);
		}

		proxy.after('articles.ready', articles_id.length, done);

		for(i = 0; i<articles_id.length; i++){
			(function(i){
				Article.getUnion({
					_id: articles_id[i]
				}, function(err, article, author){
					if(err) return callback(err);
					article.author = author;
					article.create_at = Util.format_date(article.create_time);
					article.update_time = Util.format_date(article.update_at);
					articlesArr[i] = article;
					proxy.emit('articles.ready');
				});
			})(i);
		}

	});
}

/**
 * 获取文章数
 * @param where
 * @param callback
 */
Article.getCounts = function(where, callback){
	articleModel.count(where, function(err, count){
		if(err)
			return callback(err);
		callback(null, count);
	});
}

/**
 * 获取单篇文章
 * @param query
 * @param callback
 */
Article.getOne = function(query, callback) {
	articleModel.findOne(query, function (err, article) {
		if (err)
			return callback(err);
		callback(null, article);
	});
};