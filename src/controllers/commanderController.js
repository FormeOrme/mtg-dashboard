import CardQueries from "../queries/CardQueries.js";

export default class CommanderController {
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
