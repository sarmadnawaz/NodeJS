const express = require('express');
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect
} = require('../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/signin').post(signin);

router.route('/forgotpassword').post(forgotPassword);
router.route('/updatepassword').post(protect, updatePassword);

router.route('/resetpassword/:token').patch(resetPassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
