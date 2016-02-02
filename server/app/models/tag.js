var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
  content: String,
  _chunks: [{ type: Schema.Types.ObjectId, ref: 'Chunk' }],
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tag', TagSchema);
