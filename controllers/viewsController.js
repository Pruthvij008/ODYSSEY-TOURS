const crypto = require('crypto');

// const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find().sort('-createdAt');

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});
exports.profile = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).render('profile', {
    title: 'update the users',
    users
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.managetours = async (req, res) => {
  try {
    // Fetch list of tours
    const tours = await Tour.find().sort('createdAt');

    // Render managetour view with tours data
    res.status(200).render('managetour', {
      title: 'Manage Tours',
      tours: tours // Pass the tours data to the view
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

function shuffle(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function selectUniqueReviews(reviews, num) {
  const selectedUserNames = new Set();

  // Use filter and map to select unique reviews
  const uniqueReviews = reviews.filter(review => {
    if (!selectedUserNames.has(review.user.name)) {
      selectedUserNames.add(review.user.name);
      return true;
    }
    return false;
  });

  // Slice the array to select the specified number of reviews
  return uniqueReviews.slice(0, num);
}

exports.home = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  // Shuffle the reviews array
  const shuffledReviews = shuffle(reviews);

  // Select the first three reviews with unique user names
  const randomReviews = selectUniqueReviews(shuffledReviews, 3);

  res.status(200).render('home', {
    title: 'odyssey tours',
    reviews: randomReviews
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'sign in and create the account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.forgotpassword = (req, res) => {
  res.status(200).render('forgot-password', {
    title: 'forgot-password'
  });
};

exports.stats = (req, res) => {
  res.status(200).render('stats', { title: 'stats' });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedUser) {
    return next(new Error('Failed to update user data'));
  }

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

//lecture 215

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN
  });
};
///for reset frontend
exports.resetPasswords = catchAsync(async (req, res, next) => {
  //1 getting user based on the token

  //encryption of reset token

  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  //2) if there is no user or there is an invalid token then

  if (!user) {
    return next(new AppError('sorry the token is invalid or expired ', 400));
  }
  const token = signToken(user._id);
  return res.render('reset-password', { token });
});
