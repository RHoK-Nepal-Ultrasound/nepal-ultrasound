#!/usr/bin/env node

var urllib = require('urllib'),
    URL = 'http://localhost:3000/send',
    data = {
      personName : 'test',
      personAge : '27',
      comments : 'testing',    
      image : require('./image.js').image
    };

urllib.request(URL, {
   type : 'POST',
   content : JSON.stringify(data),
   headers : {
      'Content-Type' : 'application/json'
   }
   }, function (err, data, res) {
     if (res) {
        console.log(res.statusCode);
        console.log(res.headers);
        console.log(JSON.stringify(JSON.parse(data)).toString());
     }
});
