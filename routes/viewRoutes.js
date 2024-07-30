const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const reviewController = require('./../controllers/reviewController');
// const authController = require('./../controllers/authController');

const router = express.Router();
router.get(
  '/new/:tourId',
  authController.protect,
  reviewController.getReviewForm
);
router.post(
  '/reviews',
  authController.protect,
  reviewController.setTourUserIds,
  reviewController.createreview
);
router.get(
  '/alltours',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get(
  '/managetour',
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.managetours
);

router.get(
  '/profile',
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.profile
);

router.get(
  '/stats',
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.stats
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get('/myreviews', authController.protect, viewsController.myreview);
router.get('/forgot-password', viewsController.forgotpassword);

router.get('/', authController.isLoggedIn, viewsController.home);

// Assuming you have an Express.js route set up to handle password resets
// router.get('/reset-password', (req, res) => {
//   const { token } = req.query; // Extract the token from the URL query parameters
//   res.render('reset-password', { token });
// });

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
