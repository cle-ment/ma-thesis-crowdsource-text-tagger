var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AdSchema   = new Schema({
  ad_id: Number,
  title: String,
  content: String
});

module.exports = mongoose.model('Ad', AdSchema);
