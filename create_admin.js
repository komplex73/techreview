const sqlite3 = require("sqlite3").verbose();
const readline = require("readline");
const path = require("path");

// Veritabanı dosyasının yolu
const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("--- YÖNETİCİ HESABI OLUŞTURMA ARACI ---");
console.log("Veritabanı kontrol ediliyor...");

// Veritabanı ve Tabloları Hazırla (Eğer yoksa oluşturur)
db.serialize(() => {
  // Users tablosu yoksa oluştur (server.js çalışmadan önce bu dosyayı çalıştırırsan hata almamak için)
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        companyName TEXT,
        taxId TEXT,
        createdAt TEXT
    )`);

  // User Details tablosu
  db.run(`CREATE TABLE IF NOT EXISTS user_details (
        userId INTEGER PRIMARY KEY,
        gender TEXT,
        bio TEXT,
        age INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);
});

console.log("Tablolar hazır. Lütfen yönetici bilgilerini girin:\n");

// Kullanıcıdan bilgileri iste
rl.question("Yönetici Kullanıcı Adı: ", (username) => {
  rl.question("Yönetici E-posta: ", (email) => {
    rl.question("Yönetici Şifresi: ", (password) => {
      const createdAt = new Date().toISOString();

      // Yöneticiyi veritabanına ekle (role: 'admin', status: 'active')
      const sql = `INSERT INTO users (username, email, password, role, status, createdAt) VALUES (?, ?, ?, 'admin', 'active', ?)`;

      db.run(sql, [username, email, password, createdAt], function (err) {
        if (err) {
          console.error("\n[HATA]:", err.message);
          console.log("İpucu: Bu e-posta adresi zaten kullanılıyor olabilir.");
        } else {
          console.log("\n✅ BAŞARILI: Yönetici hesabı oluşturuldu!");
          console.log(`Kullanıcı ID: ${this.lastID}`);
          console.log(`E-posta: ${email}`);
          console.log(
            "\nArtık 'node server.js' komutuyla sunucuyu başlatıp giriş yapabilirsin."
          );
        }

        db.close();
        rl.close();
      });
    });
  });
});
