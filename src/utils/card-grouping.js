import { getImgUrl } from "./hbs-helpers.js";
import { titleFromCard } from "./strings.js";

// prettier-ignore
const TYPE_ORDER = [
    "creature",
    "planeswalker",
    "artifact",
    "enchantment",
    "battle",
    "instant",
    "sorcery",
    "land",
];

export function groupCardsIntoSections(cards) {
    const grouped = cards.reduce((acc, card) => {
        if (!acc[card.type_name]) {
            acc[card.type_name] = {
                type_name: card.type_name,
                cards: [],
            };
        }
        const title = card.name.split("//")[0].trim();
        const img_url = getImgUrl(card.img_id);

        const arena = (card.format & 127) === 0 ? "non-arena" : "arena";

        acc[card.type_name].cards.push({
            ...card,
            title,
            img_url,
            arena,
        });
        return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
        const indexA = TYPE_ORDER.indexOf(a.type_name);
        const indexB = TYPE_ORDER.indexOf(b.type_name);

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
    });
}

export function prepareCommanders(list, count) {
    const cardDetailsMap = new Map(list.map((c) => [c.card_id, c]));
    return count.map((card) => {
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
}
