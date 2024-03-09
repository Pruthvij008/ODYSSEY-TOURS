const crypto = require('crypto');

const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');

//lecture 135
const Email = require('./../utils/email');

//video 130 creating function for token creation

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN
  });
};
///////this function is not working properly
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  //this is one of the most insecure way and there is the security flaw watch video 129
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  //the url from the email.js is coming from here
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  //video 129

  //implementing jwt
  // const token = signToken(newUser._id);
  // createSendToken('success', 200, newUser);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser
  //   }
  // });
  const token = signToken(newUser._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: newUser // Change from { newUser } to newUser
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
  console.log(user);
});
//lecture 131
exports.protect = catchAsync(async (req, res, next) => {
  //1) getting the token and check its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('you are not logged in !! please login to get access', 401)
    );
  }
  //video 132......
  //2) verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3)check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('THE TOKEN BELONGING TO THE USER DOES NO LONGER EXISTS', 401)
    );
  }

  //4)check if user change password after jwt was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('use recently changed password ! please login again...', 401)
    );
  }

  //the next is basically it will grant access to the protected route
  req.user = freshUser;

  //lecture number 191 something because this is used in frontend not in backend so the res.locals use for frontend to store the user
  res.locals.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //req.user we specified i.e.  we saved the logined user in tht above as req.user=fresh user
    //////this is very important ***************************
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Sorry you do not have permission to perform this action !!!',
          403
        )
      );
    }
    next();
  };
};

//lecture 135

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // // 3) Send it to user's email
  // const resetURL = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message
    // });

    //lecture 208
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    console.log(err); // Add this line to log the error
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

//lecture 137
exports.resetPassword = catchAsync(async (req, res, next) => {
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

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3) we will go in user model to change the password chagedat property and for that we will use a middleware

  //4)now login in the user

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.updatePassword = async (req, res, next) => {
  //1) get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  //2)check if the posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError(
        'sorry you have entered invalid password please tryagain ',
        203
      )
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //user.finbyid and update will not

  //4) log the user in send jwt

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
};

// //lecture number 190 in order to see if user login then displaying logo and removing login signup we will use this middelware funcrtion similar to protect with some modi
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   //1) getting the token and check its there

//   if (req.cookies.jwt) {
//     const decoded = await promisify(jwt.verify)(
//       req.cookies.jwt,
//       process.env.JWT_SECRET
//     );

//     const freshUser = await User.findById(decoded.id);
//     if (!freshUser) {
//       return next();
//     }

//     //4)check if user change password after jwt was issued
//     if (freshUser.changedPasswordAfter(decoded.iat)) {
//       return next();
//     }

//     //there is a logged in user this user variable is accesible in pug template due to the res,locals
//     res.locals.user = freshUser;
//     next();
//   }
//   next();
// });
// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

//lecture number 192 ------------->>;logout functionality
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
