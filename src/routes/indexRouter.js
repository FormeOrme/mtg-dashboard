import express from "express";
import IndexController from "../controllers/indexController.js";
import { groupCardsIntoSections, prepareCommanders } from "../utils/card-grouping.js";
import { ALL_COLORS } from "../utils/color.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { count, list, cards } = await IndexController.getData();
    const sections = groupCardsIntoSections(cards);
    const commanders = prepareCommanders(list, count);

    res.render("index", {
        title: "MTG Dashboard",
        commanders,
        sections,
        colors: ALL_COLORS,
    });
});

export default router;
