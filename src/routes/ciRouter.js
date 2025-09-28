import express from "express";
import ColorIdentityController from "../controllers/colorIdentityController.js";
import { getImgUrl } from "../utils/hbs-helpers.js";
import { getIdentityName } from "../utils/color.js";
import { titleFromCard } from "../utils/strings.js";
import { groupCardsIntoSections } from "../utils/card-grouping.js";

const router = express.Router();

router.get("/:ci", async (req, res, next) => {
    const { ci } = req.params;

    if (!isValid(ci)) {
        throw new Error("Invalid color identity");
    }

    try {
        const { list, count, cards } = await ColorIdentityController.getDataForColorIdentity(ci);

        const cardDetailsMap = new Map(list.map((c) => [c.card_id, c]));

        const commanders = count.map((card) => {
            const commanderIds = card.commander_name.split("__");
            const oracle = commanderIds
                .map((id) => {
                    const details = cardDetailsMap.get(id);
                    if (!details) return null;
                    const url = getImgUrl(details.img_id);
                    return { details, url };
                })
                .filter(Boolean);

            return {
                ...card,
                name: titleFromCard(oracle.map((o) => o.details)),
                images: oracle,
            };
        });

        const sections = groupCardsIntoSections(cards);

        res.render("ci", {
            identity: getIdentityName(ci),
            commanders,
            sections,
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
