var mongoose = require('./db')
var Schema = mongoose.Schema;
/**
 * user字段定义
 * @type {Schema}
 */
var userSchema = new Schema({
	name: String,
	password: String
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
	this.name = user.name;
	this.password = user.password;
};
/**
 * 保存用户名密码
 * @param  {Function} callback
 * @return {[type]}
 */
User.prototype.save = function(callback) {
	var user = {
		name: this.name,
		password: this.password
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
 * @param  {[type]}   name
 * @param  {Function} callback
 * @return {[type]}
 */
User.get = function(name, callback) {
	userModel.findOne({name: name}, function (err, user) {
		if (err) {
			return callback(err);
		}
		callback(null, user);
	});
};

module.exports = User;