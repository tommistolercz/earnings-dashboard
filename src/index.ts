import dotenv from "dotenv";
dotenv.config();  // load environment variables from .env file

import express from "express";
import path from "path";
import passport from "passport";
import session from "express-session";
import { RedisStore } from "connect-redis";

import { redisClient } from "./redis/redis"
import "./auth/google";

import auth from "./routes/auth";
import home from "./routes/home";
import dashboard from "./routes/dashboard";
import settings from "./routes/settings";
import apiDashboard from "./routes/api/api-dashboard";
import apiSettings from "./routes/api/api-settings";

// express server
const app = express();
const port = process.env.PORT || "3000";

// static frontend files
app.use("/public", express.static(path.join(__dirname, "../public")));

// setup for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session middleware (store session between requests)
app.use(session({
    store: new RedisStore({
        client: redisClient,
        prefix: "sess:"
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        //secure: process.env.NODE_ENV === "production",  // TODO: not working in prod, session cookie not set
        //sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7  // 7d
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use(auth);
app.use(home);
app.use(dashboard);
app.use(settings);
app.use(apiDashboard);
app.use(apiSettings);

// error handling
app.listen(port, () => {
    console.log(`Express server running: http://localhost:${port}`);
});