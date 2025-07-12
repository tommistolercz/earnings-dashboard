import express from "express";
import path from "path";

const router = express.Router();

// route for / (home)
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/home/home.html"));
});

export default router;