var passport = require('passport');
var User = require('../models/user');

// https://github.com/mjhea0/passport-local-express4/blob/master/app.js
// https://scotch.io/tutorials/easy-node-authentication-linking-all-accounts-together
// http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.WYCENojyhlo

const checkuserAndReturn = (done) => (err, user) => {
  if(err) {
    done(err);
  } else if (!user || user.isNew) {
    err = new Error('unknown user');
    err.status = 401;
    done(err);
  } else {
    done(null, user);
  }
};

const findOneAndUpdate = function(searchQuery, updates, done) {
  const options = {
    upsert: false
  };

  User.findOneAndUpdate(searchQuery, updates, options, checkuserAndReturn(done));
};

const init = function() {
  /*
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  */
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, checkuserAndReturn(done));
  });
};


module.exports = { init, findOneAndUpdate };
