var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SubmissionSchema   = new Schema({
  ip: String,
  ad_id: Number,
  tag_count: Number,
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
