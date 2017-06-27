//  I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.
//  If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.
//  When I visit that shortened URL, it will redirect me to my original link.

//  When a get request is made to /new/:url, after checking that its feasibly a url, 
//  store the link in a collection in a mongodb database

const express = require('express');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://<dbuser>:<dbpassword>@ds139322.mlab.com:39322/shortened';

const app = express();
const port = process.env.PORT || 8080;

//  accept all characters, including /
app.get('/*', function(req, res) {
  //  store the url which was passed, as a string
  var urlToShorten = req.params[0];
  //  rather than use regex, check to see if a GET request succeeds
  
  //  regex to make sure it is a url
  var urlRegex = /https?\:\/\/(www)?(\w+.){2,}\w+(\/.+)?/g;
  //  if it is a url:
  //  - check to see if it has already been shortened, by searching the database for the url (req.params[0])
  //    > if it is new, shorten it and store it. 
  //    > if it is in the database already, use stored version
  //  - make sure random number has not been used on another link
  //  - display an object with the original and shortened urls

  if (urlRegex.test(urlToShorten)) {
  //  - check to see if it has already been shortened, by searching the database
  mongo.connect(url, function(err, db) {
      if (err) throw err;
      var collection = db.collection('name');
      collection.update({
        'passed url' : req.params.url
      });
      db.close();
    });
    console.log(urlToShorten + ' is a url');
    res.send({ 
      'url to be shortened' : req.params[0] ,
      'shortened' : 'https://short.er/' + Math.floor(1000 + Math.random() * 9000)
    });
    //  also, store it in a database
    
  }
  else {
    res.send({ 
      'url to be shortened' : urlToShorten + ' is not a valid URL!'
    });
  }
  
});
  // if (req.params.url.test(/https?\:(\/\/){2}(www)?(\w+.){2,}\w+(\/.+)?/g)) {
  //   console.log(req.params.url);
  // }
  // mongo.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var collection = db.collection('name');
  //   collection.update({
  //     'passed url' : req.params.url
  //   });
  //   db.close();
  // });
  
// });

app.listen(port);
