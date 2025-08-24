import express from "express";
import { isAuthenticatedApi } from "../../middleware/authenticated";
import { Settings } from "../../services/settings";
import { Dashboard } from "../../services/dashboard";
import { DateTime } from "luxon";

const router = express.Router();

// route for api endpoint
router.get("/api/dashboard", isAuthenticatedApi, async (req, res) => {

    // get user settings
    const settings = new Settings(req.user!.id);
    const userSettings = await settings.getUserSettings();
    if (!userSettings) {
        res.status(404).json({ error: "User settings not found" });
        return;
    }

    // get dashboard data
    const dashboard = new Dashboard(userSettings);
    const now = DateTime.now().setZone(userSettings.timeZone);
    res.json(dashboard.getDashboardData(now));
});

export default router;