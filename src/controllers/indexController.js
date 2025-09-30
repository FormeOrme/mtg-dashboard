import CardQueries from "../queries/CardQueries.js";
import CommanderQueries from "../queries/CommanderQueries.js";

export default class IndexController {
    static async getData() {
        try {
            const [count, list, cards] = await Promise.all([
                CommanderQueries.getCommanderCount(),
                CommanderQueries.getCommanders(),
                CardQueries.getAllCards(9 * 3),
            ]);
            return { count, list, cards };
        } catch (error) {
            console.error(`Error fetching data:`, error);
            throw error;
        }
    }
}
