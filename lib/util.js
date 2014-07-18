var crypto = require('crypto');

var util = {
	/**
	 * extend
	 * @param  {[type]} old [description]
	 * @param  {[type]} n   [description]
	 * @return {[type]}     [description]
	 */
	extend: function(old, n){
		if(!n) return old;

		for(var key in n){
			old[key] = n[key];
		};

		return old;
	},
	md5: function(str){
		//生成密码的 md5 值
		var md5 = crypto.createHash('md5');
		return md5.update(str).digest('hex');
	},
	format_date: function(date){
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();

		hour = ((hour < 10) ? '0' : '') + hour;
		minute = ((minute < 10) ? '0' : '') + minute;

		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
	}
}

module.exports = util;