import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../db/db";

// initialize google oauth2 strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            // create/update user in db during auth
            const user = await prisma.user.upsert({
                where: { googleId: profile.id },
                update: {
                    lastLogin: new Date(),
                },
                create: {
                    googleId: profile.id,
                    email: profile.emails?.[0].value ?? "",  // empty if undefined
                    lastLogin: new Date(),
                }
            });
            return done(null, user);
        }
    )
);

// serialize/deserialize user for session management
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
});