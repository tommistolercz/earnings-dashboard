import express from "express";
import path from "path";
import { isAuthenticated } from "../middleware/authenticated";

const router = express.Router();

// route for dashboard
router.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/dashboard/dashboard.html"),);
});

export default router;