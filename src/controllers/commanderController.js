import CommanderQueries from "../queries/CommanderQueries.js";
import { Strings } from "../utils/strings.js";

export default class CommanderController {
    static async getCardsByCommanderName(req, res) {
        try {
            const timeStart = Date.now();
            const name = Strings.strip(req.params.name);
            const cards = await CommanderQueries.getCardsByCommanderName(name);

            // Group cards by type
            const groupedCards = cards.reduce((acc, card) => {
                if (!acc[card.type_name]) {
                    acc[card.type_name] = [];
                }
                acc[card.type_name].push(card);
                return acc;
            }, {});

            res.status(200).json({
                took: Date.now() - timeStart,
                cards: groupedCards,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
