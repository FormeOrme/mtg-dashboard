import express from "express";
import ColorIdentityController from "../controllers/colorIdentityController.js";
import { getImgUrl } from "../utils/hbs-helpers.js";
import { getIdentityName } from "../utils/color.js";
import { titleFromCard } from "../utils/strings.js";

const router = express.Router();

router.get("/:ci", async (req, res, next) => {
    const { ci } = req.params;

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

        const sections = cards.reduce((acc, card) => {
            if (!acc[card.type_name]) {
                acc[card.type_name] = {
                    type_name: card.type_name,
                    cards: [],
                };
            }
            const url = getImgUrl(card.img_id);
            acc[card.type_name].cards.push({
                ...card,
                title: card.name.split("//")[0].trim(),
                img_url: url,
            });
            return acc;
        }, {});

        res.render("ci", {
            identity: getIdentityName(ci),
            commanders,
            sections,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
