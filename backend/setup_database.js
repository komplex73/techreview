const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Veritabanı dosyasının yolu
const dbPath = path.resolve(__dirname, "database.db");

// Eğer varsa eskisini sil (Temiz kurulum için)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Eski database.db silindi.");
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Veritabanı oluşturulamadı:", err.message);
  } else {
    console.log("Yeni database.db oluşturuldu ve bağlanıldı.");
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // 1. Kullanıcılar Tablosu
    db.run(`CREATE TABLE users (
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

    // 2. Kullanıcı Detayları
    db.run(`CREATE TABLE user_details (
            userId INTEGER PRIMARY KEY,
            gender TEXT,
            bio TEXT,
            age INTEGER,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

    // 3. Ürünler
    db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            description TEXT,
            image TEXT,
            createdAt TEXT,
            createdBy INTEGER,
            username TEXT
        )`);

    // 4. İncelemeler
    db.run(`CREATE TABLE reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER,
            userId INTEGER,
            user TEXT, 
            username TEXT,
            rating INTEGER,
            comment TEXT,
            content TEXT,
            date TEXT,
            createdAt TEXT,
            FOREIGN KEY(productId) REFERENCES products(id),
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

    // 5. Haberler
    db.run(`CREATE TABLE news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            summary TEXT,
            content TEXT,
            image TEXT,
            category TEXT,
            source TEXT,
            createdAt TEXT
        )`);

    // 6. Forum Konuları
    db.run(`CREATE TABLE forum_topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            category TEXT,
            userId INTEGER,
            username TEXT,
            createdAt TEXT,
            viewCount INTEGER DEFAULT 0
        )`);

    // 7. Forum Mesajları
    db.run(`CREATE TABLE forum_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topicId INTEGER,
            userId INTEGER,
            username TEXT,
            content TEXT,
            createdAt TEXT,
            FOREIGN KEY(topicId) REFERENCES forum_topics(id)
        )`);

    console.log("Tüm tablolar oluşturuldu.");
    seedData();
  });
}

function seedData() {
  const now = new Date().toISOString();

  // A. Örnek Admin Kullanıcısı Ekle
  const adminStmt = db.prepare(
    "INSERT INTO users (username, email, password, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  );
  adminStmt.run(
    "admin",
    "admin@techreview.com",
    "123456",
    "admin",
    "active",
    now
  );
  adminStmt.finalize();
  console.log("- Admin kullanıcısı eklendi (Kullanıcı: admin, Şifre: 123456)");

  // B. Örnek Haberler Ekle
  const newsData = [
    {
      title: "2025'in En İyi Android Uygulamaları",
      summary:
        "Google, 2025 yılının en iyi uygulama ve oyunlarını duyurdu. Listede yapay zeka araçları öne çıkıyor.",
      content:
        "Bu yılın kazananları arasında üretkenlik uygulamaları ve AI destekli fotoğraf editörleri başı çekiyor.",
      image:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600",
      category: "Uygulama",
      source: "Webtekno",
    },
    {
      title: "Bilim Kurgu Severler İçin Okuma Listesi",
      summary: "Dune ve Vakıf serisi, 2025 yılında da popülerliğini koruyor.",
      content:
        "Klasik bilim kurgu eserleri modern okuyucularla buluşmaya devam ediyor. İşte bu yılın en çok okunanları...",
      image:
        "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600",
      category: "Kitap",
      source: "Kitap Yurdu",
    },
    {
      title: "Yapay Zeka ve Etik Tartışmaları",
      summary:
        "AI modellerinin sanat eserlerini kullanması telif sorunlarını gündeme getirdi.",
      content:
        "Sanatçılar ve yazılımcılar arasındaki telif savaşı büyüyor. Yeni düzenlemeler yolda.",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
      category: "Yapay Zeka",
      source: "ShiftDelete",
    },
  ];

  const newsStmt = db.prepare(
    "INSERT INTO news (title, summary, content, image, category, source, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  newsData.forEach((n) =>
    newsStmt.run(
      n.title,
      n.summary,
      n.content,
      n.image,
      n.category,
      n.source,
      now
    )
  );
  newsStmt.finalize();
  console.log("- Örnek haberler eklendi.");

  // C. Örnek Forum Konuları Ekle
  const topicData = [
    {
      title: "Hangi E-Kitap okuyucuyu almalıyım? Kindle mı Kobo mu?",
      category: "Kitap",
      username: "kitapkurdu",
    },
    {
      title: "Yazılımcılar için en iyi mekanik klavye önerileri",
      category: "Aksesuar",
      username: "kod_yazari",
    },
    {
      title: "ChatGPT 5 ne zaman çıkacak bilgisi olan var mı?",
      category: "Yapay Zeka",
      username: "ai_fan",
    },
    {
      title: "Notion uygulamasını verimli kullanma taktikleri",
      category: "Uygulama",
      username: "dijital_göçebe",
    },
  ];

  const topicStmt = db.prepare(
    "INSERT INTO forum_topics (title, category, userId, username, createdAt) VALUES (?, ?, 1, ?, ?)"
  );
  topicData.forEach((t) => topicStmt.run(t.title, t.category, t.username, now));
  topicStmt.finalize();
  console.log("- Örnek forum konuları eklendi.");

  // D. Örnek Ürün İncelemesi Ekle
  const prodStmt = db.prepare(
    "INSERT INTO products (name, category, description, image, createdAt, createdBy, username) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  prodStmt.run(
    "Sony WH-1000XM5 Kulaklık",
    "Kulaklık",
    "Gürültü engelleme konusunda piyasadaki en iyi seçeneklerden biri. Ses kalitesi muazzam ancak fiyatı biraz yüksek.",
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600",
    now,
    1,
    "admin"
  );
  prodStmt.finalize();
  console.log("- Örnek ürün incelemesi eklendi.");

  // Kapat
  // db.close(); // Server açıkken kapatmaya gerek yok ama script bitince kapanması iyi olur.
  console.log(
    "✅ KURULUM TAMAMLANDI. 'node server.js' komutu ile sunucuyu başlatabilirsiniz."
  );
}
