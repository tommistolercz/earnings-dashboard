import express from "express";
import passport from "passport";
import { Settings } from "../services/settings";

const router = express.Router();

declare global {
    namespace Express {
        interface User {
            id: string;
        }
        interface Request {
            user?: User;
        }
    }
}

// route for login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

// route for login callback after google has authenticated the user
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), async (req, res) => {
    console.log("Logged user: ", req.user);

    // if not user settings exist redirect to settings page    
    const settings = new Settings(req.user!.id);
    const userSettings = await settings.getUserSettings();
    if (!userSettings) {
        return res.redirect("/settings");
    }
    // redirect to dashboard
    res.redirect("/dashboard");
});

// route for logout
router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(err => {
            if (err) return next(err);
            res.clearCookie("connect.sid");
            res.redirect("/");
        });
    });
});

export default router;