import express from "express";
import path from "path";

const router = express.Router();

// route for features
router.get("/features", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/pages/features/features.html"));
});

export default router;