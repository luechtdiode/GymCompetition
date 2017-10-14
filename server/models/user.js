var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
// var bcrypt = require('bcrypt');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var User = new Schema({
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    verifytoken: String,
    verified: Boolean,
    // resetPasswordToken: String,
    // resetPasswordExpires: Date,
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        displayName  : String,
        photourls    : [String]
    },
    twitter          : {
        id           : String,
        token        : String,
        email        : String,
        displayName  : String,
        photourls    : [String]
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        displayName  : String,
        photourls    : [String]
    },
    linkedin         : {
        id           : String,
        token        : String,
        email        : String,
        displayName  : String,
        photourls    : [String]
    },
    instagram        : {
        id           : String,
        token        : String,
        email        : String,
        displayName  : String,
        photourls    : [String]
    },
    firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
      default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    },
    isMemberOfSponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sponsor',
      required: false
    },
    isMemberOfClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: false
    }
  }
);

User.methods.getSocialAccounts = function() {
  return {
    "facebook":this.facebook,
    "twitter":this.twitter,
    "google":this.google,
    "linkedin":this.linkedin,
    "instagram":this.instagram
  }
};

User.methods.getVisibleAuthAttributes = function() {
  return {
    "username":this.username, 
    "email": this.email,
    "firstname": this.firstname,
    "lastname": this.lastname,
    "isMemberOfClub": this.isMemberOfClub,
    "isMemberOfSponsor": this.isMemberOfSponsor,
    "facebook":(this.facebook.token !== undefined),
    "twitter":(this.twitter.token !== undefined),
    "google":(this.google.token !== undefined),
    "linkedin":(this.linkedin.token !== undefined),
    "instagram":(this.instagram.token !== undefined),
    "admin":this.admin,
  }
}

User.methods.getAuthAttributes = function() {
  return {
    "username":this.username, 
    "email": this.email,
    "id":this._id,
    "isMemberOfClub": this.isMemberOfClub,
    "isMemberOfSponsor": this.isMemberOfSponsor,
    "facebook":(this.facebook.token !== undefined),
    "twitter":(this.twitter.token !== undefined),
    "google":(this.google.token !== undefined),
    "linkedin":(this.linkedin.token !== undefined),
    "instagram":(this.instagram.token !== undefined),
    "admin":this.admin,
  }
}

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
