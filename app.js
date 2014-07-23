var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , config = require('./setting').config
  , flash = require('connect-flash')
  , multer  = require('multer')

var app = express();

//所有环境下
//设置端口
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);

var partials = require('express-partials');
app.use(partials());

app.use(flash());

var favicon = require('serve-favicon');
app.use(favicon(__dirname+'/favicon.ico'));

var morgan  = require('morgan');
app.use(morgan());

// gzip/deflate outgoing responses
var compression = require('compression')
app.use(compression());

var cookieParser = require('cookie-parser');
app.use(cookieParser());
// session
var session = require('express-session')({
	secret: config.session_secret,
	maxAge: 1000 * 60 * 60 * 24 * 30
})
app.use(session);
// 中间件
app.use(require('./controllers/user').authUser);

// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded());

//
app.use(multer({ dest: './assets/upload'}))

var methodOverride = require('method-override')
app.use(methodOverride());

var serveStatic = require('serve-static')
app.use(serveStatic(path.join(__dirname, 'assets')));
// 4.0 del
// app.use(app.router);
//开发环境
var env = process.env.NODE_ENV || 'development';

var errorhandler = require('errorhandler');
if(env == 'development'){
	app.use(errorhandler());
}
//路由
routes(app);

// helper
app.locals.config = config;

// 页面日志处理
app.use(function(req, res, next){
	var err = req.flash('error')
	, success = req.flash('success');

	res.locals.user = req.session.user;
	res.locals.error = err.length ? err : null;
	res.locals.success = success.length ? success : null;
	next();
});


http.createServer(app).listen(app.get('port'), function(){
	console.log("success!port " + app.get('port'));
});