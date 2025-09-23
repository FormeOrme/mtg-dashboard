import database from "../database/connection.js";

export default class CardQueries {
    static async getCardsByCommanderColor(color, limit) {
        const query = `
            WITH 

            -- Define base types with their corresponding bitmask values.
            base_types(type_name, type_mask) AS (
                VALUES
                    ('land', 1),
                    ('artifact', 2),
                    ('creature', 4),
                    ('enchantment', 8),
                    ('planeswalker', 16),
                    ('battle', 32),
                    ('instant', 64),
                    ('sorcery', 128)
            ),
            
            -- Step 1: Efficiently pre-filter for decks associated with the specific commander.
            -- This significantly reduces the dataset size for subsequent operations.
            relevant_decks AS (
                SELECT deck_id
                FROM commander_groups
                WHERE color = $1
            ),

            -- Step 2: Count the total number of relevant decks.
            -- This value is calculated once and reused, avoiding repeated subqueries.
            total_decks AS (
                SELECT COUNT(deck_id) AS deck_count
                FROM relevant_decks
            ),

            -- Step 3: Rank cards within each base type based on their frequency.
            ranked_cards AS (
                SELECT
                    bt.type_name,
                    c.card_id,
                    COUNT(c.card_id) AS card_count,
                    -- The ROW_NUMBER window function assigns a unique rank to each card within its type.
                    ROW_NUMBER() OVER (PARTITION BY bt.type_name ORDER BY COUNT(c.card_id) DESC) as rn
                FROM mainboard c
                JOIN relevant_decks rd ON c.deck_id = rd.deck_id -- Join against the pre-filtered deck list.
                JOIN oracle o ON c.card_id = o.card_id
                CROSS JOIN base_types bt
                WHERE
                    
                -- Step 4: Apply filtering logic for card types.
                    -- This ensures creatures are categorized correctly and not mixed with other types.
                    (
                    (bt.type_mask = 1 AND (o.type & 1) > 0) OR -- Include all land under the 'land' type.
                    (bt.type_mask = 4 AND (o.type & 4) > 0) OR -- Include all creatures under the 'creature' type.
                    (
                        bt.type_mask != 1 AND bt.type_mask != 4 AND
                        (o.type & bt.type_mask) > 0 AND 
                        (o.type & 1) = 0 AND (o.type & 4) = 0
                    )
                    ) -- For other types, include only non-creature cards.
                GROUP BY
                    bt.type_name, c.card_id
            )

            -- Final Selection: Combine ranked cards with total deck count for the final output.
            SELECT
                rc.type_name,
                rc.card_id,
                rc.card_count,
                td.deck_count AS total_decks,
                -- Calculate the inclusion percentage for each card.
                ROUND((rc.card_count * 100.0) / td.deck_count, 2) AS inclusion_percentage,
                o.*
            FROM ranked_cards rc, total_decks td
            JOIN oracle o ON rc.card_id = o.card_id
            WHERE rc.rn <= $2 -- Limit results to the top N cards per type.
            ORDER BY
                rc.type_name, rc.rn;
        `;

        const values = [color, limit];
        return await database.all(query, values);
    }

    static async getCardsByCommanderName(name) {
        const query = `
            WITH 

            -- Define base types with their corresponding bitmask values.
            base_types(type_name, type_mask) AS (
                VALUES
                    ('land', 1),
                    ('artifact', 2),
                    ('creature', 4),
                    ('enchantment', 8),
                    ('planeswalker', 16),
                    ('battle', 32),
                    ('instant', 64),
                    ('sorcery', 128)
            ),
            
            -- Step 1: Efficiently pre-filter for decks associated with the specific commander.
            -- This significantly reduces the dataset size for subsequent operations.
            relevant_decks AS (
                SELECT deck_id
                FROM commander_groups
                WHERE commander_name = $1
            ),

            -- Step 2: Count the total number of relevant decks.
            -- This value is calculated once and reused, avoiding repeated subqueries.
            total_decks AS (
                SELECT COUNT(deck_id) AS deck_count
                FROM relevant_decks
            ),

            -- Step 3: Rank cards within each base type based on their frequency.
            ranked_cards AS (
                SELECT
                    bt.type_name,
                    c.card_id,
                    COUNT(c.card_id) AS card_count,
                    -- The ROW_NUMBER window function assigns a unique rank to each card within its type.
                    ROW_NUMBER() OVER (PARTITION BY bt.type_name ORDER BY COUNT(c.card_id) DESC) as rn
                FROM mainboard c
                JOIN relevant_decks rd ON c.deck_id = rd.deck_id -- Join against the pre-filtered deck list.
                JOIN oracle o ON c.card_id = o.card_id
                CROSS JOIN base_types bt
                WHERE
                    
                -- Step 4: Apply filtering logic for card types.
                    -- This ensures creatures are categorized correctly and not mixed with other types.
                    ((bt.type_mask = 4 AND (o.type & 4) > 0) OR -- Include all creatures under the 'creature' type.
                    (bt.type_mask != 4 AND (o.type & bt.type_mask) > 0 AND (o.type & 4) = 0)) -- For other types, include only non-creature cards.
                GROUP BY
                    bt.type_name, c.card_id
            )

            -- Final Selection: Combine ranked cards with total deck count for the final output.
            SELECT
                rc.type_name,
                rc.card_id,
                rc.card_count,
                td.deck_count AS total_decks,
                -- Calculate the inclusion percentage for each card.
                ROUND((rc.card_count * 100.0) / td.deck_count, 2) AS inclusion_percentage,
                o.*
            FROM ranked_cards rc, total_decks td
            JOIN oracle o ON rc.card_id = o.card_id
            WHERE rc.rn <= $2 -- Limit results to the top N cards per type.
            ORDER BY
                rc.type_name, rc.rn;
        `;

        const values = [name, 50];
        return await database.all(query, values);
    }
}
