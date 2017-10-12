var express = require('express');
var router = express.Router();
var auth = require('./auth');
var users = require('./users');
var clubRouter = require('./clubRouter');
var sponsorRouter = require('./sponsorRouter');
var competitionRouter = require('./competitionRouter');
var actionRouter = require('./actionRouter');

exports.init = function (app) {
  app.use('/api/users', users);
  app.use('/api', auth);
  app.use('/api/clubs', clubRouter);
  app.use('/api/sponsors', sponsorRouter);
  app.use('/api/competitions', competitionRouter);
  app.use('/api/actions', actionRouter);

  /* GET home page. */
  router.get('/', (req, res, next) => {
    res.render('index', { title: 'Gym Competition' });
  });
  return router;
};
