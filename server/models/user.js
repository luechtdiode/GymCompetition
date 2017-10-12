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
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    verifytoken: String,
    verified: Boolean,
    provider: String,
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
    isMemberOfSponsors: {
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

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

// User.pre('save', function (next) {
//   var user = this;
//   bcrypt.hash(user.password, 10, function (err, hash){
//     if (err) {
//       return next(err);
//     }
//     user.password = hash;
//     next();
//   })
// });

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
