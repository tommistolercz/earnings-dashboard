import { Router } from "express";
import path from "path";

// express router
const router = Router();

// route for earnings dashboard (homepage)
router.get("/", (req, res) => {    
    res.sendFile(path.join(__dirname, "../../public/earnings-dashboard.html"));
});

export default router;
