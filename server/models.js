var crypto = require('crypto'),
    Ultrasound;

function defineModels(mongoose, fn) {
   Ultrasound = new mongoose.Schema({
      created : {type: Date, default: Date.now},
      thumbnail : String,
      image : {type: String, required: true},   
      location : [Number, Number],
      phone : String,
      personName : {type: String, required: true},
      personAge : {type: String, required: true},
      comments : String,      
      responded : {type: Boolean, default: false},
      response : String
   });

   Ultrasound.method('respond', function(response) {
      if (!this.responded) {
         this.responded = true;
         this.response = response;
      }
   });  

   Ultrasound.method('decodeImage', function() {
      return new Buffer(this.image, 'base64').toString('binary');
   });

   mongoose.model('Ultrasound', Ultrasound);

   fn();
}

exports.defineModels = defineModels
