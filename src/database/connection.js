import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// ES modules dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, "../../data/scrape_data_dc.db");

class Database {
    constructor() {
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const Database = sqlite3.Database;
            this.db = new Database(dbPath, (err) => {
                if (err) {
                    console.error("❌ Error opening database:", err.message);
                    reject(err);
                } else {
                    console.log("✅ Connected to SQLite database");
                    this.isConnected = true;
                    this.setupDatabase();
                    resolve();
                }
            });
        });
    }

    setupDatabase() {
        if (!this.db) return;

        // Enable foreign keys
        this.db.run("PRAGMA foreign_keys = ON", (err) => {
            if (err) console.error("Error enabling foreign keys:", err);
        });

        // Enable automatic index creation
        this.db.run("PRAGMA automatic_index = ON", (err) => {
            if (err) console.error("Error enabling automatic index:", err);
        });

        // Enable case sensitive LIKE (if needed)
        this.db.run("PRAGMA case_sensitive_like = OFF", (err) => {
            if (err) console.error("Error setting case sensitive like:", err);
        });

        // Enable checkpoint full fsync
        this.db.run("PRAGMA checkpoint_fullfsync = OFF", (err) => {
            if (err) console.error("Error setting checkpoint fullfsync:", err);
        });

        // Enable full fsync
        this.db.run("PRAGMA fullfsync = OFF", (err) => {
            if (err) console.error("Error setting fullfsync:", err);
        });

        // Disable check constraints (if you want to match the image)
        this.db.run("PRAGMA ignore_check_constraints = OFF", (err) => {
            if (err) console.error("Error setting ignore check constraints:", err);
        });

        // Set WAL mode for better concurrent access
        this.db.run("PRAGMA journal_mode = WAL", (err) => {
            if (err) console.error("Error setting WAL mode:", err);
        });

        // Set journal size limit (1 = 1KB, adjust as needed)
        this.db.run("PRAGMA journal_size_limit = -1", (err) => {
            if (err) console.error("Error setting journal size limit:", err);
        });

        // Set locking mode to normal
        this.db.run("PRAGMA locking_mode = NORMAL", (err) => {
            if (err) console.error("Error setting locking mode:", err);
        });

        // Set max page count (0 = unlimited)
        this.db.run("PRAGMA max_page_count = 0", (err) => {
            if (err) console.error("Error setting max page count:", err);
        });

        // Set page size to 4096 bytes
        this.db.run("PRAGMA page_size = 4096", (err) => {
            if (err) console.error("Error setting page size:", err);
        });

        // Disable recursive triggers
        this.db.run("PRAGMA recursive_triggers = OFF", (err) => {
            if (err) console.error("Error setting recursive triggers:", err);
        });

        // Disable secure delete
        this.db.run("PRAGMA secure_delete = OFF", (err) => {
            if (err) console.error("Error setting secure delete:", err);
        });

        // Set synchronous mode to FULL (as you had)
        this.db.run("PRAGMA synchronous = FULL", (err) => {
            if (err) console.error("Error setting synchronous mode:", err);
        });

        // Set temp store to default
        this.db.run("PRAGMA temp_store = DEFAULT", (err) => {
            if (err) console.error("Error setting temp store:", err);
        });

        // Set user version (adjust as needed)
        this.db.run("PRAGMA user_version = 0", (err) => {
            if (err) console.error("Error setting user version:", err);
        });

        // Set WAL auto checkpoint to 1000 pages
        this.db.run("PRAGMA wal_autocheckpoint = 1000", (err) => {
            if (err) console.error("Error setting WAL auto checkpoint:", err);
        });
    }

    // Promisified methods
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error("Database query error:", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error("Database query error:", err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.error("Database query error:", err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error("Error closing database:", err);
                        reject(err);
                    } else {
                        console.log("✅ Database connection closed");
                        this.isConnected = false;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Health check method
    async healthCheck() {
        try {
            const result = await this.get("SELECT 1 as test");
            return result?.test === 1;
        } catch (error) {
            console.error("Database health check failed:", error);
            return false;
        }
    }

    // Initialize or refresh views
    async initViews() {
        await database.run(`CREATE TEMP VIEW IF NOT EXISTS 
            deck_commanders AS 
                SELECT c.deck_id, c.card_id, o.color
                FROM cards c
                JOIN oracle o ON c.card_id = o.card_id
                WHERE c.side > 0;
        `);

        await database.run(`CREATE TEMP VIEW IF NOT EXISTS 
            -- Define base types with their corresponding bitmask values.
            base_types AS
            SELECT 'land' AS type_name, 1 AS type_mask UNION ALL
            SELECT 'artifact', 2 UNION ALL
            SELECT 'creature', 4 UNION ALL
            SELECT 'enchantment', 8 UNION ALL
            SELECT 'planeswalker', 16 UNION ALL
            SELECT 'battle', 32 UNION ALL
            SELECT 'instant', 64 UNION ALL
            SELECT 'sorcery', 128;
        `);

        await database.run(`CREATE TEMP VIEW IF NOT EXISTS 
            mainboard AS
                SELECT c.card_id, c.deck_id
                FROM cards c
                WHERE c.main > 0;
        `);

        const EXCLUDED_DECKS = [686777, 714327, 691341];

        //prettier-ignore
        const LEVEL = [
            // "Professional", 
            "Major", 
            "Competitive", 
            // "Regular"
        ].map((l) => l[0]);

        const EXCLUDE_PLACEHOLDERS = ["%Rareless%"];

        await database.run(`CREATE TEMP VIEW IF NOT EXISTS
            commander_groups AS
                SELECT 
                    dc.deck_id,
                    CASE
                    -- When there's only one commander for this deck
                    WHEN COUNT(*) = 1 THEN MAX(card_id)
                    -- When there are multiple commanders, concatenate them in sorted order
                    ELSE GROUP_CONCAT(card_id, '__' ORDER BY card_id)
                    END AS commander_name,
                    -- Calculate combined color identity using bitwise OR
                    ((sum(color & 1) > 0) * 1) +
                    ((sum(color & 2) > 0) * 2) +
                    ((sum(color & 4) > 0) * 4) +
                    ((sum(color & 8) > 0) * 8) +
                    ((sum(color & 16) > 0) * 16) AS color
                FROM deck_commanders dc
                LEFT JOIN decks d 
                    ON dc.deck_id = d.deck_id
                LEFT JOIN events e
                    ON d.event_id = e.event_id
                WHERE 1=1
                    AND e.level in (${LEVEL.map((l) => `'${l}'`).join(", ")})   
                    ${EXCLUDED_DECKS.map((id) => `AND dc.deck_id != ${id}`).join(" ")}
                    ${EXCLUDE_PLACEHOLDERS.map((ph) => `AND e.name NOT LIKE '${ph}'`).join(" ")}
                GROUP BY dc.deck_id;
        `);
    }
}

// Create singleton instance
const database = new Database();

// Initialize connection
await database.connect();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
    await database.close();
});

process.on("SIGINT", async () => {
    await database.close();
});

await database.initViews();

export default database;
