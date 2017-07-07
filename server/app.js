var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');
var bluebird = require('bluebird');

var mongo = process.env.VCAP_SERVICES;
var port = process.env.PORT || 3030;
var conn_str = "";
if (mongo) {
  console.log("mongo found");
  var env = JSON.parse(mongo);
  if (env['mongodb']) {
    mongo = env['mongodb'][0]['credentials'];
    if (mongo.url) {
      conn_str = mongo.url;
    } else {
      console.log("No mongo found");
    }
  } else {
    conn_str = config.mongoUrl;
  }
} else {
  conn_str = config.mongoUrl;
}
var mongooseConfig = {
    server:{
      auto_reconnect:true,
      socketOptions: {
        keepAlive: 1,
        connectTimeoutMS: 30000 
      }
    },
    replset: {
      socketOptions: {
        keepAlive: 1,
        connectTimeoutMS : 30000
      }
    },
    promiseLibrary: bluebird
  };
mongoose.Promise = bluebird;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});
db.on('disconnected', function() {
  console.log('disconnected');
  console.log('dbURI is: '+conn_str);
  // mongoose.connect(conn_str, mongooseConfig);
});
mongoose.connect(conn_str, mongooseConfig);

var routes = require('./routes/index');
var users = require('./routes/users');
var clubRouter = require('./routes/clubRouter');
var sponsorRouter = require('./routes/sponsorRouter');
var competitionRouter = require('./routes/competitionRouter');
var actionRouter = require('./routes/actionRouter');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, '../public/images', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Secure traffic only
//app.use(middleware.transportSecurity());
// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.
app.all('*', function(req, res, next){
  console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'), app.get('secPort'));
  if (req.secure || config.devmode) {
    return next();
  };
  if(app.get('secPort')) {
    res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
  }
  else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});

// passport config
var User = require('./models/user');
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/', express.static(path.join(__dirname, '../public')));

app.use('/', routes);
app.use('/api/', routes);
app.use('/api/users', users);
app.use('/api/clubs', clubRouter);
app.use('/api/sponsors', sponsorRouter);
app.use('/api/competitions', competitionRouter);
app.use('/api/actions', actionRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
/*  res.json({
    message: err.message,
    error: {}
  });*/
});

module.exports = app;
