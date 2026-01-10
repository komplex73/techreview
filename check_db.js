const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
console.log('Checking database at:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('Error listing tables:', err);
            return;
        }
        
        console.log('Tables found:', tables.map(t => t.name));
        
        if (tables.length === 0) {
            console.log('No tables found in database.');
        }

        let pending = tables.length;
        if (pending === 0) return;

        tables.forEach(t => {
            db.get(`SELECT count(*) as count FROM ${t.name}`, (e, r) => {
                if (e) console.error(`Error counting ${t.name}:`, e);
                else console.log(`${t.name}: ${r.count} rows`);
                
                pending--;
                if (pending === 0) {
                    console.log('Done.');
                    // db.close(); // let process exit naturally
                }
            });
        });
    });
});
