define({ "api": [  {    "type": "get",    "url": "/ads/:id",    "title": "Get a job ad by id",    "name": "getAd",    "group": "Ads",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "id",            "description": "<p>Unique but pre-generated &quot;ad_id&quot;</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "ad",            "description": "<p>Job ad object</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "   HTTP/1.1 200 OK\n{\n  \"_id\": \"56b0c8e0ec9666697274faf0\",\n  \"ad_id\": 5524,\n  \"title\": \"Senior Pricing Economist\",\n  \"content\": \"<p>We are now looking for a <strong>(Senior) Pricing\n              Economist</strong> to carry out price optimisation analysis\n              and to make recommendations for Lumia devices pricing [...]\"\n}",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Ads"  },  {    "type": "get",    "url": "/ads/random",    "title": "Get a random job ad",    "name": "getRandomAd",    "group": "Ads",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "ad",            "description": "<p>Job ad object</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "   HTTP/1.1 200 OK\n{\n  \"_id\": \"56b0c8e0ec9666697274faf0\",\n  \"ad_id\": 5524,\n  \"title\": \"Senior Pricing Economist\",\n  \"content\": \"<p>We are now looking for a <strong>(Senior) Pricing\n              Economist</strong> to carry out price optimisation analysis\n              and to make recommendations for Lumia devices pricing [...]\"\n}",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Ads"  },  {    "type": "get",    "url": "/chunks/byAdId/:id",    "title": "Get chunks of an ad by ad_id",    "name": "getChunksByAdId",    "group": "Chunks",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "id",            "description": "<p>Unique ad ID</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "chunks",            "description": "<p>Array of chunk objects belonging to job ad</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "   HTTP/1.1 200 OK\n[\n  {\n    \"_id\": \"56aba31a9b1c17c8c85260fc\",\n    \"chunk_id\": 1975,\n    \"ad_id\": 100,\n    \"content\": \"Our customer is looking for development lead to Espoo for IT\n                Service Support Management (ITSSM) solution. This is a\n                fix-term contract from December 2015 to June 2016.\"\n  },\n  ...\n]",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Chunks"  },  {    "type": "get",    "url": "/chunks/byAdId/random",    "title": "Get chunks of a random ad",    "name": "getChunksByRandomAd",    "group": "Chunks",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "chunks",            "description": "<p>Array of chunk objects belonging to the job ad</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "    HTTP/1.1 200 OK\n{\n   'title': \"Development Lead (ITSSM)\",\n   'chunks': [\n     {\n       \"_id\": \"56aba31a9b1c17c8c85260fc\",\n       \"chunk_id\": 1975,\n       \"ad_id\": 100,\n       \"content\": \"Our customer is looking for development lead to Espoo for\n                 IT Service Support Management (ITSSM) solution. This is a\n                 fix-term contract from December 2015 to June 2016.\"\n     },\n     ...\n   ]\n}",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Chunks"  },  {    "type": "get",    "url": "/stats",    "title": "Get statistics",    "name": "Stats",    "group": "Meta",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "stats",            "description": "<p>API stats</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "    HTTP/1.1 200 OK\n{\n  \"total_submissions\": 2,\n  \"total_tags\": 3,\n  \"total_tagged_ads\": 2,\n  \"total_ads\": 6731\n}",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Meta"  },  {    "type": "get",    "url": "/",    "title": "Check the status of the API",    "name": "Status",    "group": "Meta",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>API status message</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "    HTTP/1.1 200 OK\n{\n  \"message\": \"thesis-tagger v0.1.0 API is up and running.\"\n}",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Meta"  },  {    "type": "get",    "url": "/tags",    "title": "Get tags",    "description": "<p>Retrieve all tags and the chunk IDs they are assigned to</p>",    "name": "getTags",    "group": "Tags",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "size",            "description": "<p>Size of retrieved batch of tags (maximum tags 100)</p>"          },          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "page",            "description": "<p>Offset, start retrieving from this batch/page number</p>"          }        ]      },      "examples": [        {          "title": "size",          "content": "size=10",          "type": "Number"        },        {          "title": "page",          "content": "page=2",          "type": "Number"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "tags",            "description": "<p>Array of all tag objects</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "    HTTP/1.1 200 OK\n[\n  {\n    \"_id\": \"56b4d8e79b1c17c8c854752f\",\n    \"content\": \"title\",\n    \"__v\": 0,\n    \"chunks\": [\n      {\n        \"_submission\": \"56b9278c716e188daa094164\",\n        \"_chunk\": \"56aba31c9b1c17c8c853a27d\",\n        \"_id\": \"56b4d8e776c75c1196905dfd\",\n        \"updated\": \"2016-02-05T17:16:23.103Z\"\n      },\n      ...\n    ]\n  }\n]",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Tags"  },  {    "type": "get",    "url": "/tags/byContent",    "title": "Search for tags",    "description": "<p>Retrieve all tags matching the query. The query only matches tags with the same beginning (regex ^query).</p>",    "name": "getTagsByContent",    "group": "Tags",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "term",            "description": "<p>Query parameter to find matching tags</p>"          }        ]      },      "examples": [        {          "title": "term",          "content": "term=intro",          "type": "String"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "tags",            "description": "<p>Array of all tag objects matching the query</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "   HTTP/1.1 200 OK\n[\n  {\n    \"_id\": \"56b0aa969b1c17c8c8547520\",\n    \"content\": \"introduction\",\n    \"__v\": 0,\n    \"updated\": \"2016-02-02T13:09:42.156Z\",\n    \"_chunks\": [\n      \"56aba31b9b1c17c8c8532b0d\"\n    ]\n  },\n  ...\n]",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Tags"  },  {    "type": "get",    "url": "/tags/populated",    "title": "Get populated tags (chunks/submissions)",    "description": "<p>Retrieve all tags, with each tags' chunk list populated with with the corresponding chunk object</p>",    "name": "getTagsPopulated",    "group": "Tags",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "size",            "description": "<p>Size of retrieved batch of tags (maximum tags 100)</p>"          },          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "page",            "description": "<p>Offset, start retrieving from this batch/page number</p>"          }        ]      },      "examples": [        {          "title": "size",          "content": "size=10",          "type": "Number"        },        {          "title": "page",          "content": "page=2",          "type": "Number"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "tags",            "description": "<p>Array of all tag objects matching the query</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "    HTTP/1.1 200 OK\n[\n  {\n    \"_id\": \"56b9278c9b1c17c8c8547530\",\n    \"content\": \"title\",\n    \"__v\": 0,\n    \"chunks\": [\n      {\n        \"_submission\": {\n          \"_id\": \"56b9278c716e188daa094164\",\n          \"ip\": \"::1\",\n          \"__v\": 0,\n          \"updated\": \"2016-02-08T23:41:00.685Z\"\n        },\n        \"_chunk\": {\n          \"_id\": \"56aba31d9b1c17c8c853f80a\",\n          \"chunk_id\": 106181,\n          \"ad_id\": 5127,\n          \"content\": \"Technician or bachelor degree in Civil Engineer\"\n        },\n        \"_id\": \"56b9278c716e188daa094165\",\n        \"updated\": \"2016-02-08T23:41:00.685Z\"\n      },\n      ...\n    ]\n  }\n]",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Tags"  },  {    "type": "post",    "url": "/tags",    "title": "Insert new tags",    "name": "postTags",    "group": "Tags",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "form-data",            "optional": false,            "field": "tags",            "description": "<p>Array with tags, sent as form-data (see example)</p>"          }        ]      },      "examples": [        {          "title": "Request-Example (formatted form-data):",          "content": "tags[1][chunk_id]:56aba31b9b1c17c8c852ad9e\ntags[1][content]:requirements\ntags[2][chunk_id]:56aba31b9b1c17c8c852ad9f\ntags[2][content]:title\n...",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "Success",            "description": "<p>message</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "    HTTP/1.1 200 OK\n\"1/19 tags were stored.\"",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "app/server.js",    "groupTitle": "Tags"  }] });
