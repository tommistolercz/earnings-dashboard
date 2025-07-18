import express from "express";
import path from "path";
import { isAuthenticated } from "../middleware/authenticated";

const router = express.Router();

// route for settings
router.get("/settings", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/pages/settings/settings.html"),);
});

export default router;