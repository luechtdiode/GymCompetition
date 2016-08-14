var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    actions = require('../models/actions'),
    Verify = require('./verify');

var actionRouter = express.Router();
actionRouter.use(bodyParser.json());

actionRouter.route('/')
.get(function (req, res, next) {
    actions.find(req.query)
        //.populate('comments.postedBy')
        .exec(function (err, action) {
        if (err) next(err);
        res.json(action);
    });
})

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    actions.create(req.body, function (err, action) {
        if (err) throw err;
        console.log('action created!');
        var id = action._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the action with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    actions.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

actionRouter.route('/:actionId')
.get(function (req, res, next) {
    actions.findById(req.params.actionId)
        //.populate('comments.postedBy')
        .exec(function (err, action) {
        if (err) next(err);
        res.json(action);
    });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    actions.findByIdAndUpdate(req.params.actionId, {
        $set: req.body
    }, {
        new: true
    }, function (err, action) {
        if (err) next(err);
        res.json(action);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        actions.findByIdAndRemove(req.params.actionId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

actions.find({}, function (err, action) {
  console.log("default-actions" + action);
    if (err || action.length == 0) {
      console.log("creating default-actions");
      actions.create({name: 'Advertiser on Homepage'});
      actions.create({name: 'Slogan/Banner in Event-Flyer'});
      actions.create({name: 'Slogan/Banner on Highscore-Printouts'});
    }
});
module.exports = actionRouter;
