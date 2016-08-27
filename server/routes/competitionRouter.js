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
        if (err) throw err;
        console.log('competition created!');
        var id = competition._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the competition with id: ' + id);
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

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
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
