const Joi = require('joi');
const ExpressError = require('./utils/ExpressError.js');
 
// ── Listing validation ────────────────────────────────────────────────────────
const listingSchema = Joi.object({
    listing: Joi.object({
        title:       Joi.string().required(),
        description: Joi.string().allow('', null),
        price:       Joi.number().required().min(0),
        location:    Joi.string().required(),
        country:     Joi.string().required(),
        image: Joi.object({
            url:      Joi.string().allow('', null),
            filename: Joi.string().allow('', null),
        }).allow(null),
    }).required(),
});
 
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};
 
// ── Review validation ─────────────────────────────────────────────────────────
const reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating:  Joi.number().required().min(1).max(5),
    }).required(),
});
 
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};
 
module.exports = { validateListing, validateReview };