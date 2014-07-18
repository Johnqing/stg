var mongoose = require('./db')
var Schema = mongoose.Schema;
var EventProxy = require('eventproxy');
var Util = require('../lib/util');
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
	this.author_id = options.authorId;
}

module.exports = Article;

//存储一篇文章及其相关信息
Article.prototype.save = function(callback) {
	var date = new Date();
	//要存入数据库的文档
	var article = {
		content: this.content,
		title: this.title,
		create_time: date.now(),
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
 * 获取所有文章
 * @param query
 * @param callback
 */
Article.getAll = function(query, callback) {
	//根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
	articleModel.find(query, function(err, article){
		if(err)
			return callback(err);
		callback(null, article);
	})
};
/**
 * 获取部分文章
 * @param query
 * @param opts
 * @param callback
 */
Article.get = function(query, opts, callback){
	articleModel.find(opts, function(err, docs){
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

		var where = {};
		for(i = 0; i<articles_id.length; i++){
			(function(i){
				where = {_id: articles_id[i]}
				articleModel.getOne(where, function(err, article){
					if(err) return callback(err);
					article.create_at = Util.format_date(article.create_time);
					article.update_time = Util.format_date(article.update_at);
					articlesArr[i] = article;
					proxy.trigger('articles.ready');
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