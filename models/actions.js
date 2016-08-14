// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActionSchema = new Schema({
  name: String
});

// the schema is useless so far
// we need to create a model using it
var Actions = mongoose.model('Action', ActionSchema);

// make this available to our Node applications
module.exports = Actions;
