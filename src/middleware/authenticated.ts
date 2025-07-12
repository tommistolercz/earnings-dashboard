import { Request, Response, NextFunction } from "express";

// checks if the user is authenticated for web routes
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.redirect("/auth/google");
}

// checks if the user is authenticated for API routes
export function isAuthenticatedApi(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Not authenticated" });
}