const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage, cloudinary } = require('../cloudConfig.js');
const upload = multer({ storage });

const Listing = require('../MODELS/listing.js');
const ExpressError = require('../utils/ExpressError.js');
const { validateListing } = require('../schema.js');

const wrapAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
};

const isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (req.user.isAdmin) return next();
    if (!listing.owner) return next();
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// INDEX
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

// NEW
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('owner');
    if (!listing) throw new ExpressError(404, "Listing not found!");
    res.render("listings/show", { listing });
}));

// CREATE
router.post("/", isLoggedIn, upload.single('image'), validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (req.file) {
        newListing.image = { url: req.file.path, filename: req.file.filename };
    }
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
}));

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found!");
    res.render("listings/edit", { listing });
}));

// UPDATE
router.put("/:id", isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    if (req.file) {
        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }
        listing.image = { url: req.file.path, filename: req.file.filename };
    }
    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
}));

// DELETE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
    }
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted.");
    res.redirect("/listings");
}));

module.exports = router;