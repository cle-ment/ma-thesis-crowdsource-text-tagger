var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChunkSchema   = new Schema({
  chunk_id: Number,
  ad_id: Number,
  chunk_count: Number,
  content: String
});

module.exports = mongoose.model('Chunk', ChunkSchema);
