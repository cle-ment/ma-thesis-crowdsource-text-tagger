var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
  content: String,
  chunks: [
    {
      ip: String,
      updated: { type: Date, default: Date.now },
      _chunk: { type: Schema.Types.ObjectId, ref: 'Chunk' }
    }
  ]
});

module.exports = mongoose.model('Tag', TagSchema);
