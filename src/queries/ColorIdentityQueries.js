import database from "../database/connection.js";

export default class ColorIdentityQueries {
    static async getCardsByOracleColorIdentity(colorNumber) {
        const query = `
            SELECT c.card_id, count(c.card_id) as count
            FROM cards c
            JOIN oracle o
                ON c.card_id = o.card_id
            WHERE (o.color & $1) = 0
                AND c.main = 1
            GROUP BY c.card_id
            ORDER BY count DESC
        `;
        const values = [31 - colorNumber];
        return await database.all(query, values);
    }

    static async getCardsByDeckColorIdentity(colorNumber) {
        const query = `
            SELECT c.card_id, count(c.card_id) as count
            FROM cards c
            JOIN oracle o
                ON c.card_id = o.card_id
            JOIN commander_groups d
                ON c.deck_id = d.deck_id
            WHERE d.color = $1
                AND c.main = 1
                AND o.type & 1 = 0  -- Exclude lands
            GROUP BY c.card_id
            ORDER BY count DESC
        `;
        const values = [colorNumber];
        return await database.all(query, values);
    }

    static async getDelta(colorNumber) {
        const query = `
            --number of decks that could contain this color.
            WITH deck_sum AS (
                SELECT SUM(1) as total
                FROM commander_groups d
                WHERE (d.color & $1) = 0
            ),
            deck_exact AS (
                SELECT SUM(1) as total
                FROM commander_groups d
                WHERE d.color = $2
            ),
            oracle_count AS (
                SELECT c.card_id, count(c.card_id) as count
                FROM cards c
                JOIN oracle o
                    ON c.card_id = o.card_id
                WHERE (o.color & $1) = 0
                    AND c.main = 1
                GROUP BY c.card_id
            ),
            deck_count AS (
                SELECT c.card_id, count(c.card_id) as count
                FROM cards c
                JOIN oracle o
                    ON c.card_id = o.card_id
                JOIN commander_groups d
                    ON c.deck_id = d.deck_id
                WHERE d.color = $2
                    AND c.main = 1
                GROUP BY c.card_id
            )
            SELECT oc.card_id,
                    oc.count AS oracle_count,
                    ds.total AS oracle_total,
                    dc.count AS deck_count,
                    de.total AS deck_total,
                    oc.count/ds.total*100.0 AS oracle_percentage,
                    dc.count/de.total*100.0 AS deck_percentage,
                    (dc.count/de.total*100.0) - (oc.count/ds.total*100.0) AS delta 
            FROM oracle_count oc
            LEFT JOIN deck_count dc 
                ON oc.card_id = dc.card_id
            JOIN deck_sum ds 
                ON 1=1
            JOIN deck_exact de 
                ON 1=1
            ORDER BY oracle_count DESC;
        `;
        const values = [31 - colorNumber, colorNumber];
        return await database.all(query, values);
    }

    static async getCardsByColorCombinations(colorCombinations) {
        if (colorCombinations.length === 0) return [];
        const placeholders = colorCombinations.map(() => "?").join(", ");
        const query = `
            WITH color_groups AS (
                SELECT o.card_id, o.color
                FROM oracle o
                WHERE o.color IN (${placeholders})
            )

            SELECT cg.card_id, COUNT(cg.card_id) AS count
            FROM color_groups cg
            JOIN cards c ON cg.card_id = c.card_id
            WHERE c.main = 1
            GROUP BY cg.card_id
            ORDER BY count DESC
        `;
        return await database.all(query, colorCombinations);
    }
}
