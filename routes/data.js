var express = require('express');
var router = express.Router();

router.get('/:date', function(req, res, next) {
  const latitude = 54.315;
  const longitude = 18.45;
  const date = decodeURI(req.params.date);

  // creditientials from .env file
  const hostname = process.env.hostname;
  const username = process.env.username;
  const password = process.env.password;
  const database = process.env.database;
  
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  const url = `mongodb://${username}:${password}@${hostname}:27017/${database}`;
  
  MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
    assert.equal(null, err);

    const db = client.db(database);
    const collection = db.collection('armaag_data');
    collection.findOne({"time": date}, {"projection": {"_id": 0, "time": 0}}, function(err, docs) {
      assert.equal(err, null);

      // passing data to front-end application
      res.render('canvas', { latitude, longitude, date, docs });
    });
  });
});

module.exports = router;
