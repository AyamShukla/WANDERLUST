const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams gives access to :id from listings

const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const { validateReview } = require('../schema.js');

const wrapAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You can only delete your own reviews!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// CREATE review
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success", "Review added!");
    res.redirect(`/listings/${req.params.id}`);
}));

// DELETE review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted.");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;