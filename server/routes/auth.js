var express = require('express');
var authRouter = express.Router();
var passport = require('passport');
var login = require('./auth-login').login;
var loginResponse = require('./auth-login').loginResponse;
var registerClub = require('./register').registerClub;
var registerCompany = require('./register').registerCompany;
var User = require('../models/user');
var Club = require('../models/clubs');
var Sponsor = require('../models/sponsors');
var Competitions = require('../models/competitions');
var Verify = require('./verify');
var Config = require('../config');

const authenticate = (strategy) => (req, res, next) => passport.authenticate(strategy, login(req,res,next))(req, res, next);
const authorize = (strategy) => (req, res, next) => passport.authorize(strategy, login(req,res,next))(req, res, next);
const materializeAndAuthenticate = (req, res, next) => Verify.materializeUser(login(req,res,next))(req, res, next);

authRouter.post('/auth/register', (req, res, next) => {
  console.log("register: " + req.body.username);
  var user = {
    username : req.body.username,
  };
  if(req.body.firstname) {
    user.firstname = req.body.firstname;
  }
  if(req.body.lastname) {
    user.lastname = req.body.lastname;
  }
  if(req.body.email) {
    user.email = req.body.email;
  }
  User.register(new User(user),
      req.body.password, (err, user) => {
      if (err) {
        return res.status(500).json({err: err});
      }
      
      if(req.body.company) {
        return registerCompany(user, req, res, next);
      }
      else if(req.body.name) {
        return registerClub(user, req, res, next);
      } else {
        user.save((err,user) => {
          if(err) {
            console.log(err);
            User.findByIdAndRemove(user.id, (err, user) => {
              return res.status(500).json({err: err});
            });
          }
          console.log("User without Club or Sponsor created");
          passportLocal.authenticate('local', doLogin(req,res,next))(req,res,next);
        });
      }
    });
  },
  loginResponse
);

authRouter.post('/auth/login', 
  authenticate('local'),
  loginResponse
);

authRouter.route('/auth/renew').post(
  Verify.verifyOrdinaryUser, 
  materializeAndAuthenticate,
  loginResponse
);

// todo password reset like http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/

authRouter.get('/auth/logout', (req, res) => {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

// Social-Providers authentication
authRouter.route('/auth/:strategy')
  .get((req, res, next) => passport.authenticate(req.params.strategy)(req, res, next));
authRouter.route('/auth/:strategy/callback')
  .get((req, res, next) => authenticate(req.params.strategy)(req, res, next),
      (req, res, next) => {
        // successful auth, user is set at req.user.  redirect as necessary.
        return res.redirect(Config.frontEndUrl + '/#/auth/profile/' + req.session.jwtToken);
      });

// Social-Providers connect (link)
authRouter.route('/connect/:strategy')
  .get(Verify.verifyOrdinaryUser,
      (req, res, next) => passport.authorize(req.params.strategy + '-connect')(req, res, next));
authRouter.route('/connect/:strategy/callback')      
  .get(Verify.verifyOrdinaryUser, 
      (req, res, next) => authorize(req.params.strategy + '-connect')(req, res, next),
      (req, res, next) => {
        // successful auth, user is set at req.user.  redirect as necessary.
        return res.redirect(Config.frontEndUrl + '/#/auth/profile/' + req.session.jwtToken);
      });

// Social-Providers disconnect (unlink)
authRouter.route('/disconnect/:id').put(
  Verify.verifyOrdinaryUser, 
  (req, res, next) => {
    User.findById(req.decoded.id, (err, user) => {
      if(err) next(err);
      user[req.params.id].id = undefined;
      user[req.params.id].token = undefined;
      user.save(function(err, user) {
        if(err) next(err);
        req.user = user;
        return next();
      });
    });
  },
  loginResponse
);

module.exports = authRouter;
