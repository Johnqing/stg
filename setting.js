var path = require('path');

exports.config = {
	webname: 'STG',
	port: 3000,

	session_secret: 'stg',
	auth_cookie_name: 'stg',
	upload_dir : path.join(__dirname, 'assets', 'upload'),
	// 管理员聚合
	admins: {
		admin: true
	},
	db: 'mongodb://127.0.0.1:27017/stg'
}