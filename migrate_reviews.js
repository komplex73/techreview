const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Adding 'rating' column to 'reviews' table...");
    db.run("ALTER TABLE reviews ADD COLUMN rating INTEGER DEFAULT 0", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'rating' already exists.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Successfully added 'rating' column.");
        }
    });
});

db.close();
