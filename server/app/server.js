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

// Test the api
// -- GET /api
router.get('/', function(req, res) {
  res.json({'message': 'test' });
});

// GET /api/ads/randomAd
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
//   description: Retrieve a list with all chunks for an ad
//   params:
//     ad_id: Number
//   returns: [{ <ChunkObject> }, ...]
router.get('/chunks/byAdId/:id', function(req, res) {
  ChunkSchema.find({"ad_id": req.params.id }, function(error, chunks) {
    res.json({'content': chunks });
  })
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
