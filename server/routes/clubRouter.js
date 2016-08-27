var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    clubes = require('../models/clubs'),
    Verify = require('./verify');

var clubRouter = express.Router();
clubRouter.use(bodyParser.json());

clubRouter.route('/')
.get(function (req, res, next) {
    clubes.find(req.query)
        //.populate('comments.postedBy')
        .exec(function (err, club) {
        if (err) {
          next(err);
        }
        else {
          res.json(club);
        }
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    clubes.create(req.body, function (err, club) {
      if (err) {
        next(err);
      }
      else {
        console.log('club created!');
        var id = club._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the club with id: ' + id);
      }
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    clubes.remove({}, function (err, resp) {
      if (err) {
        next(err);
      }
      else {
        res.json(resp);
      }
    });
});

clubRouter.route('/month')
.get(function (req, res, next) {
    clubes.findOne()
        .exec(function (err, competition) {
          if (err) {
            next(err);
          }
          else {
            res.json(competition);
          }
    });
});

clubRouter.route('/:id')
.get(function (req, res, next) {
    clubes.findById(req.params.id)
      //.populate('comments.postedBy')
      .exec(function (err, club) {
        if (err) {
          next(err);
        }
        else {
          res.json(club);
        }
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    clubes.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {
        new: true
    }, function (err, club) {
      if (err) {
        next(err);
      }
      else {
        res.json(club);
      }
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    clubes.findByIdAndRemove(req.params.clubId, function (err, resp) {
      if (err) {
        next(err);
      }
      else {
        res.json(resp);
      }
    });
});

module.exports = clubRouter;
