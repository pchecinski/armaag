var express = require('express');
var router = express.Router();

router.get('/:latitude/:longitude/:date', function(req, res, next) {
  const latitude = req.params.latitude ? parseFloat(req.params.latitude) : null;
  const longitude = req.params.longitude ? parseFloat(req.params.longitude) : null;
  const date = decodeURI(req.params.date);

  const hostname = process.env.hostname; 'mongo.checinski.dev';
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
      res.render('canvas', { latitude, longitude, date, docs });
    });
  });
});

module.exports = router;
