/**
 * Created by liuqing on 14-7-22.
 */
var fs = require('fs');
var path = require('path');
var Util = require('../lib/util');
var config = require('../setting').config;

exports.html = function(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
		return;
	}

	res.render('upload');
}
/**
 * 图片上传
 * @param req
 * @param res
 * @param next
 */
exports.img = function(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
		return;
	}
	//
	var file = req.files && req.files.imgFile;
	if(!file){
		res.render('error', {error: '上传失败，没有文件或文件错误'});
		return;
	}
	// 按照用户来切分文件夹
	var userName = req.session.user.user_name.toString();
	var filename = Date.now() + '_' + file.name;
	var userDir = path.join(config.upload_dir, userName);
	// 生成文件夹
	Util.mkdirSync(userDir);
	// 文件写入路径
	var savePath = path.join(userDir, filename);
	// 文件改名
	fs.rename(file.path, savePath, function (err) {
		if (err) {
			return next(err);
		}
		var url = '/upload/' + userName + '/' + encodeURIComponent(filename);
		res.send({error: '0', url: url});
	});
}