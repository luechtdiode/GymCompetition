var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    sponsores = require('../models/sponsors'),
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

sponsorRouter.route('/:sponsorId')
.get(function (req, res, next) {
    sponsores.findById(req.params.sponsorId)
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
    sponsores.findByIdAndUpdate(req.params.sponsorId, {
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

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        sponsores.findByIdAndRemove(req.params.sponsorId, function (err, resp) {
          if (err) {
            next(err);
          }
          else {
            res.json(resp);
          }
    });
});

module.exports = sponsorRouter;
