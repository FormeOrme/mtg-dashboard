import database from "../database/connection.js";

export default class CommanderQueries {
    static async getCommandersByColor(colorNumber) {
        const query = `
            WITH 
            commanders AS (
                SELECT DISTINCT card_id
                FROM commander_groups cg
                JOIN cards c 
                    ON cg.deck_id = c.deck_id
                WHERE color = $1
                    AND side > 0
            )

            SELECT o.card_id, o.name, o.img_id
                FROM oracle o
                JOIN commanders cmd
                    ON o.card_id = cmd.card_id
            ;`;
        const values = [colorNumber];
        return await database.all(query, values);
    }

    // todo - I don't want to know the number of cards per color, I want to know the cards contained in decks that have exactly those colors
    static async getCommanderCountByColor(colorNumber) {
        const query = `
            SELECT
                commander_name,
                COUNT(*) as deck_count
            FROM commander_groups
            WHERE color = $1
            GROUP BY commander_name
            ORDER BY deck_count DESC;`;
        const values = [colorNumber];
        return await database.all(query, values);
    }
}
