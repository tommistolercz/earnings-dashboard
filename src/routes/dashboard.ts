import { Router } from "express";
import path from "path";

// express router
const router = Router();

// route for dashboard
router.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/dashboard/dashboard.html"));
});

export default router;