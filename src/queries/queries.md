```sql
WITH deck_commanders AS (
    SELECT 
        c.deck_id, 
        c.card_id, 
        o.color
    FROM Cards c
    JOIN Oracle o ON c.card_id = o.card_id
    WHERE c.side > 0  -- This is correct for commanders
),
commander_groups AS (
    SELECT 
        deck_id,
        CASE
            WHEN COUNT(*) = 1 
            THEN CAST(MAX(card_id) AS TEXT)
            ELSE GROUP_CONCAT(card_id, ' & ' ORDER BY card_id)
        END AS commander_name,
        ((sum(color & 1) > 0) * 1) +
        ((sum(color & 2) > 0) * 2) +
        ((sum(color & 4) > 0) * 4) +
        ((sum(color & 8) > 0) * 8) +
        ((sum(color & 16) > 0) * 16) as color
    FROM deck_commanders
    GROUP BY deck_id
)
SELECT
    commander_name,
    COUNT(*) as deck_count,
    color
FROM commander_groups
GROUP BY commander_name, color 
ORDER BY deck_count DESC;
```
