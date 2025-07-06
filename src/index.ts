import express from "express";
import path from "path";
import earningsDashboard from "./routes/earnings-dashboard";
import earningsApi from "./routes/earnings-api";

// express server
const app = express();
const port = 3000;

// static files for frontend
app.use("/public", express.static(path.join(__dirname, "../public")));

// routes
app.use(earningsDashboard);
app.use(earningsApi);

// error handling
app.listen(port, () => {
    console.log(`Express server running: http://localhost:${port}`);
});
