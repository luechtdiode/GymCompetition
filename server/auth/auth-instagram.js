var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;
var config = require('../config');
var init = require('./auth-base').init;
var findOneAndUpdate = require('./auth-base').findOneAndUpdate;

const strategyFunction = function(req, accessToken, refreshToken, profile, done) {

    var searchQuery = {
      'instagram.id': profile.id
    };
    var photourls =  profile.photos && profile.photos ? profile.photos : [{value: profile._json.data.profile_picture}];
    var email =  profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
    var username = profile.displayName;
    var updates = {
      instagram: {
        id: profile.id,
        token: accessToken,
        displayName: username,
        email: email,
        photourls: photourls.map(url => url.value)
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

passport.use(new InstagramStrategy({
  clientID: config.instagram.clientID,
  clientSecret: config.instagram.clientSecret,
  callbackURL: config.instagram.callbackURL,
  enableProof: true,
  profileFields: ['id', 'displayName', 'photos', 'email'],
  passReqToCallback: true
  }, strategyFunction 
));

passport.use('instagram-connect', new InstagramStrategy({
  clientID: config.instagram.clientID,
  clientSecret: config.instagram.clientSecret,
  callbackURL: config.instagram.callbackConnectURL,
  enableProof: true,
  profileFields: ['id', 'displayName', 'photos', 'email'],
  passReqToCallback: true
  }, strategyFunction
));

init();

module.exports = passport;
