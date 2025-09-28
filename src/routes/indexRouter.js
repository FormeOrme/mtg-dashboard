import express from "express";
import IndexController from "../controllers/indexController.js";
import { groupCardsIntoSections } from "../utils/card-grouping.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { cards } = await IndexController.getData();
    const sections = groupCardsIntoSections(cards);

    res.render("index", {
        title: "MTG Dashboard",
        sections,
    });
});

export default router;
