// CONSTANTS
// =============================================================================
var VERSION = '0.1';
var PROJECT_NAME = 'thesis-tagger';
var DEVELOPMENT_MODE = false;
var STANDARD_PORT = 8082;

var STATIC_DIR = __dirname + '/../public';

// MODULES
// =============================================================================
var express     = require('express');    // call express
var bodyParser  = require('body-parser');
var log         = require('npmlog') // for logging
var fs          = require('fs');
var mongoose    = require('mongoose');
var q           = require('q');

// LOGGING
// =============================================================================

log.level = 'verbose';

// EXPRESS
// =============================================================================

// define express app
var app         = express();

// set static file dir for user generated files
// such as their uploaded images
app.use("/jobad-tagger", express.static(STATIC_DIR));

// define port
var port = process.env.PORT || STANDARD_PORT;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// for development mode allow CORS request
if (DEVELOPMENT_MODE) {
  app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
               'Content-Type, X-Requested-With');
    res.header('Access-Control-Allow-Methods',
               'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });
  app.options('*', function(req,res,next){res.send(200);});
}

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

// GET /api/ads/random
//
//   description: Retrieve a random ad
//   returns: { <AdObject> }
router.get('/ads/random', function(req, res) {
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

// GET /api/chunks/byId/:id
//
//   description: Retrieve a list with all chunks
//   params:
//     ad_id: Number
//   returns: [{ <ChunkObject> }, ...]
router.get('/chunks/byId/:id', function(req, res) {
  ChunkSchema.find({_id: req.params.id }, function(err, chunks) {
    if (err) {
      res.status(500).json(
        {
          'message': 'Could not retrieve any chunks.',
          'details': err
        });
    } else {
      res.status(200).json(chunks);
    }
  })
});

// GET /api/chunks/byAdId/random
//
//   description: Retrieve a list with all chunks for an ad
//   params:
//     ad_id: Number
//   returns: [{ <ChunkObject> }, ...]
router.get('/chunks/byAdId/random', function(req, res) {
  // count total ads and return 'amount' random ones
  AdSchema.count({}, function(err, count){
    min = 0
    max = count
    var randomnumber = Math.floor(Math.random() * (max - min + 1)) + min;
    AdSchema.findOne({"ad_id": randomnumber}, function(error, ad) {
      ChunkSchema.find({"ad_id": ad.ad_id }, function(error, chunks) {
        res.json({
          'title': ad.title,
          'chunks': chunks });
      })
    })
  })
});

// GET /api/chunks/byAdId/:id
//
//   description: Retrieve a list with all chunks for one ad
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

  // Throw out empty tags and split multiple tags by comma
  tags = []
  for (var i = 0; i < req.body.tags.length; i++) {
    if (req.body.tags[i].content != "") {
      req.body.tags[i].content = req.body.tags[i].content.replace(/,\s*$/, "");
      split_tags = req.body.tags[i].content.toLowerCase().split(', ');
      for (var j = 0; j < split_tags.length; j++) {
        var appendTag = {}
        appendTag.chunk_id = req.body.tags[i].chunk_id;
        appendTag.content = split_tags[j]
        tags.push(appendTag)
      }
    }
  }

  // insert or update each tag with the new _chunks
  promises = []
  for (var i = 0; i < tags.length; i++) {
    var deferred = q.defer();
    var tag = tags[i];
    TagSchema.findOneAndUpdate({content: tag.content},
      { updated: Date.now(), $addToSet: { _chunks: tag.chunk_id } },
      {upsert: true}, function (err, doc) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(doc);
        }
    });
    promises.push(deferred)
  }

  // when all tags were successfully inserted give a response
  q.all(promises)
  .spread(function () {
    console.info('%d/%d tags were stored.', tags.length, req.body.tags.length);
    res.status(201).json(tags.length + '/' + req.body.tags.length
    + ' tags were stored.');
  }, function (err) {
    res.status(500).json(
      {
        'message': 'Could not upsert tags.',
        'details': err
      });
  });

});

// GET /api/tags
//
//   description: Retrieve a list with all tags
//   returns: [{ <TagObject> }, ...]
router.get('/tags', function(req, res) {
  TagSchema
    .find()
    // .limit(100)
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

// GET /api/tags/byContent/:query
//
//   description: Retrieve a list with all tags matching the query
//   params:
//     query: String
//   returns: [{ <TagObject> }, ...]
router.get('/tags/byContent/:query', function(req, res) {
  var regexp = new RegExp("^"+ req.params.query.toLowerCase());
  TagSchema
    .find({ content: regexp})
    .limit()
    .exec(function (err, tags) {
      if (err) {
        res.status(500).json(
          {
            'message': 'Could not retrieve any tags.',
            'details': err
          });
      } else {
        response = []
        for (var i = 0; i < tags.length; i++) {
          response.push(tags[i].content);
        }
        res.status(200).json(response);
      }
  })
});


// GET /api/populatedTags
//
//   description: Retrieve a list with all tags
//   returns: [{ <TagObject> }, ...]
router.get('/populatedTags', function(req, res) {
  TagSchema
    .find()
    // .limit(100)
    .populate('_chunks')
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


app.listen(port, function () {
  console.log(PROJECT_NAME + ' v' + VERSION + ' app listening on port '
    + port + '.');
});
