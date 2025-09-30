import express from "express";
import CommanderController from "../controllers/commanderController.js";
import { groupCardsIntoSections, prepareCommanders } from "../utils/card-grouping.js";
import { ALL_COLORS } from "../utils/color.js";

const router = express.Router();

router.get("/:name", async (req, res, next) => {
    const { name: deckCommanders } = req.params;

    const { count, list, cards } = await CommanderController.getDataForCommanderName(
        deckCommanders,
    );

    const sections = groupCardsIntoSections(cards);
    const commanders = prepareCommanders(list, count);

    try {
        res.render("commanders", { sections, commanders, colors: ALL_COLORS });
    } catch (error) {
        next(error);
    }
});

export default router;
