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
 * 通过name获取密码
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

module.exports = User;