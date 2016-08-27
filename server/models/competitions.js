// grab the things we need
var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Schema = mongoose.Schema;
var Currency = mongoose.Types.Currency;

var CompSponsorActionSchema = new Schema({
    action: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action'
    },
    costperaction: {
      type: Currency,
      default: 30.0
    },
    maxcnt: {
      type: Number,
      default: 100
    }
});

// create a schema
var CompetitionSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    image: {
      type: String,
      required: false,
      default: "images/wettkampf.png"
    },
    club: {
      type: String,
      required: true
    },
    clubid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    kind: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    dates: [Date],
    description: {
      type: String,
      required: true
    },
    sponsoractions: [CompSponsorActionSchema],
    googleplushandle: {
      type: String,
      required: false,
      default: ''
    },
    facebookhandle: {
      type: String,
      required: false,
      default: ''
    },
    twitterhandle: {
      type: String,
      required: false,
      default: ''
    },
    youtubehandle: {
      type: String,
      required: false,
      default: ''
    }
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Competitions = mongoose.model('Competition', CompetitionSchema);

// make this available to our Node applications
module.exports = Competitions;
