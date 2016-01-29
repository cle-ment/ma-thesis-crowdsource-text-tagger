// CONSTANTS
// =============================================================================
var VERSION = '0.1';
var PROJECT_NAME = 'blub';
var DEVELOPMENT_MODE = true;
var STANDARD_PORT = 8081;

// MODULES
// =============================================================================
var express     = require('express');    // call express
var bodyParser  = require('body-parser');
var log         = require('npmlog') // for logging
var fs          = require('fs');
var mongoose    = require('mongoose');

// LOGGING
// =============================================================================

log.level = 'verbose';

// EXPRESS
// =============================================================================

// define express app
var app         = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DATABASE AND MODELS
// =============================================================================

// Connect to the db
mongoose.connect('mongodb://localhost:27017/thesis'); // connect to our database

// get model schemas
var ChunkSchema = require('./models/chunk.js');
var AdSchema = require('./models/ad.js');
var TagSchema = require('./models/tag.js');

// ROUTER BASE SETUP
// =============================================================================

// get an instance of the express Router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
  log.http((new Date).toUTCString() + ' | ' + req.method + ' /api' + req.url);
  next(); // make sure we go to the next routes and don't stop here
});

// all of our routes will be prefixed with /api
app.use('/api', router);

// ROUTES
// =============================================================================

// GET /api
//
//   description: Test the api
router.get('/', function(req, res) {
  res.json({'message': 'test' });
});

// GET /api/ads/randomAd
//
//   description: Retrieve a random ad
//   returns: { <AdObject> }
router.get('/ads/randomAd', function(req, res) {
  // count total ads and return 'amount' random ones
  AdSchema.count({}, function(err, count){
    min = 0
    max = count
    var randomnumber = Math.floor(Math.random() * (max - min + 1)) + min;
    AdSchema.findOne({"ad_id": randomnumber}, function(error, ad) {
      res.json({'content': ad });
    })
  })
});

// GET /api/chunks/byAdId/:id
//
//   description: Retrieve a list with all chunks for an ad
//   params:
//     ad_id: Number
//   returns: [{ <ChunkObject> }, ...]
router.get('/chunks/byAdId/:id', function(req, res) {
  ChunkSchema.find({"ad_id": req.params.id }, function(error, chunks) {
    res.json({'content': chunks });
  })
});

// POST /api/tags
//
//   description: Add a new tag to a chunk
//   body (form-data):
//     chunk_id: Number
//     content: String
//   returns: { <TagObject> }
router.post('/tags', function(req, res) {

  var tag = new TagSchema();
  tag.chunk_id = req.body.chunk_id;
  tag.content = req.body.content;
  tag.save(function(err, tag) {
    if (error) {
      res.status(500).json(
        {
          'message': 'Could not save to database.',
          'details': err
        });
    } else {
      res.status(201).json(tag);
    }
  })
});

// GET /api/tags
//
//   description: Retrieve a list with all tags
//   returns: [{ <TagObject> }, ...]
router.get('/tags', function(req, res) {
  TagSchema
    .find()
    .limit(100)
    .exec(function (err, tags) {
      if (err) {
        res.status(500).json(
          {
            'message': 'Could not retrieve any tags.',
            'details': err
          });
      } else {
        res.status(200).json(tags);
      }
  })
});

// GET /api/taggedChunks
//
//   description: Retrieve a list with all chunks including tags
//   returns: [{ <ChunkObjectWithTags> }, ...]
router.get('/tags', function(req, res) {
  // TODO
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
