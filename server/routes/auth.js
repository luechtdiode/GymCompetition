var express = require('express');
var authRouter = express.Router();
var passport = require('passport');
var passportLocal = require('../auth/auth-local');
var passportFacebook = require('../auth/auth-facebook');
var User = require('../models/user');
var doLogin = require('./login');
var registerClub = require('./register').registerClub;
var registerCompany = require('./register').registerCompany;
var Club = require('../models/clubs');
var Sponsor = require('../models/sponsors');
var competitiones = require('../models/competitions');
var Verify = require('./verify');
var config = require('../config');

authRouter.post('/auth/register', (req, res, next) => {
  console.log("register: " + req.body.username);
  User.register(new User({ username : req.body.username }),
      req.body.password, (err, user) => {
      if (err) {
        return res.status(500).json({err: err});
      }
      if(req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      if(req.body.email) {
        user.email = req.body.email;
      }
      
      if(req.body.company) {
        return registerCompany(user, req, res, next);
      }
      else {
        return registerClub(user, req, res, next);
      }
    });
  });

authRouter.post('/auth/login', (req, res, next) => {
  passportLocal.authenticate('local', doLogin(req,res,next))(req,res,next);
});

authRouter.route('/auth/login/callback').post(Verify.verifyOrdinaryUser, (req, res, next) => {
  passportLocal.authenticate('local', doLogin(req,res,next))(req,res,next);
});

authRouter.get('/auth/logout', (req, res) => {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

// Facebook authentication
authRouter.get('/auth/facebook/', passportFacebook.authenticate('facebook', { scope : 'email' }));
authRouter.get('/auth/facebook/callback', (req,res,next) => {
  // passportFacebook.authenticate('facebook', doLogin(req,res,next))(req,res,next);
  passportFacebook.authenticate('facebook', function(err, user, info) {
    // successful auth, user is set at req.user.  redirect as necessary.
    return res.redirect(config.frontEndUrl + '/#/auth/profile/' + req.session.jwtToken);
  }) (req,res,next);
});

// Facebook connect
authRouter.route('/connect/facebook').get(Verify.verifyOrdinaryUser, passportFacebook.authorize('facebook-connect', { scope : 'email' }));
authRouter.route('/connect/facebook/callback').get(Verify.verifyOrdinaryUser, (req,res,next) => {
  passportFacebook.authorize('facebook-connect', function(err, user, info) {
    // successful auth, user is set at req.user.  redirect as necessary.
    
    return res.redirect(config.frontEndUrl + '/#/auth/profile');
  }) (req,res,next);
});

// Facebook disconnect
authRouter.route('/disconnect/facebook').put(Verify.verifyOrdinaryUser, function(req, res, next) {
  User.findById(req.body.id, (err, user) => {
    if(err) next(err);
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.json(user);
      });
  });
});

module.exports = authRouter;
