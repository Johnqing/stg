var site = require('../controllers/site');
var article = require('../controllers/article');
var user = require('../controllers/user');
module.exports = function(app){
	// index
	app.get('/', site.index);

	//user
	app.get('/user_add', user.add);
	app.post('/user_add', user.add);
	app.get('/login', user.login);
	app.post('/login', user.login);
	app.get('/login_out', user.login_out);

	// article
	app.get('/article_add', article.add);
	app.post('/article_add', article.add);

	app.get('/article_view/:id', article.article_view);





}