const express = require('express');

const router = express.Router();
const {
  checkID,
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

const middleware = (req, res, next) => {
  if (req.body.name && req.body.price) {
    next();
  } else {
    res.status(404).json({
      status: 'error',
      message: 'invalid data',
    });
  }
};

router.param('id', checkID);

router.route('/').get(getTours).post(middleware, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
