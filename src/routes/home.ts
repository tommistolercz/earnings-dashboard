import { Router } from "express";
import path from "path";

// express router
const router = Router();

// route for / (home)
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/home/home.html"));
});

export default router;