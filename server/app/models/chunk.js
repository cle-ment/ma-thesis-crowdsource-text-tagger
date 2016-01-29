var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChunkSchema   = new Schema({
  chunk_id: Number,
  ad_id: Number,
  content: String
});

module.exports = mongoose.model('Chunk', ChunkSchema);
