const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.all("SELECT id, productId, rating, content, createdAt FROM reviews ORDER BY id DESC LIMIT 10", (err, rows) => {
    if (err) console.error(err);
    else {
        console.log("Last 10 reviews:");
        console.table(rows);
    }
    db.close();
});
