var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');
var Club = require('../models/clubs');
var Sponsor = require('../models/sponsors');
var competitiones = require('../models/competitions');

/* GET users listing. */
router.route('/')
  // Task 3: Only admins are allowed to request the list of users
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    User.find({}, function(err, users) {
      if(err) next(err);
      res.json(users);
    });
  });
router.route('/:id').get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
      console.log("find user with id " + req.params.id)
      User.findById(req.params.id, function(err, user) {
        if(err) next(err);
        res.json(user);
      });
    })
    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
      console.log("delete user with id " + req.params.id)
      User.findByIdAndRemove(req.params.id, function(err, user) {
        if(err) {
          console.log(err);
          next(err);
        }
        res.json(user);
      });
    });

  router.post('/register', function(req, res) {
    console.log("register: " + req.body);
      User.register(new User({ username : req.body.username }),
          req.body.password, function(err, user) {
          if (err) {
            //return res.status(500).json({err: err});
          }
          if(req.body.firstname) {
            user.firstname = req.body.firstname;
          }
          if(req.body.lastname) {
            user.lastname = req.body.lastname;
          }
          if(req.body.company) {
            console.log("register company: " + req.body.company);
            Sponsor.find({name: req.body.company}, function(err, sponsors) {
              if(err) {
                console.log(err);
                return res.status(500).json({err: err});
              }
              if(sponsors.length == 0) {
                var filteredSponsorActions = req.body.regactions.filter(function(action){return action.selected;});
                for(var i in filteredSponsorActions) {
                  filteredSponsorActions[i] = {
                    action:filteredSponsorActions[i].action,
                    bidperaction:filteredSponsorActions[i].bidperaction,
                    maxcnt:filteredSponsorActions[i].maxcnt,
                    kinds:filteredSponsorActions[i].kinds.split(',').filter(function(action){return action.length > 0;})
                  };
                }
                console.log("create Sponsor with filteredActions: " + filteredSponsorActions);
                Sponsor.create(new Sponsor({
                  name: req.body.company,
                  homepage:req.body.homepage,
                  googleplushandle: req.body.googleplushandle,
                  facebookhandle: req.body.facebookhandle,
                  twitterhandle: req.body.twitterhandle,
                  youtubehandle: req.body.youtubehandle,
                  slogan:req.body.slogan,
                  image: req.body.image,
                  sponsoractions: filteredSponsorActions
                }), function(err, sponsor) {
                  if(err) {
                    console.log(err);
                    return res.status(500).json({err: err});
                  }
                  console.log("Sponsor created");
                  user.isMemberOfSponsor = sponsor.id;
                  user.save(function(err,user) {
                    if(err) {
                      console.log(err);
                      return res.status(500).json({err: err});
                    }
                    console.log("Sponsor-User created");
                    passport.authenticate('local')(req, res, function () {
                      console.log("Sponsor-User authenticated");
                      return res.status(200).json({status: 'Registration Successful!'});
                    });
                  });
                });
              }
              else {
                return res.status(401).json({status: 'Registration not Successfuly: Sponsor allready exists!'});
              }
            });
          }
          else {
            console.log("register club: " + req.body.name);
            Club.find({name: req.body.name}, function(err, clubs) {
              if(err) {
                console.log(err);
                return res.status(500).json({err: err});
              }
              if(clubs.length == 0) {
                Club.create(new Club({
                  name: req.body.name,
                  //homepage:req.body.homepage,
                  image: req.body.image,
                  label: req.body.label,
                  kind: req.body.kind.split(","),
                  googleplushandle: req.body.googleplushandle,
                  facebookhandle: req.body.facebookhandle,
                  twitterhandle: req.body.twitterhandle,
                  youtubehandle: req.body.youtubehandle,
                  description: req.body.description
                }), function(err, club) {
                  if(err) {
                    console.log(err);
                    return res.status(500).json({err: err});
                  }
                  console.log("Club created");
                  user.isMemberOfClub = club.id;
                  user.save(function(err,user) {
                    console.log("Club-User created");
                    if(err) {
                      console.log(err);
                      return res.status(500).json({err: err});
                    }
                    passport.authenticate('local')(req, res, function () {
                      console.log("Club-User authenticated");
                      return res.status(200).json({status: 'Registration Successful!'});
                    });
                  });
                });
              }
              else {
                return res.status(401).json({status: 'Registration not Successfuly: Club allready exists!'});
              }
            });
          }
          });
      });
  //});

  // locally --------------------------------
  /*
router.get('/connect/local', function(req, res) {
      res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
router.post('/connect/local', passport.authenticate('local-signup', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }));
*/
  // facebook -------------------------------

    // send to facebook to do the authentication
router.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',
      passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
        username: user.username,
        isMemberOfSponsor: user.isMemberOfSponsor,
        isMemberOfClub: user.isMemberOfClub
      });
    });
  })(req,res,next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){});

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
        username: user.username,
        isMemberOfSponsor: user.isMemberOfSponsor,
        isMemberOfClub: user.isMemberOfClub
      });
    });
  })(req,res,next);
});

router.cleanup = function() {
  User.find({}, function(err, comps) {
    if(err) {
      console.log(err);
      next(err);
    }
    for(var i in comps) {
      if(!comps[i].isMemberOfClub && !comps[i].isMemberOfSponsor) {
        console.log("deleting User: " + comps[i]);
        User.remove({_id:comps[i]._id}, function(err){
          console.log(err);
        });
        //User.findByIdAndRemove(comps[i]._id);
      }
      else if(comps[i].isMemberOfClub) {
        Club.findById(comps[i].isMemberOfClub, function(err, clbs){
          if(err || !clbs) {
            console.log("deleting Club User: " + comps[i]);
            User.remove({_id:comps[i]._id}, function(err){
              console.log(err);
            });
          }
        });
      }
      else if(comps[i].isMemberOfSponsor) {
        Sponsor.findById(comps[i].isMemberOfSponsor, function(err, clbs){
          if(err || !clbs) {
            console.log("deleting Sponsor User: " + comps[i]);
            User.remove({_id:comps[i]._id}, function(err){
              console.log(err);
            });
          }
        });
      }
    }

    competitiones.find({}, function(err, comps) {
      if(err) {
        console.log(err);
        next(err);
      }
      for(var i in comps) {
        if(!comps[i].clubid) {
          console.log("deleting competition1: " + comps[i]);
          competitiones.findByIdAndRemove(comps[i]._id, function(err) {
            console.log(err);
          });
        }
        else {
          Club.findById(comps[i].clubid, function(err, clbs){
            if(err || !clbs) {
              console.log("deleting competition2: " + comps[i]);
              competitiones.findByIdAndRemove(comps[i]._id, function(err) {
                console.log(err);
              });
            }
          });
        }
      }
      User.find({"admin": true}, function (err, adminusers) {
          if (err || adminusers.length == 0) {
            User.findOne(function (err, adminuser) {
              console.log("setting adminuser on " + adminuser.username);
              adminuser.admin = true;
              User.findByIdAndUpdate(adminuser._id, {
                  $set: adminuser
              }, {
                  new: true
              }, function (err, competition) {
                if (err) {
                  console.log(err);
                }
              });
            });
          }
      });

    });

  });
};
router.cleanup();

module.exports = router;
