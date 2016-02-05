// CONSTANTS
// =============================================================================
var VERSION = '0.1.0';
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

// EXPRESS SETUP
// =============================================================================

// define express app
var app = express();

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

// API documented with http://apidocjs.com
// to generate documentation run:
//    $> apidoc -i app/ -o ./public/apidoc/

/**
 * @api {get} / Test the API
 * @apiName Test
 * @apiGroup Test
 *
 * @apiSuccess {String} message API status message
 */
router.get('/', function(req, res) {
  res.json({'message': PROJECT_NAME + ' v' + VERSION
            + ' API is up and running.' });
});

/**
 * @api {get} /ads/:id Get a job ad by id
 * @apiName getAd
 * @apiGroup Ads
 *
 * @apiParam {Number} id Unique but pre-generated "ad_id"
 *
 * @apiSuccess {Object} ad Job ad object
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  {
 *    "_id": "56b0c8e0ec9666697274faf0",
 *    "ad_id": 5524,
 *    "title": "Senior Pricing Economist",
 *    "content": "<p>We are now looking for a <strong>(Senior) Pricing
 *                Economist</strong> to carry out price optimisation analysis
 *                and to make recommendations for Lumia devices pricing [...]"
 *  }
 */
router.get('/ads/:id', function(req, res, next) {
  if (req.params.id == "random") {
    // go to random route
    next();
    return;
  }
  AdSchema.findOne({"ad_id": req.params.id}, function(err, ad) {
    if (err) {
      res.status(500).json(
        {
          'message': 'Could not retrieve job ad.',
          'details': err
        });
    } else {
      res.status(200).json(ad);
    }
  })
});

/**
 * @api {get} /ads/random Get a random job ad
 * @apiName getRandomAd
 * @apiGroup Ads
 *
 * @apiSuccess {Object} ad Job ad object
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  {
 *    "_id": "56b0c8e0ec9666697274faf0",
 *    "ad_id": 5524,
 *    "title": "Senior Pricing Economist",
 *    "content": "<p>We are now looking for a <strong>(Senior) Pricing
 *                Economist</strong> to carry out price optimisation analysis
 *                and to make recommendations for Lumia devices pricing [...]"
 *  }
 */
router.get('/ads/random', function(req, res) {
  // count total ads and return 'amount' random ones
  AdSchema.count({}, function(err, count){
    var rand = Math.floor(Math.random() * count) + 1;
    AdSchema.findOne({"ad_id": rand}, function(err, ad) {
      if (err) {
        res.status(500).json(
          {
            'message': 'Could not retrieve random job ad.',
            'details': err
          });
      } else {
        res.status(200).json(ad);
      }
    })
  })
});

/**
 * @api {get} /chunks/byAdId/:id Get chunks of an ad by ad_id
 * @apiName getChunksByAdId
 * @apiGroup Chunks
 *
 * @apiParam {Number} id Unique ad ID
 *
 * @apiSuccess {Object[]} chunks Array of chunk objects belonging to job ad
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *    {
 *      "_id": "56aba31a9b1c17c8c85260fc",
 *      "chunk_id": 1975,
 *      "ad_id": 100,
 *      "content": "Our customer is looking for development lead to Espoo for IT
 *                  Service Support Management (ITSSM) solution. This is a
 *                  fix-term contract from December 2015 to June 2016."
 *    },
 *    ...
 *  ]
 */
router.get('/chunks/byAdId/:id', function(req, res, next) {
  if (req.params.id == "random") {
    // go to random route
    next();
    return;
  }
  ChunkSchema.find({"ad_id": req.params.id }, function(err, chunks) {
    if (err) {
      res.status(500).json(
        {
          'message': 'Could not retrieve any chunks for ad.',
          'details': err
        });
    } else {
      res.status(200).json(chunks);
    }
  })
});

/**
 * @api {get} /chunks/byAdId/random Get chunks of a random ad
 * @apiName getChunksByRandomAd
 * @apiGroup Chunks
 *
 * @apiSuccess {Object[]} chunks Array of chunk objects belonging to the job ad
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *    'title': "Development Lead (ITSSM)",
 *    'chunks': [
 *      {
 *        "_id": "56aba31a9b1c17c8c85260fc",
 *        "chunk_id": 1975,
 *        "ad_id": 100,
 *        "content": "Our customer is looking for development lead to Espoo for
 *                  IT Service Support Management (ITSSM) solution. This is a
 *                  fix-term contract from December 2015 to June 2016."
 *      },
 *      ...
 *    ]
 * }
 */
router.get('/chunks/byAdId/random', function(req, res) {
  // count total ads and return 'amount' random ones
  AdSchema.count({}, function(err, count) {
    var rand = Math.floor(Math.random() * count) + 1;
    AdSchema.findOne({"ad_id": rand}, function(err, ad) {
      if (err) {
        res.status(500).json(
          {
            'message': 'Could not retrieve random job ad.',
            'details': err
          });
      } else {
        ChunkSchema.find({"ad_id": ad.ad_id }, function(err, chunks) {
          if (err) {
            res.status(500).json(
              {
                'message': 'Could not retrieve chunks for random job ad.',
                'details': err
              });
          } else {
            res.json({
              'title': ad.title,
              'chunks': chunks
            })
          }
        })
      } // end else of err ads
    })
  })
});

