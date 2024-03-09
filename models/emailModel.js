const mongoose = require('mongoose');

const validator = require('validator');

const newsschema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, //this will just transform email to lower case
    //this is from the validator npm
    validate: [validator.isEmail, 'please provide a valid email']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const News = mongoose.model('News', newsschema);
module.exports = News;
