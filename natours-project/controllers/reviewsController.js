const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

const createReview = catchAsync(async (req, res) => {
    const review = await Review.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})

const getReviews = catchAsync(async (req, res) => {
    const reviews = await Review.find();
    res.status(200).json({
        status: "success",
        data: {
            reviews
        }
    })
})


module.exports = {
    createReview,
    getReviews
}