var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var config = require('./etc/config.json');
//var Loader = require('loader');
var _ = require('lodash');

// global variables
global.rootDir = __dirname;

//require('./models/errors');
//global.BizError = Error.extend();

var app = express();
app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

// set static, dynamic helpers
_.extend(app.locals, {
  config: config
});


// load and use log4js
var log4js = require('log4js');
var log = log4js.getLogger("http");
app.use(log4js.connectLogger(log, { level: 'auto' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.session_secret));
app.use(session(config.session_cfg));

// gzip
var compression = require("compression");
app.use(compression());

// headers for no-cache
//app.use(require('./middlewares/nocache'));

// init common
//app.use(common.initCommon);

// get login validate for each request.
//app.use(login.authorize);

// init routes
app.use(require('./routes/startup'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  var isdev = req.app.get('env') === 'development';
  res.locals.message = err.message;
  res.locals.error = isdev ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ code: -1, message: err.message, stack: err.stack })
  //res.json(normalization.error(err, isdev));
});

module.exports = app;
