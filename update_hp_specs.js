const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const specs = {
  ekran: "15.6 inch Full HD",
  islemci: "i7-13620H",
  ram: "16GB",
  depolama: "1TB SSD",
  ekranKarti: "RTX 4060"
};

db.run(
  `UPDATE products SET specifications = ? WHERE id = ?`,
  [JSON.stringify(specs), 9],
  function(err) {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('✅ Specifications updated for HP Victus!');
      console.log('Changed rows:', this.changes);
    }
    db.close();
  }
);
