const Review = require('./../models/reviewModel');

const factory = require('./handlerFunction');

// const catchAsync = require('./../utils/catchAsync');

// const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  next();
};
exports.getallreview = factory.getAll(Review);
//lecture number 162 creating a midlleware for the create review additional part in order to use the model factory function
//this midlle ware is added in the review routes .post midlleware
exports.getreview = factory.getOne(Review);
//lecture 162
exports.createreview = factory.createOne(Review); //half paRT ABOVE AND IN REVIEW ROUTES

exports.updateReview = factory.updateOne(Review);
///////////
exports.deleteReview = factory.deleteOne(Review);
