const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const listingSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://plus.unsplash.com/premium_photo-1779271607674-0288347a1b2e?q=80&w=2071&auto=format&fit=crop",
        },
    },
    price: Number,
    location: String,
    country: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
});
 
// When a listing is deleted, delete all its reviews too
listingSchema.post('findOneAndDelete', async (listing) => {
    if (listing && listing.reviews.length) {
        const Review = require('./review.js');
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});
 
const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;