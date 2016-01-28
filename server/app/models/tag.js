var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
  chunk_id: Number,
  tag: String,
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tag', TagSchema);