/**
 * @api {post} /tags Insert new tags
 * @apiName postTags
 * @apiGroup Tags
 *
 * @apiParam {form-data} tags Array with tags, sent as form-data (see example)
 * @apiParamExample {json} Request-Example (formatted form-data):
 *    tags[1][chunk_id]:56aba31b9b1c17c8c852ad9e
 *    tags[1][content]:requirements
 *    tags[2][chunk_id]:56aba31b9b1c17c8c852ad9f
 *    tags[2][content]:title
 *    ...
 *
 * @apiSuccess {String} Success message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * "1/19 tags were stored."
 */
router.post('/tags', function(req, res) {

  // submit timestamp
  var timestamp = Date.now();

  // get clients ip address
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

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
      { $addToSet:
        { chunks:
          { _chunk: tag.chunk_id,
            updated: timestamp,
            ip: ip
          }
        } },
      { upsert: true}, function (err, doc) {
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
    var msg = tags.length + ' tags for ' + req.body.tags.length
              + ' chunks were stored.';
    log.info(msg);
    res.status(201).json(msg);
  }, function (err) {
    res.status(500).json(
      {
        'message': 'Could not insert / update tags.',
        'details': err
      });
  });

});

/**
 * @api {get} /tags Get tags
 * @apiDescription Retrieve all tags and the chunk IDs they are assigned to
 * @apiName getTags
 * @apiGroup Tags
 *
 * @apiParam {Number} size Size of retrieved batch of tags (maximum tags 100)
 * @apiParam {Number} page Offset, start retrieving from this batch/page number
 * @apiParamExample {Number} size
 *    size=10
 * @apiParamExample {Number} page
 *    page=2
 *
 * @apiSuccess {Object[]} tags Array of all tag objects
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "56b4d8e79b1c17c8c854752f",
 *     "content": "title",
 *     "__v": 0,
 *     "chunks": [
 *       {
 *         "ip": "::1",
 *         "_chunk": "56aba31c9b1c17c8c853a27d",
 *         "_id": "56b4d8e776c75c1196905dfd",
 *         "updated": "2016-02-05T17:16:23.103Z"
 *       },
 *       ...
 *     ]
 *   }
  *]
 */
router.get('/tags', function(req, res) {
  var num_of_items = Math.min(req.query.size, 100) ;
  var page = req.query.page
  TagSchema
    .find()
    .skip(num_of_items * (page - 1))
    .limit(num_of_items )
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

/**
 * @api {get} /tags/byContent Search for tags
 * @apiDescription Retrieve all tags matching the query. The query only matches
 *    tags with the same beginning (regex ^query).
 * @apiName getTagsByContent
 * @apiGroup Tags
 *
 * @apiParam {String} term Query parameter to find matching tags
 * @apiParamExample {String} term
 *    term=intro
 *
 * @apiSuccess {Object[]} tags Array of all tag objects matching the query
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *    {
 *      "_id": "56b0aa969b1c17c8c8547520",
 *      "content": "introduction",
 *      "__v": 0,
 *      "updated": "2016-02-02T13:09:42.156Z",
 *      "_chunks": [
 *        "56aba31b9b1c17c8c8532b0d"
 *      ]
 *    },
 *    ...
 *  ]
 */
router.get('/tags/byContent', function(req, res) {
  var regexp = new RegExp("^"+ req.query.term.toLowerCase());
  TagSchema
    .find({ content: regexp})
    .limit(5)
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


/**
 * @api {get} /tags/populated Get tags populated with chunks
 * @apiDescription Retrieve all tags, with each tags' chunk list populated with
 *    with the corresponding chunk object
 * @apiName getTagsPopulated
 * @apiGroup Tags
 *
 * @apiParam {Number} size Size of retrieved batch of tags (maximum tags 100)
 * @apiParam {Number} page Offset, start retrieving from this batch/page number
 * @apiParamExample {Number} size
 *    size=10
 * @apiParamExample {Number} page
 *    page=2
 *
 * @apiSuccess {Object[]} tags Array of all tag objects matching the query
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "56b4d8e79b1c17c8c854752f",
 *     "content": "title",
 *     "__v": 0,
 *     "chunks": [
 *       {
 *         "ip": "::1",
 *         "_chunk": {
 *           "_id": "56aba31c9b1c17c8c853a27d",
 *           "chunk_id": 84280,
 *           "ad_id": 4000,
 *           "content": "Our client Yandex is looking for a specialist to work
 *                       with server and network hardware at its data centre in
 *                       Mäntsälä. [...]"
 *         },
 *         "_id": "56b4d8e776c75c1196905dfd",
 *         "updated": "2016-02-05T17:16:23.103Z"
 *       },
 *       ...
 *     ]
 *   }
 * ]
 */
router.get('/tags/populated', function(req, res) {
  var num_of_items = Math.min(req.query.size, 100) ;
  var page = req.query.page
  TagSchema
    .find()
    .skip(num_of_items * (page - 1))
    .limit(num_of_items )
    .populate('chunks._chunk')
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

// START THE SERVER
// =============================================================================

app.listen(port, function () {
  log.info(PROJECT_NAME + ' v' + VERSION + ' app listening on port '
    + port + '.');
});
