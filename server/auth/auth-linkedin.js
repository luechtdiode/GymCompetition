var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var config = require('../config');
var init = require('./auth-base').init;
var findOneAndUpdate = require('./auth-base').findOneAndUpdate;

const strategyFunction = function(req, accessToken, refreshToken, profile, done) {

    var searchQuery = {
      'linkedin.id': profile.id
    };
    var email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
    var username = profile.displayName;
    var updates = {
      linkedin: {
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

passport.use(new LinkedInStrategy({
  clientID: config.linkedin.clientID,
  clientSecret: config.linkedin.clientSecret,
  callbackURL: config.linkedin.callbackURL,
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true,
  passReqToCallback: true
  }, strategyFunction 
));

passport.use('linkedin-connect', new LinkedInStrategy({
  clientID: config.linkedin.clientID,
  clientSecret: config.linkedin.clientSecret,
  callbackURL: config.linkedin.callbackConnectURL,
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true,
  passReqToCallback: true
  }, strategyFunction
));

init();

module.exports = passport;
