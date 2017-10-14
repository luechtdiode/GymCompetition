var express = require('express');
var usersRouter = express.Router();
var User = require('../models/user');
var Verify = require('./verify');
var Club = require('../models/clubs');
var Sponsor = require('../models/sponsors');
var competitiones = require('../models/competitions');

/* GET users listing. */
usersRouter.route('/')
  // Task 3: Only admins are allowed to request the list of users
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, (req, res, next) => {
    User.find({}, (err, users) => {
      if(err) next(err);
      res.json(users);
    });
  });
usersRouter.route('/profile')
  .get(Verify.verifyOrdinaryUser, (req, res, next) => {
    User.findById(req.decoded.id, (err, user) => {
      if(err) next(err);
      Sponsor.findById(user.isMemberOfSponsor, (err, sponsor) => {
        if(err) next(err);
        Club.findById(user.isMemberOfClub, (err, club) => {
          if(err) next(err);
          // user.token = req.session.jwtToken;
          res.json({token: req.session.jwtToken, user: user, club: club, sponsor: sponsor});        
        });
      });
    });
  });
usersRouter.route('/:id')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, (req, res, next) => {
    console.log("find user with id " + req.params.id)
    User.findById(req.params.id, (err, user) => {
      if(err) next(err);
      res.json(user);
    });
  })
  .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, (req, res, next) => {
    console.log("delete user with id " + req.params.id)
    User.findByIdAndRemove(req.params.id, (err, user) => {
      if(err) {
        console.log(err);
        next(err);
      }
      res.json(user);
    });
  });

usersRouter.cleanup = () => {
  User.find({}, (err, comps) => {
    if(err) {
      console.log(err);
      next(err);
    }
    for(var i in comps) {
      if(!comps[i].isMemberOfClub && !comps[i].isMemberOfSponsor) {
        console.log("deleting User: " + comps[i]);
        User.remove({_id:comps[i]._id}, (err) => {
          console.log(err);
        });
        //User.findByIdAndRemove(comps[i]._id);
      }
      else if(comps[i].isMemberOfClub) {
        Club.findById(comps[i].isMemberOfClub, (err, clbs) => {
          if(err || !clbs) {
            console.log("deleting Club User: " + comps[i]);
            User.remove({_id:comps[i]._id}, (err) => {
              console.log(err);
            });
          }
        });
      }
      else if(comps[i].isMemberOfSponsor) {
        Sponsor.findById(comps[i].isMemberOfSponsor, (err, clbs) => {
          if(err || !clbs) {
            console.log("deleting Sponsor User: " + comps[i]);
            User.remove({_id:comps[i]._id}, (err) => {
              console.log(err);
            });
          }
        });
      }
    }

    competitiones.find({}, (err, comps) => {
      if(err) {
        console.log(err);
        next(err);
      }
      for(var i in comps) {
        if(!comps[i].clubid) {
          console.log("deleting competition1: " + comps[i]);
          competitiones.findByIdAndRemove(comps[i]._id, (err) => {
            console.log(err);
          });
        }
        else {
          Club.findById(comps[i].clubid, (err, clbs) => {
            if(err || !clbs) {
              console.log("deleting competition2: " + comps[i]);
              competitiones.findByIdAndRemove(comps[i]._id, (err) => {
                console.log(err);
              });
            }
          });
        }
      }
      User.find({"admin": true}, (err, adminusers) => {
          if (err || adminusers.length == 0) {
            User.findOne((err, adminuser) => {
              if (adminuser) {
                console.log("setting adminuser on " + adminuser.username);
                adminuser.admin = true;
                User.findByIdAndUpdate(adminuser._id, {
                    $set: adminuser
                }, {
                    new: true
                }, (err, user) => {
                  if (err) {
                    console.log(err);
                  }
                });
              } else {
                console.log("no users found -> no admin-user set");
              }
            });
          } else  {
            for (admin of adminusers) {
              console.log('Adminuser: ', admin);
            }
          }
      });

    });

  });
};
usersRouter.cleanup();

module.exports = usersRouter;
