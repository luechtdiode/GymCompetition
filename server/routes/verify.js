var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var Config = require('../config.js');

exports.getToken = function (user) {
    return jwt.sign(user.getAuthAttributes(), Config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.session.jwtToken;

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, Config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                req.session.jwtToken = token;
                return next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = (req, res, next) => {
    if (req.decoded.admin) {
      return next();
    }
    else {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      return next(err);
    }
};

exports.materializeUser = (callback) => (req, res, next) => {
    if (req.decoded && req.decoded.id) {
        User.findById(req.decoded.id,callback);
    }
    else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};
