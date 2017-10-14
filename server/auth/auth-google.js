var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var config = require('../config');
var init = require('./auth-base').init;
var findOneAndUpdate = require('./auth-base').findOneAndUpdate;

const strategyFunction = function(req, accessToken, refreshToken, profile, done) {

    var searchQuery = {
      'google.id': profile.id
    };
    var email =  profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
    var username = profile.displayName;
    var updates = {
      google: {
        id: profile.id,
        token: accessToken,
        displayName: username,
        email: email,
        photourls: profile.photos.map(url => url.value)
      }
    };

    if (req.decoded && req.decoded.id) {
      updates.username = req.decoded.username || username;
      updates.email = req.decoded.email || email;
      searchQuery = {
        '_id': req.decoded.id
      };
    }

    findOneAndUpdate(searchQuery, updates, done);
  };

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL,
  enableProof: true,
  scope: ['profile', 'email'],
  passReqToCallback: true
  }, strategyFunction 
));

passport.use('google-connect', new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackConnectURL,
  enableProof: true,
  scope: ['profile', 'email'],
  passReqToCallback: true
  }, strategyFunction
));

init();

module.exports = passport;
