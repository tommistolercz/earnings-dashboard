import express from "express";
import { isAuthenticatedApi } from "../../middleware/authenticated";
import { z } from "zod";
import { prisma } from "../../db/db";

// extend express request interface to include user with id
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

const router = express.Router();


// user settings schema
const userSettingsSchema = z.object({
    mandayRate: z.number()
        .min(0, "manday rate must be a positive number or zero (e.g. 10000)"),
    currency: z.string()
        .length(3, "currency must be a 3-letter code (e.g. CZK)"),
    vatRate: z.number()
        .min(0, "VAT rate must be a minimum of 0% (e.g. 0.0)")
        .max(1, "VAT rate must be a maximum of 100% (e.g. 1.0)"),
    country: z.string()
        .length(2, "country must be a 2-letter code (e.g. CZ)"),
    timeZone: z.string()
        .min(1, "time zone is required (e.g. Europe/Prague)"),
    workHoursStart: z.string()
        .regex(/^(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])?$/, {
            message: "work hours start must be in format H or H:MM (e.g. 9, 9:30)"
        }),
    workHoursEnd: z.string()
        .regex(/^(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])?$/, {
            message: "work hours end must be in format H or H:MM (e.g. 17, 17:30)"
        }),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;


// route for api endpoint - get user settings
router.get("/api/settings", isAuthenticatedApi, async (req, res) => {

    // get user settings from db
    const settings = await prisma.userSetting.findUnique({
        where: { userId: req.user!.id }
    });
    if (!settings) {
        res.status(404).json({ error: "User settings not found" });
        return;
    }

    res.json(settings);
});


// route for api endpoint - set user settings
router.post("/api/settings", isAuthenticatedApi, async (req, res) => {

    // validate request body against schema
    const parser = userSettingsSchema.safeParse(req.body);
    if (!parser.success) {
        res.status(400).json({
            error: "Invalid user settings",
            details: parser.error.issues,
        });
        return;
    }
    const parsedBody: UserSettings = parser.data;

    // store user settings into db
    await prisma.userSetting.upsert({
        where: {
            userId: req.user!.id
        },
        update: {
            updatedAt: new Date(),
            mandayRate: parsedBody.mandayRate,
            currency: parsedBody.currency,
            vatRate: parsedBody.vatRate,
            country: parsedBody.country,
            timeZone: parsedBody.timeZone,
            workHoursStart: parsedBody.workHoursStart,
            workHoursEnd: parsedBody.workHoursEnd,
        },
        create: {
            userId: req.user!.id,
            mandayRate: parsedBody.mandayRate,
            currency: parsedBody.currency,
            vatRate: parsedBody.vatRate,
            country: parsedBody.country,
            timeZone: parsedBody.timeZone,
            workHoursStart: parsedBody.workHoursStart,
            workHoursEnd: parsedBody.workHoursEnd,
        }
    });

    res.status(200).json({ message: "User settings updated successfully" });
});

export default router;