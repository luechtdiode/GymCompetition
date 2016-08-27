// grab the things we need
var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Schema = mongoose.Schema;
var Currency = mongoose.Types.Currency;

var SponsorActionSchema = new Schema({
    action: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action'
    },
    bidperaction: {
      type: Currency,
      default: 30.0
    },
    maxcnt: {
      type: Number,
      default: 100
    },
    kinds: [String]
});

// create a schema
var SponsorSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    image: {
      type: String,
      required: false,
      default: "images/sponsor.png"
    },
    slogan: {
      type: String,
      required: true
    },
    sponsoractions: [SponsorActionSchema],
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
    },
    description: {
      type: String,
      required: false,
      default: ''
    }
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Sponsors = mongoose.model('Sponsor', SponsorSchema);

// make this available to our Node applications
module.exports = Sponsors;
