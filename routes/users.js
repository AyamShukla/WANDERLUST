const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.js');

const wrapAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// SIGNUP
router.get("/signup", (req, res) => res.render("users/signup"));

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to Wanderlust, ${username}!`);
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// LOGIN
router.get("/login", (req, res) => res.render("users/login"));

router.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", `Welcome back, ${req.user.username}!`);
        res.redirect("/listings");
    }
);

// LOGOUT
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You've been logged out.");
        res.redirect("/listings");
    });
});

module.exports = router;