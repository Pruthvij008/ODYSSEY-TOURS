const express = require('express');
//198
// const multer = require('multer');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const viewsController = require('./../controllers/viewsController');
//198
// const upload = multer({ dest: 'public/img/users' });

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/resetPassword/:token', viewsController.resetPasswords);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getme, userController.getUser);
//198 photo
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateme
);
router.delete('/deleteMe', userController.deleteme);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateuser)
  .delete(userController.deleteUser);

module.exports = router;
