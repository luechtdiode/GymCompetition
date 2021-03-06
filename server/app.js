var express = require('express');
var session = require("express-session");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var authlocal = require('./auth/auth-local');
var authfacebook = require('./auth/auth-facebook');
var authtwitter = require('./auth/auth-twitter');
var authtgoogle = require('./auth/auth-google');
var authtlinkedin = require('./auth/auth-linkedin');
var authtinstagram = require('./auth/auth-instagram');
var config = require('./config');
var bluebird = require('bluebird');
var cors = require('cors');

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

var sess = {
  name: 'gymapp.sid',
  secret: config.secretKey,
  resave: true,
  saveUninitialized: true,
  proxy: true
};
if (app.get('env') === 'production') {
  sess.cookie = { secure: true }  ;
}
// passport config
var User = require('./models/user');
app.use(session(sess)); // express-session
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({  
  origin: '*',
  withCredentials: false,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin' ]
}));
// app.use((_req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   next();
// });

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/', express.static(path.join(__dirname, '../public')));

const routes = require('./routes/index').init(app);
app.use('/', routes);
// app.use('/api/', routes);

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
