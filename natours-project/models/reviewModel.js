const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        require: [true, "Review must have text"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default : Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref : "User"
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref : 'Tour'
    }
})

// populating user and tour field
reviewSchema.pre(/^find/, function (next) {
    console.log('run')
    this.populate({
        path: 'user',
        select : "name"
    })
    // .populate({
    //     path: 'tour',
    //     select : "-guides"
    // })
    next()
})

module.exports = mongoose.model('Review', reviewSchema);