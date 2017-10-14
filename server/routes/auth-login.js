var Verify = require('./verify');

const doLogin = (user, info, req, res, next) => {
  if (!user) {
    return res.status(401).json({
      err: info
    });
  }
  req.logIn(user, (err) => {
    if (err) {
      return res.status(500).json({
        err: 'Could not log in user'
      });
    }
    var token = Verify.getToken(user);
    req.decoded = user.getAuthAttributes();
    req.user = user;
    req.session.jwtToken = token;

    next();
  });
};

exports.login = (req, res, next) => {
  return (err, user, info) => {
    if (err) {
      return next(err);
    }
    return doLogin(user, info, req, res, next);
  };
};

exports.loginResponse = (req, res, next) => {
  if (!req.user || !req.session.jwtToken) {
    res.status(401).json({err: 'unknown user'});
  } else {
    res.status(200).json(
      Object.assign({
        status: 'Login successful!',
        success: true,
        token: req.session.jwtToken
      }, 
      req.user.getVisibleAuthAttributes()
    ));
  }
};