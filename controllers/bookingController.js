const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/tourModel');

const catchAsync = require('./../utils/catchAsync');

const Booking = require('../models/bookingModel');

//const AppError = require('../utils/appError');

const factory = require('./handlerFunction');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //we wont use thsi simple url because we will be storing the data in the database so we will use the advanced version which is below
    // success_url: `${req.protocol}://${req.get('host')}/`,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    //upper one lecture 214
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          },
          unit_amount: tour.price * 100
        },
        quantity: 1
      }
    ],
    mode: 'payment'
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.getbookingstats = catchAsync(async (req, res, next) => {
  const stats = await Booking.aggregate([
    {
      $match: {
        tour: { $ne: null }
      }
    },
    {
      $lookup: {
        from: 'tours',
        localField: 'tour',
        foreignField: '_id',
        as: 'tourDetails'
      }
    },
    {
      $group: {
        _id: '$tourDetails.name',
        numofusers: { $sum: 1 },
        totalRevenue: { $sum: '$price' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      doc: stats
    }
  });
});
