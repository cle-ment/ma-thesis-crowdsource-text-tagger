var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AdSchema   = new Schema({
  ad_id: Number,
  name: String,
  job_description: String
});

module.exports = mongoose.model('Ad', AdSchema);
