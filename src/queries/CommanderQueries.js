import database from "../database/connection.js";

export default class CommanderQueries {
    static async getCommanders() {
        const query = `
            SELECT o.card_id, o.*
                FROM oracle o
                JOIN cards c 
                    ON o.card_id = c.card_id
                JOIN commander_groups cg
                    ON cg.deck_id = c.deck_id
                GROUP BY o.card_id
                ORDER BY o.name;
        `;
        return await database.all(query);
    }

    static async getCommanderCount() {
        const query = `
            SELECT commander_name, COUNT(*) as deck_count
                FROM commander_groups
                GROUP BY commander_name
                ORDER BY deck_count DESC;
        `;
        const result = await database.all(query);
        return result || [];
    }

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

            SELECT o.card_id, o.*
                FROM oracle o
                JOIN commanders cmd
                    ON o.card_id = cmd.card_id
            ;`;
        const values = [colorNumber];
        return await database.all(query, values);
    }

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
        const result = await database.all(query, values);
        return result || [];
    }

    static async getCommandersByName(name) {
        const query = `
            WITH 
            commanders AS (
                SELECT DISTINCT card_id
                FROM commander_groups cg
                JOIN cards c 
                    ON cg.deck_id = c.deck_id
                WHERE commander_name = $name
                    AND side > 0
            )

            SELECT o.card_id, o.*
                FROM oracle o
                JOIN commanders cmd
                    ON o.card_id = cmd.card_id
            ;`;
        const values = { $name: name };
        return await database.all(query, values);
    }

    static async getCommanderCountByName(name) {
        const query = `
            SELECT
                commander_name,
                COUNT(*) as deck_count
            FROM commander_groups
            WHERE commander_name = $name
            GROUP BY commander_name
            ORDER BY deck_count DESC;`;
        const values = { $name: name };
        const result = await database.all(query, values);
        return result || [];
    }
}
