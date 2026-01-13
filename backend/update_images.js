const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const images = {
    'Telefon': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
    'Bilgisayar': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop',
    'Kulaklık': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
    'Saat': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
    'Uygulama': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop',
    'Donanım': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop'
};

db.serialize(() => {
    Object.keys(images).forEach(cat => {
        if (cat === 'default') return;
        
        console.log(`Updating images for category: ${cat}`);
        db.run("UPDATE products SET image = ? WHERE category = ?", [images[cat], cat], function(err) {
            if (err) console.error(err);
            else console.log(`Updated ${this.changes} rows for ${cat}`);
        });
    });

    // Update NULL or empty images with default
    db.run("UPDATE products SET image = ? WHERE image IS NULL OR image = ''", [images['default']]);
});

// Close later to allow async runs
setTimeout(() => db.close(), 2000);
