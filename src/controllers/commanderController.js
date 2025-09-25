import CommanderQueries from "../queries/CommanderQueries.js";
import CardQueries from "../queries/CardQueries.js";
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

    static async getDataForCommanderName(name) {
        try {
            const [commanders, cards] = await Promise.all([
                CardQueries.getCommandersByCommanderName(name),
                CardQueries.getCardsByCommanderName(name, 9 * 3),
            ]);
            return { commanders, cards };
        } catch (error) {
            console.error(`Error fetching data for commander ${name}:`, error);
            throw error;
        }
    }
}
