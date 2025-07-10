import express from "express";
import path from "path";

import home from "./routes/home";
import dashboard from "./routes/dashboard";
import api from "./routes/api";

// express server
const app = express();
const port = 3000;

// static files for frontend
app.use("/public", express.static(path.join(__dirname, "../public")));

// routes
app.use(home);
app.use(dashboard);
app.use(api);

// error handling
app.listen(port, () => {
    console.log(`Express server running: http://localhost:${port}`);
});
