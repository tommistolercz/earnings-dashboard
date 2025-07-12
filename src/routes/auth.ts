import express from "express";
import passport from "passport";

const router = express.Router();

// route for login
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
}));

// route for login callback after google has authenticated the user
router.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/"
}));

// route for logout
router.get("/logout", (req, res, next) => {
    req.logout(() => {
        req.session.destroy(err => {
            if (err) return next(err);
            res.clearCookie("connect.id");
            res.redirect("/");
        });
    });
});

export default router;