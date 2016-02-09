var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
  content: String,
  chunks: [
    {
      _submission: { type: Schema.Types.ObjectId, ref: 'Submission' },
      _chunk: { type: Schema.Types.ObjectId, ref: 'Chunk' },
      updated: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Tag', TagSchema);
