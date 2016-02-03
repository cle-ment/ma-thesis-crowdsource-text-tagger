# thesis-tagger

This project can be used to tag chunks of documents with topics. In this case
the documents are job ads. The project consists of a node.js server connected
to a MongoDB database and a simple web interface that accesses the server via
a JSON API.

## Prerequisites

- Node.js
- MongoDB
- python
- jupyter / ipython

## Data preprocessing

The jupyter notebook 'extractjobs.ipynb' includes the necessary steps to perform
 the preprocessing on the data. It is assumed here that the data is in the
 format as described / used in this notebook. In essence this chops up the job
 ads into chunks and saves the data into csv files. These can then be imported
 in MongoDB as described in the notebook.

## Server setup

1. Clone the project
2. run 'npm install' in the 'server' directory to get the necessary dependencies
3. run the server via 'node server.js' and access the interface via
   <http://localhost:8082/jobad-tagger/>

## Post-processing

The jupyter notebook 'post-processing.ipynb' contains steps to post process the
data, though it still is work in progress.
