var express = require('express'),
    jade = require('jade'),
    connect = require('connect'),  
    mongoose = require('mongoose'), 
    mongoStore = require('connect-mongodb'), 
    stylus = require('stylus'),
    models = require('./models.js'),
    im = require('imagemagick'),
    app = express.createServer();

var db,
    Ultrasound;

function makeThumbnail(binData, done) {
   im.resize({
         srcData : binData,
         strip : false,
         width : 150,
         height : 150
      }, done);
};

app.configure('development', function() {
   app.set('db-uri', 'mongodb://localhost/rhok-ultrasound-development');
   app.use(express.errorHandler({
      dumpExceptions : true
   }));
});

app.configure(function() {
  app.set('views', __dirname);
  app.use(express.favicon());
  app.use(connect.bodyParser());
  app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }))
  app.use(express.methodOverride());
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
});

/* Add the models to mongoose. */
models.defineModels(mongoose, function() {
   Ultrasound = mongoose.model('Ultrasound');
   db = mongoose.connect(app.set('db-uri'));
});

app.get('/', function(req, res) {
   res.redirect('/list');
});

/* List ultrasounds.
   Ultrasounds that have not been responded to are at the top.
 */
app.get('/list', function(req, res) {
   var locals = {
      responded : [],
      notResponded : []
   }

   function responded(fn) {
      Ultrasound.find({
         responded : true
      },
      [], { sort : ['created', 'descending']}, fn);
   }

   function notResponded(fn) {
      Ultrasound.find({
         responded : false
      },
      [], {sort : ['created', 'descending']}, fn);     
   }

   function map(docs) {
      return docs.map(function(d) {
         return { 
            name : d.personName,
            age : d.personAge,
            comments : d.comments,
            created : new Date(d.created),
            id : d._id
         };
      });
   }
  
   responded(function(err, docs) {
      locals.responded = map(docs);
      notResponded(function(err, docs) {
         locals.notResponded = map(docs);
         res.render('views/index.jade', {locals : locals});   
      });      
   });   
});

/* Respond to an existing ultrasound. */
app.post('/respond/:id', function(req, res) { 
   Ultrasound.findOne({_id: req.params.id}, function(err, u) {
     u.responded = true;
     u.response = req.params.response;
     u.save(function(err) {
      if (err) { res.send({status: 'error', message: err.message}); }
      else { res.send({status : 'okay'}); }
     }); 
   });
});

/* Get an existing ultrasound image. */
app.get('/image/:id', function(req, res) { 
   Ultrasound.findOne({_id: req.params.id}, function(err, u) {
      if (!err) {
         res.setHeader('Content-type', 'image/jpg');        
         res.end(u.decodeImage(), 'binary');
      }
      else {
         res.send(404);
      }
   });
});

app.get('/thumb/:id', function(req, res) { 
   Ultrasound.findOne({_id: req.params.id}, function(err, u) {
      if (!err) {
         res.setHeader('Content-type', 'image/jpg');        
         res.end(u.thumbnail, 'binary');
      }
      else {
         res.send(404);
      }
   });
});

/* Send a new ultrasound to the server. */
app.post('/send', function(req, res) { 
   var u = new Ultrasound(req.body);   
   makeThumbnail(u.decodeImage(), function(err, data) {
      u.thumbnail = data;
      u.save(function(err, doc) {
         if (err) { res.send({status: 'error', message: err.message}); }
         else { res.send({status : 'okay', receipt: doc._id.toString()}); }
      });   
   });
});

exports.app = app;
