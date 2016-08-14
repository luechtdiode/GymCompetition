var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var RegactionsSchema = new Schema({
  action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action'
  },
  name: {
    type: String,
    required: true
  },
  selected:   {
      type: Boolean,
      default: false
  },
  bidperaction:   {
      type: Currency,
      default: 10
  },
  maxcnt:   {
      type: Number,
      default: 100
  }
});

var User = new Schema({
    username: String,
    password: String,
    OauthId: String,
    OauthToken: String,
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
    company: {
      type: String,
      default: ''
    },
    slogan: {
      type: String,
      default: ''
    },
    rememberMe: {
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
    },
    regactions: [RegactionsSchema]
  }
);

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
