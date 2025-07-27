import { Request, Response, NextFunction } from "express";

// mock user login for development purposes
export function mockLoginMiddleware(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === "development" && !req.user) {
        req.user = {
            id: "1234567890",  // mock user ID (exists in local db)
        };
    }
    next();
}