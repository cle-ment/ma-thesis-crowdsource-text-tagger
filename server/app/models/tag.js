var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
  content: String,
  chunk_ids: [String],
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tag', TagSchema);
