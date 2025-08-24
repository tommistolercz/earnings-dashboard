import express from "express";
import { isAuthenticatedApi } from "../../middleware/authenticated";
import { Settings } from "../../services/settings";
import { UserSettings, userSettingsSchema } from "../../types/settings";

const router = express.Router();

// route for api endpoint - get user settings
router.get("/api/settings", isAuthenticatedApi, async (req, res) => {

    // get user settings
    const settings = new Settings(req.user!.id);
    const userSettings = await settings.getUserSettings();
    if (!userSettings) {
        res.status(404).json({ error: "User settings not found" });
        return;
    }
    res.json(userSettings);
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
    const userSettings: UserSettings = parser.data;

    // store user settings into db
    const settings = new Settings(req.user!.id);
    await settings.storeUserSettings(userSettings);
    res.status(200).json({ message: "User settings updated successfully" });
});

export default router;