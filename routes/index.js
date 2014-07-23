var site = require('../controllers/site');
var article = require('../controllers/article');
var user = require('../controllers/user');
var upload = require('../controllers/upload');
module.exports = function(app){
	// index
	app.get('/', site.index);

	// add user
	app.get('/user_add', user.add);
	app.post('/user_add', user.add);

	// change password
	app.get('/change_password/:id', user.changePwd);
	app.post('/change_password/:id', user.changePwd);

	// user views
	app.get('/user_views', user.userViews);

	app.get('/user_view/:id', user.singleUserView);

	app.get('/del_user/:id', user.del);

	// login
	app.get('/login', user.login);
	app.post('/login', user.login);
	app.get('/login_out', user.loginOut);

	// article
	app.get('/article_add', article.add);
	app.post('/article_add', article.add);

	app.get('/article_view/:id', article.view);

	app.get('/article_del/:id', article.del);

	//edit
	app.get('/article_edit/:id', article.edit);
	app.post('/article_edit/:id', article.edit);


	// uploadImg
	app.get('/uploadImg', upload.html);
	app.post('/uploadImg', upload.img);




}