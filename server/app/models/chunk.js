var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChunkSchema   = new Schema({
  ad_id: Number,
  chunk_id: Number,
  content: String
});

module.exports = mongoose.model('Chunk', ChunkSchema);
