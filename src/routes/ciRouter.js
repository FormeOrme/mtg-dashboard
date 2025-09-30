import express from "express";
import ColorIdentityController from "../controllers/colorIdentityController.js";
import { getIdentityName } from "../utils/color.js";
import { groupCardsIntoSections, prepareCommanders } from "../utils/card-grouping.js";
import { ALL_COLORS } from "../utils/color.js";

const router = express.Router();

router.get("/:ci", async (req, res, next) => {
    const { ci } = req.params;

    if (!isValid(ci)) {
        throw new Error("Invalid color identity");
    }

    try {
        const { list, count, cards } = await ColorIdentityController.getDataForColorIdentity(ci);

        const commanders = prepareCommanders(list, count);

        const sections = groupCardsIntoSections(cards);

        res.render("ci", {
            identity: getIdentityName(ci),
            commanders,
            sections,
            selectedCode: ci.toUpperCase(),
            colors: ALL_COLORS,
        });
    } catch (error) {
        next(error);
    }
});

function isValid(ci) {
    const color = ci.toUpperCase();
    if (color === "C") return true;
    return /^[WUBRG]+$/.test(color);
}

export default router;
