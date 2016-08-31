var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    competitiones = require('../models/competitions'),
    Verify = require('./verify');

var competitionRouter = express.Router();
competitionRouter.use(bodyParser.json());

competitionRouter.route('/')
.get(function (req, res, next) {
    competitiones.find(req.query)
        .populate('clubid')
        .populate('action')
        .exec(function (err, competition) {
          if (err) {
            next(err);
          }
          else {
            res.json(competition);
          }
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
  console.log(req.body);
    competitiones.create(req.body, function (err, competition) {
        if (err) {
          next(err);
        }
        else {
          console.log('competition created!');
          res.json(competition);
        }
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    competitiones.remove({}, function (err, resp) {
      if (err) {
        next(err);
      }
      else {
        res.json(resp);
      }
    });
});

competitionRouter.route('/next')
.get(function (req, res, next) {
    var today = new Date();
    competitiones.findOne({ $or: [{"date" : {$gte: today}}, {"date" : {$eq: today}}]})
        .populate('clubid')
        .populate('action')
        .exec(function (err, competition) {
          if (!competition || err) {
            competitiones.findOne()
                .populate('clubid')
                .populate('action')
                .exec(function (err, competition) {
                  if (err) {
                    next(err);
                  }
                  else {
                    res.json(competition);
                  }
            })
          }
          else {
            res.json(competition);
          }
    });
})

competitionRouter.route('/:id')
.get(function (req, res, next) {
    competitiones.findById(req.params.id)
      .populate('clubid')
      .populate('action')
      .exec(function (err, competition) {
        if (err) {
          next(err);
        }
        else {
          res.json(competition);
        }
      });
    }
)

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    competitiones.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {
        new: true
    }, function (err, competition) {
      if (err) {
        next(err);
      }
      else {
        res.json(competition);
      }
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log("deleting competition " + req.params.id);
        competitiones.findByIdAndRemove(req.params.id, function (err, resp) {
          if (err) {
            next(err);
          }
          else {
            res.json(resp);
          }
    });
});

module.exports = competitionRouter;
