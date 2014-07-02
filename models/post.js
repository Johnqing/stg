var crypto = require('crypto');
var mongoose = require('./db')
var Schema = mongoose.Schema;
/**
 * post字段定义
 * @type {Schema}
 */
var postSchema = new Schema({
	name: String,
	head: String,
	time: Date,
	title: String,
	tags: String,
	post: String,
	pv: 0
}, {
  collection: 'posts' 
});
/**
 * 生成post表
 * @type {[type]}
 */
var postModel = mongoose.model('Post', postSchema);
/**
 * post类
 * @param {[type]} post
 */
function Post(name, head, title, tags, post) {
	this.name = name;
	this.head = head;
	this.title = title;
	this.tags = tags || 'default';
	this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year : date.getFullYear(),
		month : date.getFullYear() + "-" + (date.getMonth() + 1),
		day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
		date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	//要存入数据库的文档
	var post = {
		name: this.name,
		head: this.head,
		time: time,
		title:this.title,
		tags: this.tags,
		post: this.post,
		pv: 0
	};

	var newPost = new postModel(post);

	newPost.save(function (err, user) {
		if (err) {
			return callback(err);
		}
		callback(null, user);
	});
};

/**
 * 获取部分文章
 * @param  {[type]}   num
 * @param  {[type]}   page
 * @param  {Function} callback
 * @return {[type]}
 */
Post.get = function(num, page, callback) {
	//根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
	var query = postModel.find()
		.skip((page - 1)*num)
		.limit(num)
		.sort({time: -1})
		.exec(function(err, posts){
			if(err){
				return callback(err);
			}

			callback(null, posts);
		});
};

//获取一篇文章
Post.getOne = function(name, day, title, callback) {
	postModel.findOne({
		"name": name,
		"time.day": day,
		"title": title
	}, function (err, user) {
		if (err) {
			return callback(err);
		}
		callback(null, user);
	});
};