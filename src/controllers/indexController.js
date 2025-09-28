import CardQueries from "../queries/CardQueries.js";

export default class IndexController {
    static async getData() {
        try {
            const [cards] = await Promise.all([CardQueries.getAllCards(9 * 3)]);

            return { cards };
        } catch (error) {
            console.error(`Error fetching data:`, error);
            throw error;
        }
    }
}
