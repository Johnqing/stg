var crypto = require('crypto');
var fs = require('fs')
var path = require('path')

var util = {
	/**
	 * 日期格式化
	 * @param date
	 * @returns {string}
	 */
	format_date: function(date){
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();

		hour = ((hour < 10) ? '0' : '') + hour;
		minute = ((minute < 10) ? '0' : '') + minute;

		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
	},
	articlesTran: function(articles){
		for(var i = 0; i < articles.length; i++){
			articles[i].content = articles[i].content.replace(/<img[^>]*>/ig, "<p>[图片]</p>");
			articles[i].content = articles[i].content.replace(/<pre\s[^>]*>[\s\S]*?<\/pre>/ig, "<p>[代码]</p>");
			articles[i].content = articles[i].content.replace(/(<([^>]+)>)/gi, "");
			articles[i].content = articles[i].content.replace(/\s*/ig, "");
			articles[i].content = articles[i].content.substr(0, 55);
			articles[i].content = articles[i].content.concat("......");
		}
	},
	/**
	 * extend
	 * @param  {[type]} old [description]
	 * @param  {[type]} n   [description]
	 * @return {[type]}     [description]
	 */
	extend: function(old, n){
		if(!n) return old;
		if(!old)
			old = {};
		for(var key in n){
			old[key] = n[key];
		};

		return old;
	},
	/**
	 * md5
	 * @param str
	 * @returns {*}
	 */
	md5: function(str){
		//生成密码的 md5 值
		var md5 = crypto.createHash('md5');
		return md5.update(str).digest('hex');
	},
	/**
	 * 对称加密
	 * @param str
	 * @param secret
	 * @returns {*|Query|OrderedBulkOperation|UnorderedBulkOperation}
	 */
	encrypt: function(str, secret){
		var cipher = crypto.createCipher('aes192', secret);
		var enc = cipher.update(str, 'utf8', 'hex');
		enc += cipher.final('hex');
		return enc;
	},
	decrypt: function(str, secret){
		var decipher = crypto.createDecipher('aes192', secret);
		var dec = decipher.update(str, 'hex', 'utf8');
		dec += decipher.final('utf8');
		return dec;
	},
	mkdirSync: function(p) {
		p = path.normalize(p);
		var array = p.split(path.sep); //创建目录,没有则补上
		for (var i = 0, cur; i < array.length; i++) {
			if (i === 0) {
				cur = array[i];
			} else {
				cur += (path.sep + array[i]);
			}
			try {
				fs.mkdirSync(cur, "0755");
			} catch(e) {}
		}
	}
}

module.exports = util;