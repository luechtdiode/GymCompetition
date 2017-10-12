var passportLocal = require('../auth/auth-local');
var User = require('../models/user');
var doLogin = require('./login');
var Club = require('../models/clubs');
var Sponsor = require('../models/sponsors');

function registerCompany(user, req, res, next) {
  console.log("register company: " + req.body.company);
  Sponsor.find({name: req.body.company}, (err, sponsors) => {
    if(err) {
      console.log(err);
      User.findByIdAndRemove(user.id, (err) => {
        return res.status(500).json({err: err});
      });
    }
    if(sponsors.length == 0) {
      var filteredSponsorActions = req.body.regactions.filter((action)=>{return action.selected;});
      for(var i in filteredSponsorActions) {
        filteredSponsorActions[i] = {
          action:filteredSponsorActions[i].action,
          bidperaction:filteredSponsorActions[i].bidperaction,
          maxcnt:filteredSponsorActions[i].maxcnt,
          kinds:filteredSponsorActions[i].kinds.split(',').filter((action)=>{return action.length > 0;})
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
      }), (err, sponsor) => {
        if(err) {
          console.log(err);
          return res.status(500).json({err: err});
        }
        console.log("Sponsor created");
        user.isMemberOfSponsor = sponsor.id;
        user.save((err,user) => {
          if(err) {
            console.log(err);
            return res.status(500).json({err: err});
          }
          console.log("Sponsor-User created");
          passportLocal.authenticate('local', doLogin(req,res,next))(req,res,next);
        });
      });
    }
    else {
      User.findByIdAndRemove(user.id, (err, user) => {
        return res.status(401).json({status: 'Registration not Successfuly: Sponsor allready exists!'});
      });
    }
  });
};

function registerClub(user, req, res, next) {
  console.log("register club: " + req.body.name);
  Club.find({name: req.body.name}, (err, clubs) => {
    if(err) {
      console.log(err);
      User.findByIdAndRemove(user.id, (err, user) => {
        return res.status(500).json({err: err});
      });
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
      }), (err, club) => {
        if(err) {
          console.log(err);
          User.findByIdAndRemove(user.id, (err, user) => {
            return res.status(500).json({err: err});
          });
        }
        console.log("Club created");
        user.isMemberOfClub = club.id;
        user.save((err,user) => {
          console.log("Club-User created");
          if(err) {
            console.log(err);
            User.findByIdAndRemove(user.id, (err, user) => {
              return res.status(500).json({err: err});
            });
          }
          passportLocal.authenticate('local', doLogin(req,res,next))(req,res,next);
        });
      });
    }
    else {
      User.findByIdAndRemove(user.id, (err, user) => {
        return res.status(401).json({status: 'Registration not Successfuly: Club allready exists!'});
      });
    }
  });
};

module.exports = { registerClub, registerCompany }