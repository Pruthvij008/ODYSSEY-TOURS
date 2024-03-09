const multer = require('multer');

const sharp = require('sharp');

const User = require('./../models/userModel');

const AppError = require('./../utils/appError');

const catchAsync = require('./../utils/catchAsync');

//200 using of multer

//creating the muter storage which will tell how the files will be stored that is the unique name of image
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   }
// });

//200
//200 for the storage or the file name
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-33423-3242343242.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

//checking if the file uploaded is image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image!! please upload an image', 400));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// const upload = multer({ dest: 'public/img/users' });

//200
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

//lecture number 161 factory handle to avoid duplication of code
const factory = require('./handlerFunction');

const filterObj = (obj, ...AllowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (AllowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getme = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateme = catchAsync(async (req, res, next) => {
  //199
  //for getting the mime type for the multer middleware
  console.log(req.file);
  console.log(JSON.stringify(req.body));

  //1) creating the useer posts password data and it can not be updated here

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'do not insert the password here this is not the correct route please go on updatePassword route !! Thankuuuuuu',
        400
      )
    );
  }

  //2) updating the userdocument here
  const filterObject = filterObj(req.body, 'name', 'email');
  if (req.file) filterObject.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterObject, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });
});

exports.deleteme = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// -------------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

//only for admins do not update password with this
exports.updateuser = factory.updateOne(User);

// /lecture 161
// mostly for admins use only
exports.deleteUser = factory.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not  defined! please use the/signup path for user account creation'
  });
};
