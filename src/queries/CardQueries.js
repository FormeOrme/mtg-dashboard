import database from "../database/connection.js";

export default class CardQueries {
    static #relevantDecks(filterClause) {
        return `relevant_decks AS (
            SELECT deck_id
            FROM commander_groups
            ${filterClause}
        )`;
    }

    static #totalDecks() {
        return `total_decks AS (
            SELECT COUNT(deck_id) AS deck_count
            FROM relevant_decks
        )`;
    }

    static #rankedCards() {
        return `ranked_cards AS (
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
        )`;
    }

    static #getCardsQuery(filterClause) {
        return `
            WITH 
            ${this.#relevantDecks(filterClause)},
            ${this.#totalDecks()},
            ${this.#rankedCards()}
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

    static async getCardSinergyByCommanderNameExcluding(name, limit) {
        const query = `WITH
            commander_decks AS (
                SELECT deck_id, color
                FROM commander_groups
                WHERE commander_name = $name
            ),
            commander_color AS (
                SELECT color
                FROM commander_decks
                LIMIT 1
            ),
            color_decks AS (
                SELECT deck_id
                FROM commander_groups, commander_color
                WHERE commander_groups.color = commander_color.color
                AND commander_groups.commander_name != $name
            ),
            card_counts AS (
                SELECT
                    card_id,
                    SUM(is_in_commander_deck) AS card_count_commander,
                    SUM(is_in_color_deck) AS card_count_color
                FROM (
                    SELECT c.card_id, 1 AS is_in_commander_deck, 0 AS is_in_color_deck
                    FROM mainboard c
                    JOIN commander_decks cd ON c.deck_id = cd.deck_id
                    UNION ALL
                    SELECT c.card_id, 0 AS is_in_commander_deck, 1 AS is_in_color_deck
                    FROM mainboard c
                    JOIN color_decks cl ON c.deck_id = cl.deck_id
                ) AS all_cards
                GROUP BY card_id
            ),
            deck_counts AS (
                SELECT
                    (SELECT COUNT(deck_id) FROM commander_decks) AS total_decks_by_commander,
                    (SELECT COUNT(deck_id) FROM color_decks) AS total_decks_by_color
            ),
            data AS (
                SELECT
                    cc.card_id,
                    cc.card_count_commander,
                    cc.card_count_color,
                    dc.total_decks_by_commander,
                    dc.total_decks_by_color,
                    ROUND((cc.card_count_commander * 100.0) / dc.total_decks_by_commander, 2) AS inclusion_percentage_commander,
                    ROUND((cc.card_count_color * 100.0) / dc.total_decks_by_color, 2) AS inclusion_percentage_color
                FROM card_counts cc, deck_counts dc
                WHERE cc.card_count_commander > 0
            ),
            sorted_data AS (
                SELECT
                    d.*,
                    bt.type_name,
                    ROUND((d.inclusion_percentage_commander - d.inclusion_percentage_color), 2) AS sinergy,
                    DENSE_RANK() OVER (
                        PARTITION BY bt.type_name
                        ORDER BY (d.inclusion_percentage_commander - d.inclusion_percentage_color) DESC, d.card_id ASC
                    ) AS rank
                FROM data d
                JOIN oracle o ON d.card_id = o.card_id
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
            )
            SELECT
                sd.*,
                o.*
            FROM sorted_data sd
            JOIN oracle o ON sd.card_id = o.card_id
            WHERE sd.rank <= $limit
            ORDER BY sd.sinergy DESC, sd.card_id ASC
        `;
        const values = { $name: name, $limit: limit };
        return await database.all(query, values);
    }
}
