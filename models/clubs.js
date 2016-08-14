// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var ClubSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    image: {
      type: String,
      required: false,
      default: "images/verein-flag.png"
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    kind: [String],
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
var Clubs = mongoose.model('Club', ClubSchema);

// make this available to our Node applications
module.exports = Clubs;
