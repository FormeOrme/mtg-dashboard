import "dotenv/config";
import express from "express";
import hbs from "hbs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "./public");
const viewsPath = path.join(__dirname, "./views");
const partialsPath = path.join(__dirname, "./views/partials");

// Setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

import { getCardSvg, getColorSvg, eq } from "./src/utils/hbs-helpers.js";

hbs.registerHelper("getCardSvg", function (images) {
    return getCardSvg(images, hbs);
});

hbs.registerHelper("getColorSvg", function (color) {
    return getColorSvg(color, hbs);
});

hbs.registerHelper("eq", eq);

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// Use the refactored routes
import indexRouter from "./src/routes/indexRouter.js";
app.use("/", indexRouter);

import ciRoutes from "./src/routes/ciRouter.js";
app.use("/ci", ciRoutes);

import commanderRoutes from "./src/routes/commanderRouter.js";
app.use("/commander", commanderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error stack:", err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: err.message,
    });
});

app.listen(port, () => {
    console.log("🚀 Server is up on port " + port);
    console.log("🌐 Server is running at http://localhost:" + port);
});
