var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('../config');
var init = require('./auth-base').init;
var findOneAndUpdate = require('./auth-base').findOneAndUpdate;

const strategyFunction = function(req, accessToken, refreshToken, profile, done) {

    var searchQuery = {
      'twitter.id': profile.id
    };
    var email =  profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
    var username = profile.displayName;
    var updates = {
      twitter: {
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

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.clientID,
  consumerSecret: config.twitter.clientSecret,
  callbackURL: config.twitter.callbackURL,
  enableProof: true,
  profileFields: ['id', 'displayName', 'photos', 'email'],
  passReqToCallback: true
  }, strategyFunction 
));

passport.use('twitter-connect', new TwitterStrategy({
  consumerKey: config.twitter.clientID,
  consumerSecret: config.twitter.clientSecret,
  callbackURL: config.twitter.callbackConnectURL,
  enableProof: true,
  profileFields: ['id', 'displayName', 'photos', 'email'],
  passReqToCallback: true
  }, strategyFunction
));

init();

module.exports = passport;
