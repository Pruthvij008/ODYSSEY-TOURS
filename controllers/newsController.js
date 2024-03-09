const News = require('./../models/emailModel');
const factory = require('./handlerFunction');

exports.createNews = factory.createOne(News);
