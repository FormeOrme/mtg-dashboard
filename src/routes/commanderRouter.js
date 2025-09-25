import express from "express";
import CommanderController from "../controllers/commanderController.js";
import { groupCardsIntoSections } from "../utils/card-grouping.js";
import { titleFromCard } from "../utils/strings.js";

const router = express.Router();

router.get("/:name", async (req, res, next) => {
    const { name: deckCommanders } = req.params;

    const { commanders, cards } = await CommanderController.getDataForCommanderName(deckCommanders);

    const sections = groupCardsIntoSections(cards);

    const { name, title } = titleFromCard([commanders]);

    try {
        res.render("commanders", { title: name, sections });
    } catch (error) {
        next(error);
    }
});

export default router;
