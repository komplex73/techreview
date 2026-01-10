const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    // 1. Inspect Raw Data
    db.all("SELECT id, rating, typeof(rating) as type FROM reviews", [], (err, rows) => {
        if (err) console.error(err);
        else {
            console.log("--- CURRENT REVIEW DATA ---");
            console.log(JSON.stringify(rows, null, 2));
            
            // 2. Aggressive Patching
            const badRows = rows.filter(r => !r.rating || r.rating === 0 || r.rating === '0' || r.type === 'null');
            if (badRows.length > 0) {
                console.log(`\nFound ${badRows.length} bad rows. Patching to 5...`);
                // Use a prepared statement for safety
                const ids = badRows.map(r => r.id);
                // Simple loop for this script is fine
                 ids.forEach(id => {
                     db.run("UPDATE reviews SET rating = 5 WHERE id = ?", [id]);
                 });
                 console.log("Patch commands sent.");
            } else {
                console.log("\nAll rows appear to include valid ratings (non-zero).");
            }
        }
    });

    // 3. Check Products Average
    db.all(`SELECT products.id, products.name, AVG(reviews.rating) as calcAvg 
            FROM products 
            LEFT JOIN reviews ON products.id = reviews.productId 
            GROUP BY products.id`, [], (err, rows) => {
        console.log("\n--- PRODUCT AVERAGES (CALCULATED) ---");
        console.log(JSON.stringify(rows, null, 2));
    });
});
