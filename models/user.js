var Util = require('../lib/util');

var mongoose = require('./db')
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
/**
 * user字段定义
 * @type {Schema}
 */
var userSchema = new Schema({
	user_name : {type : String},
	password : {type : String},
	create_time : {type : Date, default : Date.now},
	update_at : {type: Date, default : Date.now},
	email : {type : String},
	edit_id: {type : ObjectId},
	reply_count: {type : Number, default : 0},
	article_count: {type : Number, default : 0}
}, {
  collection: 'users' 
});
/**
 * 生成user表
 * @type {[type]}
 */
var userModel = mongoose.model('User', userSchema);
/**
 * User类
 * @param {[type]} user
 */
function User(user) {
	this.user_name = user.user_name;
	this.password = user.password;
	this.email = user.email;
};
/**
 * 保存用户名密码
 * @param  {Function} callback
 * @return {[type]}
 */
User.prototype.save = function(callback) {
	var user = {
		user_name: this.user_name,
		password: this.password,
		email: this.email,
		create_time: Date.now()
	};

	var newUser = new userModel(user);

	newUser.save(function (err, user) {
		if (err) {
			return callback(err);
		}
		callback(null, user);
	});
};
/**
 * 获取单个用户
 * @param  {[type]}   query
 * @param  {Function} callback
 * @return {[type]}
 */
User.get = function(query, callback) {
	userModel.findOne(query, function (err, user) {
		if (err) {
			return callback(err);
		}
		callback(null, user);
	});
};

/**
 * 通过query查询符合条件的user
 * @param where
 * @param query
 * @param callback
 */
User.getAll = function(where, query, callback){
	userModel.find(where, null, query, function(err, users){
		if(err)
			return callback(err);

		if(!users.length)
			return callback('Not have users!');

		var userArr = [];

		for(var i= 0, len=users.length; i<len; i++){
			userArr.push(users[i]._doc);
		}

		callback(null, userArr);
	});
}
/**
 * 用户数量
 * @param where
 * @param callback
 */
User.getCounts = function(where, callback){
	userModel.count(where, function(err, count){
		if(err)
			return callback(err);
		callback(null, count);
	});
}


module.exports = User;