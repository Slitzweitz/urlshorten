//  I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.
//  If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.
//  When I visit that shortened URL, it will redirect me to my original link.
  //  if it is a url:
  //  - shorten it (generate random 4 digit, uniquely indexed number)
  //  - insert it
  //  if it is a 4 digit number:
  //  - search the db for it
  //  - pass the url to be redirected 
  //  - redirect
  // mongodb://<dbuser>:<dbpassword>@ds047305.mlab.com:47305/heroku_q3hjrckj

const express = require('express'),
      app = express(),
      port = process.env.PORT || 8080,
      mongo = require('mongodb').MongoClient,
      url = process.env.MONGODB_URI,
      test = require('assert');

//  accept all characters, including /
app.get('/*', function(req, res) {
  
  //  store the url which was passed, as a string
  var urlToShorten = req.params[0];
  var randomNumber = Math.floor(1000 + Math.random() * 9000);
  var upDoc = {
    passedurl : urlToShorten,
    shortenkey : randomNumber,
    shortenedurl : 'https://ran-dom-heroku.com/' + randomNumber
  };
  //  regex to make sure it is a url
  var urlRegex = /https?\:\/\/(www)?(\w+.){2,}\w+(\/.+)?/g;
  var shortRegex = /\d{4}/g;

  if (urlRegex.test(urlToShorten)) {
    mongo.connect(url, function(err, db) {
      if (err) throw err;
      var collection = db.collection('urlKeys');
      
      insertDb(function(data) {
        console.log(data.ops[0].shortenedurl);
        res.send({
          'shortenedurl' : data.ops[0].shortenedurl,
          'passedurl' : data.ops[0].passedurl
        });
      });
      
      function insertDb(callback) {
        console.log('inserting url');
        collection.insertOne(upDoc, function(err, doc) {
          test.equal(null, err);
          test.equal(1, doc.insertedCount, 'try again');
          console.log('inserted doc');
          callback(doc);
          // db.close();
        });
      }
      db.close();
    });
  }
  else if (shortRegex.test(urlToShorten)) {
    // is already in db
    mongo.connect(url, function(err, db) {
      if (err) throw err;
      urlToShorten = parseInt(urlToShorten, 10);
      console.log('connected to db, for redirection', urlToShorten);
      var collection = db.collection('urlKeys');
      
      redirUrl(function(data) {
        // var sending = data.passedurl;
        res.redirect(data[0].passedurl);
      });
      
      function redirUrl(callback) {
        collection.find({shortenkey : urlToShorten}).toArray(function(err, docs) {
          test.equal(null, err);
          console.log('key found, redirecting...');
          console.log(docs);
          callback(docs);
        });
      }
      db.close();
    });
  }
  else {
    res.send({ 
      'url to be shortened' : urlToShorten + ' is not a valid URL!'
    });
  }
});
app.listen(port);

// function insertDoc(db, callback) {
      //   collection.insertOne(upDoc, function(err, result) {
      //     assert.equal(err, null);
      //     callback(result.ips);
      //   });
      // }


//  use collection.update with upsert set to true,
//  only updates if there are NO matches with the query,
//  so if the url passed in does NOT exist, update
// collection.update({
//   passedurl : urlToShorten
// }, {
//   passedurl : urlToShorten,
//   shortenkey : randomNumber,
//   shortenedurl : 'https://ran-dom-heroku.com/' + randomNumber
// }, 
// {upsert:true},
// function(err, docs) {
//   if (err) throw err;
//   console.log('updated db', docs);
//   var updated = docs.message;
//   res.send({ 
//     updated
//   });
// });