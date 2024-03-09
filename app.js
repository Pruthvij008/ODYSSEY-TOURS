const path = require('path');
const express = require('express');
const morgan = require('morgan');
const limiter = require('express-rate-limit');
const monogsantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieparser = require('cookie-parser');
const compression = require('compression');

// const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const newsRouter = require('./routes/emailRoute');
//starting express app
const app = express();

//lecture 175

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Gloabal  MIDDLEWARES

//implement cors

// app.use(cors());
// app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

app.use(helmet({ contentSecurityPolicy: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const ratelimiter = limiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this api please try again in an hour'
});

app.use('/api', ratelimiter);
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieparser());

//145
//data sanitization against NoSQL query injection
app.use(monogsantize());
//Data sanitization--malicious html code
app.use(xss());

//preventing parameter pollution with whitelisting

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(express.static(`${__dirname}/public`));

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  //lecture 189
  //commenting this jwt token for part 13

  // console.log(req.cookies);

  //video 131

  //console.log(req.headers);
  next();
});

// 3) ROUTES
//lecture number 175
//for pug template

//____________________________________________________________________________________________________________________
//this is shifted to view routes

//____________________________________________________________________________________________________________________

//lecture number 181
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/news', newsRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find the ${req.originalUrl} url`
  // });
  //////////////////
  // const err = new Error(`can't find the ${req.originalUrl} url`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  ////

  next(new AppError(`can't find the ${req.originalUrl} url`));
});

app.use(globalErrorHandler);

module.exports = app;
