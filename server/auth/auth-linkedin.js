var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var User = require('../models/user');
var config = require('../config');
var init = require('./auth-base');
var Verify = require('../routes/verify');

const strategyFunction = function(req, accessToken, refreshToken, profile, done) {

    var searchQuery = {
      'linkedin.id': profile.id
    };
    var username = profile.displayName;
    var email =  profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
    if (req.decoded && req.decoded.id) {
      username = req.decoded.username || username;
      email = req.decoded.email || email;
      searchQuery = {
        '_id': req.decoded.id
      };
    }

    var updates = {
      username: username,
      email: email,
      linkedin: {
        id: profile.id,
        token: accessToken, // we will save the token that facebook provides to the user                    
        displayName: profile.displayName, //profile.name.givenName + ' ' + profile.name.familyName, // look at the passport user profile to see how names are returned
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '', // facebook can return multiple emails so we'll take the first
        photourls: profile.photos.map(url => url.value)
      }
    };

    var options = {
      upsert: true
    };

    // update the user if s/he exists or add a new user
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
      if(err) {
        return done(err);
      } else {
        var token = Verify.getToken(user);
        req.session.jwtToken = token;
        req.decoded = user.getAuthAttributes();
        user.token = token;
        return done(null, user);
      }
    });
  };

// https://github.com/mjhea0/passport-local-express4/blob/master/app.js
// https://scotch.io/tutorials/easy-node-authentication-linking-all-accounts-together
// http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.WYCENojyhlo
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
