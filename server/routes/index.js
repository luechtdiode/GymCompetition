var express = require('express');
var router = express.Router();
var auth = require('./auth');
var users = require('./users');
var clubRouter = require('./clubRouter');
var sponsorRouter = require('./sponsorRouter');
var competitionRouter = require('./competitionRouter');
var actionRouter = require('./actionRouter');
var http = require('http');
var request = require('request');
const { URL } = require('url');
var config = require('../config');

exports.init = function (app) {
  app.use('/api/users', users);
  app.use('/api', auth);
  app.use('/api/clubs', clubRouter);
  app.use('/api/sponsors', sponsorRouter);
  app.use('/api/competitions', competitionRouter);
  app.use('/api/actions', actionRouter);
  app.use('/operating', function(req, res) {
    // https://stackoverflow.com/questions/7559862/no-response-using-express-proxy-route/20539239#20539239
    var url = new URL(config.operatingUrl + req.url);
    var port = url.port; //config.operatingUrl.split(':')[2];
    var host = url.hostname;  //config.operatingUrl.split(':')[1].split('//')[1];
    req.pipe(request({ qs:req.query, host: host, port:port, uri:url })).pipe(res);
  });

  /* GET home page. */
  router.get('/', (req, res, next) => {
    res.render('index', { title: 'Gym Competition' });
  });
  return router;
};
