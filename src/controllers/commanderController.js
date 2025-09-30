import CardQueries from "../queries/CardQueries.js";
import CommanderQueries from "../queries/CommanderQueries.js";

export default class CommanderController {
    static async getDataForCommanderName(name) {
        try {
            const [count, list, cards] = await Promise.all([
                CommanderQueries.getCommanderCountByName(name),
                CommanderQueries.getCommandersByName(name),
                CardQueries.getCardSinergyByCommanderNameExcluding(name, 9 * 3),
            ]);
            return { count, list, cards };
        } catch (error) {
            console.error(`Error fetching data for commander ${name}:`, error);
            throw error;
        }
    }
}
