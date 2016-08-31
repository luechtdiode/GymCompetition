var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    sponsores = require('../models/sponsors'),
    cleanup = require('./users').cleanup,
    Verify = require('./verify');

var sponsorRouter = express.Router();
sponsorRouter.use(bodyParser.json());

sponsorRouter.route('/')
.get(function (req, res, next) {
    sponsores.find(req.query)
        .populate('action')
        .exec(function (err, sponsor) {
          if (err) {
            next(err);
          }
          else {
            res.json(sponsor);
          }
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    sponsores.create(req.body, function (err, sponsor) {
        if (err) throw err;
        console.log('sponsor created!');
        var id = sponsor._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the sponsor with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    sponsores.remove({}, function (err, resp) {
      if (err) {
        next(err);
      }
      else {
        res.json(resp);
      }
    });
});

sponsorRouter.route('/month')
.get(function (req, res, next) {
    sponsores.findOne()
        .exec(function (err, competition) {
          if (err) {
            next(err);
          }
          else {
            res.json(competition);
          }
    });
});

sponsorRouter.route('/:id')
.get(function (req, res, next) {
    sponsores.findById(req.params.id)
        //.populate('action')
        .exec(function (err, sponsor) {
          if (err) {
            next(err);
          }
          else {
            res.json(sponsor);
          }
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    sponsores.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {
        new: true
    }, function (err, sponsor) {
      if (err) {
        next(err);
      }
      else {
        res.json(sponsor);
      }
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
  console.log("deleting sponsor " + req.params.id);
    sponsores.findByIdAndRemove(req.params.id, function (err, resp) {
      if (err) {
        console.log("error deleting sponsor " + err);
        next(err);
      }
      else {
        cleanup();
        console.log("deleting sponsor finished" + req.params.id);
        res.json(resp);
      }
    });
});


module.exports = sponsorRouter;
