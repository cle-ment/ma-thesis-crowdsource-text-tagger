// CONSTANTS
// =============================================================================
var VERSION = '0.3.0';
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
mongoose.connect('mongodb://localhost:27017/thesis'); //connect to our database

// get model schemas
var ChunkSchema = require('./models/chunk.js');
var AdSchema = require('./models/ad.js');
var TagSchema = require('./models/tag.js');
var SubmissionSchema = require('./models/submission.js');

// ROUTER BASE SETUP
// =============================================================================

// get an instance of the express Router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  log.http((new Date).toUTCString() + ' | ' + req.method + ' /api' + req.url
    + " | " + ip);
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
 * @api {get} / Check the status of the API
 * @apiName getMetaStatus
 * @apiGroup Meta
 *
 * @apiSuccess {String} message API status message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *   "message": "thesis-tagger v0.2.1 API is up and running."
 * }
 */
router.get('/', function(req, res) {
  res.json({
    'status': PROJECT_NAME + ' v' + VERSION + ' API is up and running.'
  });
});

/**
 * @api {get} /meta/stats Get statistics
 * @apiName getMetaStats
 * @apiGroup Meta
 *
 * @apiSuccess {Object} stats API stats
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *   "total_submissions": 2,
 *   "total_tags": 3,
 *   "total_tagged_ads": 2,
 *   "total_ads": 6731
 * }
 */
router.get('/meta/stats', function(req, res) {

  // total submissions
  submissions = SubmissionSchema.count().then(function (count) {
    return count;
  })
  // total tags
  tags = TagSchema.count().then(function (count) {
    return count;
  })
  // tagged job ads
  tagged_ads = SubmissionSchema.find().distinct('ad_id').count()
  .then(function(count) {
    return count;
  })
  // total ads
  ads = AdSchema.count()
  .then(function(count) {
    return count;
  })

  q.all([
    submissions,
    tags,
    tagged_ads,
    ads
  ]).spread(function(total_submissions, total_tags, total_tagged_ads, total_ads) {
    response = {
      "total_submissions": total_submissions,
      "total_tags": total_tags,
      "total_tagged_ads": total_tagged_ads,
      "total_ads": total_ads
    }
    res.status(200).json(response);
  }, function () {
    res.status(500).json(
      {
        'message': 'Could not get stats.',
        'details': err
      });
  });
});

/**
 * @api {get} /meta/winner Get winner (person with most submissions)
 * @apiDescription Finds the email address that has made the most submissions
 * @apiName getMetaWinner
 * @apiGroup Meta
 *
 * @apiSuccess {Object} winner Winner email and number of submissions
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *    "winner": "john.doe@email.com",
 *    "submissions": 12
 * }
 */
router.get('/meta/winner', function(req, res) {

  var max_count = 0
  var max_email = 0

  SubmissionSchema
  .find({email: { $exists: true }})
  .exec(function (err, submissions) {
    if (err) {
      res.status(500).json(
        {
          'message': 'Could not find submissions with email adresses.',
          'details': err
        });
    } else {
      for (var i = 0; i < submissions.length; i++) {
        count = 0;
        for (var j = 0; j < submissions.length; j++) {
          if (submissions[j].email == submissions[i].email) {
            count++
          }
        }
        if (count > max_count) {
          max_count = count
          max_email = submissions[i].email
        }
      }
      res.status(200).json({"winner": max_email, "submissions": max_count});
    }
  });
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
 * @apiParam {form-data} tags Array with tags, sent as form-data
 *    and email address (see example)
 * @apiParamExample {json} Request-Example (formatted form-data):
 *    email:john.doe@email.com
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

  // get timestamp
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
        var appendTag = {};
        appendTag.chunk_id = req.body.tags[i].chunk_id;
        appendTag.content = split_tags[j];
        tags.push(appendTag);
      }
    }
  }

  // get email address
  email = req.body.email || ""

  // find job ad for tags
  getAdId = ChunkSchema.find({_id: tags[0].chunk_id})
  getAdId.then(function(chunk_with_ad_id) {


    // register new submission
    var submission = new SubmissionSchema(
      { ip: ip,
        ad_id: chunk_with_ad_id.ad_id,
        tag_count: tags.length,
        email: email,
        updated: timestamp
      });
    submission.save().then(function (submission) {

      // insert or update each tag with the new _chunks
      promises = []
      for (var i = 0; i < tags.length; i++) {
        var deferred = q.defer();
        var tag = tags[i];
        TagSchema.findOneAndUpdate({content: tag.content},
          { $addToSet:
            { chunks:
              { _chunk: tag.chunk_id,
                _submission: submission._id,
                updated: timestamp
              }
            } },
          { upsert: true }, function (err, doc) {
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
                  + ' chunks were stored. ' + email;
        log.info(msg);
        res.status(201).json(msg);
      }, function (err) {
        res.status(500).json(
          {
            'message': 'Could not insert / update tags.',
            'details': err
          });
      });

    // adding submission not successful
    }, function() {
      res.status(500).json(
        {
          'message': 'Could not add submission.',
          'details': err
        });
    });

  // getting ad id not successful
  }, function functionName() {
    res.status(500).json(
      {
        'message': 'Could not retrieve job ad for chunks.',
        'details': err
      });
      return;
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
 *         "_submission": "56b9278c716e188daa094164",
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
    .limit(num_of_items)
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
 * @api {get} /tags/populated Get populated tags (chunks/submissions)
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
 *     "_id": "56b9278c9b1c17c8c8547530",
 *     "content": "title",
 *     "__v": 0,
 *     "chunks": [
 *       {
 *         "_submission": {
 *           "_id": "56b9278c716e188daa094164",
 *           "ip": "::1",
 *           "__v": 0,
 *           "updated": "2016-02-08T23:41:00.685Z"
 *         },
 *         "_chunk": {
 *           "_id": "56aba31d9b1c17c8c853f80a",
 *           "chunk_id": 106181,
 *           "ad_id": 5127,
 *           "content": "Technician or bachelor degree in Civil Engineer"
 *         },
 *         "_id": "56b9278c716e188daa094165",
 *         "updated": "2016-02-08T23:41:00.685Z"
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
    .populate('chunks._submission')
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
