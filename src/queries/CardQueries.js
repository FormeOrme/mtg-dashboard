import database from "../database/connection.js";

export default class CardQueries {
    static #getCardsQuery(filterClause) {
        return `
            WITH 
            relevant_decks AS (
                SELECT deck_id
                FROM commander_groups
                ${filterClause}
            ),
            total_decks AS (
                SELECT COUNT(deck_id) AS deck_count
                FROM relevant_decks
            ),
            ranked_cards AS (
                SELECT
                    bt.type_name,
                    c.card_id,
                    COUNT(c.card_id) AS card_count,
                    ROW_NUMBER() OVER (
                        PARTITION BY bt.type_name 
                            ORDER BY 
                                COUNT(c.card_id) DESC,
                                c.card_id ASC
                    ) as rn
                FROM mainboard c
                JOIN relevant_decks rd ON c.deck_id = rd.deck_id
                JOIN oracle o ON c.card_id = o.card_id
                CROSS JOIN base_types bt
                WHERE (
                    (bt.type_mask = 1 AND (o.type & 1) > 0) OR
                    (bt.type_mask = 4 AND (o.type & 4) > 0) OR
                    (
                        bt.type_mask != 1 AND bt.type_mask != 4 AND
                        (o.type & bt.type_mask) > 0 AND 
                        (o.type & 1) = 0 AND (o.type & 4) = 0
                    )
                )
                GROUP BY
                    bt.type_name, c.card_id
            )
            SELECT
                rc.type_name,
                rc.card_id,
                rc.card_count,
                td.deck_count AS total_decks,
                ROUND((rc.card_count * 100.0) / td.deck_count, 2) AS inclusion_percentage,
                o.*
            FROM ranked_cards rc, total_decks td
            JOIN oracle o ON rc.card_id = o.card_id
            WHERE rc.rn <= $limit
            ORDER BY rc.rn;
        `;
    }

    static async getAllCards(limit) {
        const query = this.#getCardsQuery("");
        const values = { $limit: limit };
        return await database.all(query, values);
    }

    static async getCardsByCommanderColor(color, limit) {
        const query = this.#getCardsQuery("WHERE color = $color");
        const values = { $color: color, $limit: limit };
        return await database.all(query, values);
    }

    static async getCardsByCommanderName(name, limit) {
        const query = this.#getCardsQuery("WHERE commander_name = $name");
        const values = { $name: name, $limit: limit };
        return await database.all(query, values);
    }

    static async getCommandersByCommanderName(name) {
        const names = name.split("__");
        const query = `
            SELECT *
            FROM oracle
            WHERE card_id IN (${names.map(() => "?").join(",")})
        `;
        const values = [...names];
        return await database.get(query, values);
    }
}
