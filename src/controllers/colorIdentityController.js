import CommanderQueries from "../queries/CommanderQueries.js";
import CardQueries from "../queries/CardQueries.js";
import { getColorNumber } from "../utils/bitmask.js";

export default class ColorIdentityController {
    static async getDataForColorIdentity(colorIdentity) {
        try {
            const colorNumber = getColorNumber(colorIdentity);
            const [count, list, cards] = await Promise.all([
                CommanderQueries.getCommanderCountByColor(colorNumber),
                CommanderQueries.getCommandersByColor(colorNumber),
                CardQueries.getCardsByCommanderColor(colorNumber, 8 * 3),
            ]);
            return { list, count, cards };
        } catch (error) {
            console.error(`Error fetching data for color identity ${colorIdentity}:`, error);
            throw error;
        }
    }
}
