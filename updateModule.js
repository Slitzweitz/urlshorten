//  Callback module to connect to db, update if not already in db, return random # assigned to end either way

const express = require('express');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/urlKeys';

var addUrl = function (db, query, updated, err) {
      if (err) throw err;
      db.update(query, updated, {upsert: true});
      db.close();
};

mongo.connect(url, function(err, db) {
      if (err) throw err;
      var collection = db.collection('urlKeys');
      
      //  use collection.update with upsert set to true,
      //  only updates if there are NO matches with the query,
      //  so if the url passed in does NOT exist, update
      collection.update(query, updated, {upsert:true});
      
      db.close();
    });