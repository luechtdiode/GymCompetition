var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var init = require('./auth-base');

passport.use(new LocalStrategy(User.authenticate()));

init();

module.exports = passport;
